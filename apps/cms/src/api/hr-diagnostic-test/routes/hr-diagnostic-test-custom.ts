export default {
  routes: [
    {
      method: "GET",
      path: "/hr-diagnostic-tests/active/:slug",
      handler: "hr-diagnostic-test.active",
      config: {},
    },
  ],
};
