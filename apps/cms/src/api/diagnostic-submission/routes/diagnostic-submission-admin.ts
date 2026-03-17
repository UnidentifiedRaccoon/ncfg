export default {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/diagnostic-tools/campaigns",
      handler: "diagnostic-submission.adminCampaigns",
      config: {},
    },
    {
      method: "GET",
      path: "/diagnostic-tools/export",
      handler: "diagnostic-submission.adminExport",
      config: {},
    },
  ],
};
