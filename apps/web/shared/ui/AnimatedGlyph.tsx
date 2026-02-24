"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileText, Mail, MapPin, Phone } from "lucide-react";

interface AnimatedGlyphProps {
  icon: "phone" | "mail" | "map-pin" | "file-text";
  className?: string;
  size?: number;
}

const ICON_MAP = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  "file-text": FileText,
} as const;

export function AnimatedGlyph({ icon, className, size = 14 }: AnimatedGlyphProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = ICON_MAP[icon];

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      animate={
        prefersReducedMotion
          ? undefined
          : { y: [0, -1, 0], opacity: [0.8, 1, 0.8], scale: [1, 1.06, 1] }
      }
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon size={size} />
    </motion.span>
  );
}
