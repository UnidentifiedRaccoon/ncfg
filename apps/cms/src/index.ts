export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const rubrics = [
      { title: 'Новости', slug: 'news', order: 10 },
      { title: 'Анонс', slug: 'announce', order: 20 },
      { title: 'Пострелиз', slug: 'postrelease', order: 30 },
      { title: 'Статьи', slug: 'articles', order: 40 },
      { title: 'Исследования', slug: 'research', order: 50 },
    ];

    const categoryQuery = strapi.db.query('api::blog-category.blog-category');

    // Seed rubrics (idempotent).
    for (const rubric of rubrics) {
      const existing = await categoryQuery.findOne({ where: { slug: rubric.slug } });
      if (!existing) {
        await categoryQuery.create({
          data: {
            title: rubric.title,
            slug: rubric.slug,
            order: rubric.order,
          },
        });
        strapi.log.info(`[blog] Created rubric: ${rubric.slug}`);
        continue;
      }

      const needsUpdate =
        existing.title !== rubric.title ||
        Number(existing.order ?? 0) !== rubric.order;

      if (needsUpdate) {
        await categoryQuery.update({
          where: { id: existing.id },
          data: {
            title: rubric.title,
            order: rubric.order,
          },
        });
        strapi.log.info(`[blog] Updated rubric: ${rubric.slug}`);
      }
    }

    // Ensure every news-article has a category (required field).
    const defaultRubricSlug = 'news';
    const defaultCategory = await categoryQuery.findOne({ where: { slug: defaultRubricSlug } });
    if (!defaultCategory) {
      strapi.log.warn('[blog] Default rubric not found; skipping category backfill.');
      return;
    }

    const shouldTryTagMigration = process.env.MIGRATE_NEWS_TAGS_TO_CATEGORY === '1';
    const newsQuery = strapi.db.query('api::news-article.news-article');

    // Strapi schema may not include the legacy `tags` relation anymore; treat migration as best-effort.
    const newsContentType = strapi.contentTypes?.['api::news-article.news-article'];
    const hasLegacyTags = Boolean(newsContentType?.attributes?.tags);

    // Fetch only what we need; populate tags only if available and migration is enabled.
    let withoutCategory = [];
    try {
      withoutCategory = await newsQuery.findMany({
        where: { category: null },
        select: ['id'],
        ...(shouldTryTagMigration && hasLegacyTags
          ? { populate: { tags: { select: ['slug', 'name'] } } }
          : {}),
      });
    } catch (error) {
      // Different DBs/Strapi versions might require a different null-check; fallback to no-op.
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.warn(`[blog] Failed to query news-articles without category: ${message}`);
      return;
    }

    if (!Array.isArray(withoutCategory) || withoutCategory.length === 0) return;

    const rubricSlugs = new Set(rubrics.map((r) => r.slug));
    const titleBySlug = new Map(rubrics.map((r) => [r.slug, r.title]));

    const normalize = (value) => String(value ?? '').trim().toLowerCase();

    const categoriesBySlug = new Map();
    const allCategories = await categoryQuery.findMany({ select: ['id', 'slug', 'title'] });
    for (const cat of allCategories) {
      if (!cat?.slug) continue;
      categoriesBySlug.set(cat.slug, cat);
    }

    const resolveCategoryId = (slug) => {
      const cat = categoriesBySlug.get(slug);
      return cat?.id ?? defaultCategory.id;
    };

    const resolveSlugFromLegacyTags = (tags) => {
      if (!Array.isArray(tags) || tags.length === 0) return defaultRubricSlug;
      for (const tag of tags) {
        const slug = normalize(tag?.slug);
        if (rubricSlugs.has(slug)) return slug;

        const name = normalize(tag?.name);
        // Match by rubric title (ru) as a fallback.
        for (const candidate of rubrics) {
          if (normalize(candidate.title) === name) return candidate.slug;
        }
      }
      return defaultRubricSlug;
    };

    let updated = 0;
    const unknownLegacyTags = new Set();

    for (const item of withoutCategory) {
      const legacyTags = item?.tags;
      const chosenSlug =
        shouldTryTagMigration && hasLegacyTags ? resolveSlugFromLegacyTags(legacyTags) : defaultRubricSlug;

      if (shouldTryTagMigration && hasLegacyTags && chosenSlug === defaultRubricSlug) {
        for (const tag of Array.isArray(legacyTags) ? legacyTags : []) {
          const label = normalize(tag?.slug) || normalize(tag?.name);
          if (label && !rubricSlugs.has(label)) unknownLegacyTags.add(label);
        }
      }

      try {
        await newsQuery.update({
          where: { id: item.id },
          data: { category: resolveCategoryId(chosenSlug) },
        });
        updated += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.warn(
          `[blog] Failed to backfill category for news-article id=${item?.id}: ${message}`
        );
      }
    }

    const summaryTitle = titleBySlug.get(defaultRubricSlug) ?? defaultRubricSlug;
    strapi.log.info(`[blog] Backfilled category for ${updated} news-articles (default: ${summaryTitle}).`);

    if (shouldTryTagMigration && hasLegacyTags && unknownLegacyTags.size > 0) {
      strapi.log.info(
        `[blog] Legacy tags not mapped to rubrics: ${Array.from(unknownLegacyTags).slice(0, 30).join(', ')}`
      );
    }
  },
};
