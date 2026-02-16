import type { FooterVariant } from "./footer-theme";

export function FooterBackdrop({ variant }: { variant: FooterVariant }) {
  if (variant === "navy") {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    );
  }

  if (variant === "light") {
    return (
      <>
        <div aria-hidden="true" className="absolute inset-0 bg-[#F8FAFC]" />
        <div
          aria-hidden="true"
          className="absolute -top-56 -left-56 h-[720px] w-[720px] rounded-full bg-[#3B82F6]/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-72 left-1/3 h-[820px] w-[820px] rounded-full bg-[#58A8E0]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -top-72 -right-56 h-[760px] w-[760px] rounded-full bg-[#1E3A5F]/[0.07] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(30,58,95,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.12)_1px,transparent_1px)] bg-[size:56px_56px]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/70"
        />
      </>
    );
  }

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 bg-[#050B16]" />

      <div
        aria-hidden="true"
        className="absolute -top-48 -left-48 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 left-1/4 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -top-56 -right-40 h-[620px] w-[620px] rounded-full bg-[#1E3A5F]/55 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/55"
      />
    </>
  );
}

