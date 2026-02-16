export const FOOTER_NAVIGATION = [
  { label: "Частным лицам", href: "/individuals" },
  { label: "Компаниям", href: "/companies" },
  { label: "О центре", href: "/about" },
  { label: "Блог", href: "/blog" },
] as const;

export type FooterNavigationItem = (typeof FOOTER_NAVIGATION)[number];

