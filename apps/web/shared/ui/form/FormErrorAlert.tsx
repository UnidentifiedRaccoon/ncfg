import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formErrorAlertClassName } from "./styles";

export function FormErrorAlert({
  id,
  message,
  className,
  iconClassName,
}: {
  id?: string;
  message: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(formErrorAlertClassName, className)}
    >
      <AlertCircle className={cn("mt-0.5 h-5 w-5 shrink-0", iconClassName)} aria-hidden="true" />
      <span className="text-sm leading-relaxed">{message}</span>
    </div>
  );
}
