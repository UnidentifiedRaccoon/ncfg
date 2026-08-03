import { fetchHeaderCompanyNavigation } from "@/shared/api/data-provider";
import { withCmsFallback } from "@/shared/lib/cms-fallback";

import { HeaderClient } from "./HeaderClient";
import {
  COMPANY_NAVIGATION,
  type CompanyNavigationCategory,
} from "./companyNavigation";

async function loadCompanyNavigation(): Promise<
  readonly CompanyNavigationCategory[]
> {
  return withCmsFallback<readonly CompanyNavigationCategory[]>(
    async () => {
      const categories = await fetchHeaderCompanyNavigation();
      if (categories.length === 0) {
        throw new Error("CMS returned an empty company navigation");
      }

      return categories.map((category) => ({
        id: category.id,
        title: category.title,
        services: category.services.map((service) => ({
          title: service.title,
          href: `/companies/${service.slug}`,
        })),
      }));
    },
    {
      label: "header company navigation",
      fallback: COMPANY_NAVIGATION,
    }
  );
}

export async function Header() {
  const companyNavigation = await loadCompanyNavigation();

  return <HeaderClient companyNavigation={companyNavigation} />;
}
