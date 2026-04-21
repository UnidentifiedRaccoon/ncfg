import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import {
  formConsentBoxClassName,
  formConsentCheckboxClassName,
  formConsentRowClassName,
} from "./styles";

type ConsentVariant = "lead" | "compact";

export function FormPrivacyConsent({
  id,
  checked,
  onCheckedChange,
  required,
  variant = "lead",
  className,
  policyLinkClassName = "font-semibold text-[#3B82F6] hover:underline",
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  required?: boolean;
  variant?: ConsentVariant;
  className?: string;
  policyLinkClassName?: string;
}) {
  const boxClass =
    variant === "compact"
      ? cn("mt-6", formConsentBoxClassName, className)
      : cn(formConsentBoxClassName, className);

  const labelClass =
    variant === "compact"
      ? "text-sm leading-6 text-[#475569]"
      : "text-sm text-[#475569] leading-relaxed";

  return (
    <div className={cn(boxClass, formConsentRowClassName)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={formConsentCheckboxClassName}
        required={required}
      />
      <label htmlFor={id} className={labelClass}>
        Согласен(на) на обработку персональных данных и принимаю{" "}
        <Link
          href="/politika-konfidencialnosti"
          className={policyLinkClassName}
        >
          политику конфиденциальности
        </Link>
        .
      </label>
    </div>
  );
}
