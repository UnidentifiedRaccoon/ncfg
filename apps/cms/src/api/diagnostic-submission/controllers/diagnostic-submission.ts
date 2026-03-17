import { factories } from "@strapi/strapi";

const SUBMISSION_UID = "api::diagnostic-submission.diagnostic-submission";

function sendError(ctx: any, status: number, message: string) {
  ctx.status = status;
  ctx.body = {
    error: {
      status,
      name: status === 404 ? "NotFoundError" : "ApplicationError",
      message,
    },
  };
}

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
      const campaignDocumentId = parseQueryValue(ctx.query?.campaign);
      if (!campaignDocumentId) {
        sendError(ctx, 400, "Параметр campaign обязателен");
        return;
      }

      const result = await strapi.service(SUBMISSION_UID).exportCampaignCsv({
        campaignDocumentId,
        from: parseQueryValue(ctx.query?.from),
        to: parseQueryValue(ctx.query?.to),
      });

      if (!result) {
        sendError(ctx, 404, "Кампания не найдена");
        return;
      }

      ctx.set("Content-Type", "text/csv; charset=utf-8");
      ctx.set(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`
      );
      ctx.body = result.csv;
    },

    async adminCampaigns(ctx: any) {
      const campaigns = await strapi.service(SUBMISSION_UID).listCampaignOptions();
      ctx.body = { data: campaigns };
    },

    async adminExport(ctx: any) {
      const campaignDocumentId = parseQueryValue(ctx.query?.campaign);
      if (!campaignDocumentId) {
        sendError(ctx, 400, "Параметр campaign обязателен");
        return;
      }

      const result = await strapi.service(SUBMISSION_UID).exportCampaignCsv({
        campaignDocumentId,
        from: parseQueryValue(ctx.query?.from),
        to: parseQueryValue(ctx.query?.to),
      });

      if (!result) {
        sendError(ctx, 404, "Кампания не найдена");
        return;
      }

      ctx.set("Content-Type", "text/csv; charset=utf-8");
      ctx.set(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`
      );
      ctx.body = result.csv;
    },
  })
);
