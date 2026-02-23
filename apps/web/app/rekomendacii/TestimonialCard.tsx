"use client";

import { useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  company: string;
  logoImg: string;
  quote: string;
  author: string;
  role: string;
}

export function TestimonialCard({
  company,
  logoImg,
  quote,
  author,
  role,
}: TestimonialCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = company.trim().slice(0, 1).toUpperCase();

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(600px_300px_at_0%_0%,rgba(59,130,246,0.08),transparent_60%)]"
      />
      <div className="relative z-10 p-6 md:p-8">
        <Quote
          size={32}
          className="mb-4 text-[#58A8E0]/30"
          aria-hidden="true"
        />

        <blockquote className="text-[15px] leading-relaxed text-[#475569]">
          {quote}
        </blockquote>

        <div className="mt-6 flex items-center gap-3 border-t border-[#E2E8F0] pt-5">
          <div className="relative h-10 w-10 shrink-0 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden flex items-center justify-center">
            {logoImg && !imageFailed ? (
              <Image
                src={logoImg}
                alt={company}
                fill
                sizes="40px"
                className="object-contain p-1.5"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="text-sm font-bold text-[#1E3A5F]">
                {initial}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#1E3A5F] truncate">
              {author}
            </div>
            <div className="text-xs text-[#94A3B8] truncate">
              {role}, {company}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
