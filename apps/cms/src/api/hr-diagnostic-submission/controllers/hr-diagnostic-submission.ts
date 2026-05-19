import { factories } from "@strapi/strapi";

const SUBMISSION_UID = "api::hr-diagnostic-submission.hr-diagnostic-submission";

function parseQueryValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export default factories.createCoreController(
  SUBMISSION_UID,
  ({ strapi }: { strapi: any }) => ({
    async intake(ctx: any) {
      const result = await strapi.service(SUBMISSION_UID).createFromIntake(ctx.request.body);
      ctx.body = { data: result };
    },

    async exportCsv(ctx: any) {
      const result = await strapi.service(SUBMISSION_UID).exportHrCsv({
        from: parseQueryValue(ctx.query?.from),
        to: parseQueryValue(ctx.query?.to),
      });

      ctx.set("Content-Type", "text/csv; charset=utf-8");
      ctx.set("Content-Disposition", `attachment; filename="${result.fileName}"`);
      ctx.body = result.csv;
    },
  })
);
