import { cn } from "@/shared/lib/cn";
import { formLabelClassName } from "./styles";

export function FormFieldLabel({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn(formLabelClassName, "mb-2", className)}>
      {children}
      {required ? <span className="text-[#3B82F6]"> *</span> : null}
    </label>
  );
}
