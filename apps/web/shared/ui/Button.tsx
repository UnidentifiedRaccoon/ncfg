import { cn } from "@/shared/lib/cn";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(95deg,#2757B0_0%,#3D7CFF_35%,#30D7FF_68%,#8A5CFF_100%)] bg-[length:180%_100%] text-white shadow-[0_18px_34px_rgba(61,124,255,0.33)] hover:bg-[position:100%_0] hover:shadow-[0_22px_40px_rgba(48,215,255,0.32)] active:scale-[0.985]",
  secondary:
    "border border-[#4F7FE3]/30 bg-white/78 text-[#24467F] hover:border-[#4F7FE3]/50 hover:bg-white",
  ghost:
    "bg-transparent text-[#315FCC] hover:bg-[#4F7FE3]/[0.12]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-9 text-lg",
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button({ variant = "primary", size = "md", className, children, ...props }, ref) {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-[transform,box-shadow,background-position,color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] disabled:opacity-50 disabled:pointer-events-none";

    const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if ("href" in props && props.href) {
      const { href, ...linkProps } = props as ButtonAsLink;

      // Use native <a> for anchor links (handled by SmoothAnchor)
      if (href.startsWith("#")) {
        return (
          <a
            href={href}
            className={classes}
            ref={ref as React.Ref<HTMLAnchorElement>}
            {...linkProps}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          href={href}
          className={classes}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...linkProps}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        className={classes}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...(props as ButtonAsButton)}
      >
        {children}
      </button>
    );
  }
);
