import {
  fetchBlogPageData,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import {
  isBlogLayoutVariant,
  isBlogRubricSlug,
  type BlogLayoutVariant,
  type BlogRubricSlug,
} from "@/shared/lib/blog-rubrics";
import { makeFooterData } from "@/shared/lib/footer-data";

type SearchParams = Record<string, string | string[] | undefined>;

function parseCategory(value: unknown): BlogRubricSlug | undefined {
  return typeof value === "string" && isBlogRubricSlug(value) ? value : undefined;
}

function parseLayout(value: unknown): BlogLayoutVariant {
  return typeof value === "string" && isBlogLayoutVariant(value) ? value : "rail";
}

export async function getBlogPageModel(searchParams?: SearchParams | Promise<SearchParams>) {
  const sp = await Promise.resolve(searchParams ?? {});

  const selectedCategory = parseCategory(sp.category);
  const layout = parseLayout(sp.layout);

  const [siteSetting, blogPage, posts] = await Promise.all([
    fetchSiteSettings(),
    fetchBlogPageData(),
    fetchNewsArticles({ category: selectedCategory }),
  ]);

  return {
    blogPostsProps: {
      title: blogPage.title,
      lead: blogPage.lead ?? undefined,
      posts,
      selectedCategory,
      layout,
    },
    footerData: makeFooterData(siteSetting),
  };
}
