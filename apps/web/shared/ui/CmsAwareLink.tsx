import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { shouldUseNativeDocumentNavigation } from "@/shared/lib/cms-routes";

type CmsAwareLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Pick<LinkProps, "prefetch" | "replace" | "scroll"> & {
    href: string;
  };

export const CmsAwareLink = forwardRef<HTMLAnchorElement, CmsAwareLinkProps>(
  function CmsAwareLink(
    { href, prefetch, replace, scroll, ...anchorProps },
    ref
  ) {
    if (shouldUseNativeDocumentNavigation(href)) {
      return <a href={href} ref={ref} {...anchorProps} />;
    }

    return (
      <Link
        href={href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        ref={ref}
        {...anchorProps}
      />
    );
  }
);
