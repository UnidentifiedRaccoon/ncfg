"use client";

import { useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

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
  const prefersReducedMotion = useReducedMotion();
  const initial = company.trim().slice(0, 1).toUpperCase();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-[#DDE6F2] bg-white/92 shadow-sm transition-shadow hover:shadow-[0_20px_42px_rgba(36,80,154,0.16)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(600px_300px_at_0%_0%,rgba(59,130,246,0.08),transparent_60%)]"
      />
      <div className="relative z-10 p-6 md:p-8">
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1, 1.08, 1], opacity: [0.45, 0.9, 0.45] }
          }
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4 inline-block"
        >
          <Quote
            size={32}
            className="text-[#4FC3F7]/40"
            aria-hidden="true"
          />
        </motion.div>

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
    </motion.article>
  );
}
