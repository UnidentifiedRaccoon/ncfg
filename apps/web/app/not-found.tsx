import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";
import { NotFoundTracker } from "@/shared/ui/NotFoundTracker";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <NotFoundTracker />
      <p className="text-sm font-semibold tracking-wide text-[#3B82F6]">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-4xl">
        Страница не найдена
      </h1>
      <p className="mt-4 text-base text-[#475569]">
        Возможно, она была перемещена или удалена.
      </p>
      <CmsAwareLink
        href="/"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#5485d5] px-6 text-base font-semibold text-white transition-colors hover:bg-[#4874c4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
      >
        На главную
      </CmsAwareLink>
    </div>
  );
}
