import { factories } from "@strapi/strapi";

const TEST_UID = "api::hr-diagnostic-test.hr-diagnostic-test";

function parseSlug(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export default factories.createCoreController(
  TEST_UID,
  ({ strapi }: { strapi: any }) => ({
    async active(ctx: any) {
      const slug = parseSlug(ctx.params?.slug);
      if (!slug) {
        ctx.status = 400;
        ctx.body = {
          error: {
            status: 400,
            name: "ValidationError",
            message: "Параметр slug обязателен",
          },
        };
        return;
      }

      const result = await strapi.service(TEST_UID).findActiveBySlug(slug);
      if (!result) {
        ctx.status = 404;
        ctx.body = {
          error: {
            status: 404,
            name: "NotFoundError",
            message: "Активная HR-методика не найдена",
          },
        };
        return;
      }

      ctx.body = { data: result };
    },
  })
);
