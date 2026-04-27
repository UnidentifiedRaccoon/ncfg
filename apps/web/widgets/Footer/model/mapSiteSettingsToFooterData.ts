import type { StrapiSiteSetting } from "@/shared/api/types/strapi";
import type { FooterData } from "../Footer";

export function mapSiteSettingsToFooterData(
  siteSetting: StrapiSiteSetting
): FooterData {
  return {
    organization: {
      fullName: siteSetting.organizationFullName,
      shortName: siteSetting.organizationShortName,
    },
    contacts: {
      phone: siteSetting.contactsPhone,
      email: siteSetting.contactsEmail,
    },
    social: siteSetting.socialLinks.map((link) => ({
      label: link.label,
      href: link.href,
    })),
    legalLinks: siteSetting.legalLinks.map((link) => ({
      label: link.label,
      href: link.href,
    })),
    legalDocuments: {
      title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
      items: siteSetting.legalDocuments.map((document) => ({
        label: document.label,
        href: document.href,
        type: document.type,
      })),
    },
    copyright: {
      years: siteSetting.copyrightYears ?? "",
      text: siteSetting.copyrightText ?? "",
      notice: siteSetting.copyrightNotice ?? "",
    },
  };
}
