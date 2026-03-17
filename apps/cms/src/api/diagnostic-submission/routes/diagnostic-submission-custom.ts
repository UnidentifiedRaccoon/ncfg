export default {
  routes: [
    {
      method: "POST",
      path: "/diagnostic-submissions/intake",
      handler: "diagnostic-submission.intake",
      config: {},
    },
    {
      method: "GET",
      path: "/diagnostic-submissions/export",
      handler: "diagnostic-submission.exportCsv",
      config: {},
    },
  ],
};
