import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";

interface FormFieldLabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
  requiredMarkClassName?: string;
}

const baseLabelClassName = "block text-sm font-medium text-[#1E3A5F]";
const defaultRequiredMarkClassName = "text-[#3B82F6]";

export function FormFieldLabel({
  htmlFor,
  children,
  required,
  className,
  requiredMarkClassName,
}: FormFieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn(baseLabelClassName, className)}>
      {children}
      {required && (
        <span className={cn(requiredMarkClassName ?? defaultRequiredMarkClassName)}>
          {" "}
          *
        </span>
      )}
    </label>
  );
}
