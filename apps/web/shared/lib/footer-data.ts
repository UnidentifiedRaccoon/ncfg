import type { StrapiSiteSetting } from "@/shared/api/types/strapi";

export interface FooterLegalDocument {
  label: string;
  href: string;
  type: string;
}

export interface FooterData {
  organization: {
    fullName: string;
    shortName: string;
  };
  contacts: {
    phone: string;
    email: string;
    legalAddress: string;
  };
  social: Array<{
    label: string;
    href: string;
  }>;
  legalLinks: Array<{
    label: string;
    href: string;
  }>;
  legalDocuments: {
    title: string;
    items: FooterLegalDocument[];
  };
  copyright: {
    years: string;
    text: string;
    notice: string;
  };
}

export function makeFooterData(siteSetting: StrapiSiteSetting): FooterData {
  return {
    organization: {
      fullName: siteSetting.organizationFullName,
      shortName: siteSetting.organizationShortName,
    },
    contacts: {
      phone: siteSetting.contactsPhone,
      email: siteSetting.contactsEmail,
      legalAddress: siteSetting.contactsLegalAddress ?? "",
    },
    social: siteSetting.socialLinks.map((l) => ({ label: l.label, href: l.href })),
    legalLinks: siteSetting.legalLinks.map((l) => ({ label: l.label, href: l.href })),
    legalDocuments: {
      title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
      items: siteSetting.legalDocuments.map((d) => ({
        label: d.label,
        href: d.href,
        type: d.type,
      })),
    },
    copyright: {
      years: siteSetting.copyrightYears ?? "",
      text: siteSetting.copyrightText ?? "",
      notice: siteSetting.copyrightNotice ?? "",
    },
  };
}

