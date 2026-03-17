export default {
  config: {
    locales: ['ru', 'en'],
    translations: {
      ru: {
        'app.components.LeftMenu.navbrand.title': 'NCFG CMS',
        'app.components.LeftMenu.navbrand.workplace': 'Панель управления',
      },
    },
  },
  register(app: {
    addSettingsLink: (
      section: { id: string; intlLabel: { id: string; defaultMessage: string } },
      link: {
        id: string;
        to: string;
        intlLabel: { id: string; defaultMessage: string };
        permissions: [];
        Component: () => Promise<{ default: React.ComponentType }>;
      }
    ) => void;
  }) {
    app.addSettingsLink(
      {
        id: "diagnostics",
        intlLabel: {
          id: "diagnostics.settings.section",
          defaultMessage: "Диагностика",
        },
      },
      {
        id: "diagnostics-export",
        to: "diagnostics/export",
        intlLabel: {
          id: "diagnostics.settings.export",
          defaultMessage: "Экспорт результатов",
        },
        permissions: [],
        Component: async () => import("./pages/DiagnosticsExportPage"),
      }
    );
  },
  bootstrap() {},
};
