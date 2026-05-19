export default {
  routes: [
    {
      method: "POST",
      path: "/hr-diagnostic-submissions/intake",
      handler: "hr-diagnostic-submission.intake",
      config: {},
    },
    {
      method: "GET",
      path: "/hr-diagnostic-submissions/export",
      handler: "hr-diagnostic-submission.exportCsv",
      config: {},
    },
  ],
};
