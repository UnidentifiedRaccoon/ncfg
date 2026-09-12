"use client";

import { Button } from "@/shared/ui/Button";
import { Section } from "@/shared/ui/Section";

export default function BlogPostError({ reset }: { reset: () => void }) {
  return (
    <main>
      <Section className="min-h-[50vh]" containerClassName="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-4xl">
          Не удалось загрузить статью
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-[#475569]">
          Попробуйте ещё раз через несколько минут или вернитесь в блог.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>Попробовать ещё раз</Button>
          <Button href="/blog" variant="secondary">Открыть блог</Button>
        </div>
      </Section>
    </main>
  );
}
