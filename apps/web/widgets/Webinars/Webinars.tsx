import { cn } from "@/shared/lib/cn";

export type WebinarsVariant = "executive-rail";

export interface WebinarGroup {
  title: string;
  items: string[];
}

export interface WebinarsProps {
  id?: string;
  title?: string;
  webinars: WebinarGroup[];
  variant?: WebinarsVariant;
  className?: string;
}

interface VariantStyle {
  shell: string;
  shellGlow: string;
  badge: string;
  title: string;
  tableWrap: string;
  row: string;
  rowDivider: string;
  topicCell: string;
  topicText: string;
  detailsCell: string;
  detailsList: string;
  detailsItem: string;
  detailsBullet: string;
}

const variantStyles: Record<WebinarsVariant, VariantStyle> = {
  "executive-rail": {
    shell: [
      "border-[#D6E2F1] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)]",
      "shadow-[0_18px_40px_rgba(15,23,42,0.07)]",
    ].join(" "),
    shellGlow:
      "bg-[radial-gradient(circle_at_14%_0%,rgba(124,194,255,0.18),transparent_56%),radial-gradient(circle_at_92%_12%,rgba(59,130,246,0.12),transparent_52%)]",
    badge: "border-[#C7DDFB] bg-[#EAF2FF] text-[#1D4ED8]",
    title: "text-[#173E66]",
    tableWrap: [
      "overflow-hidden rounded-2xl border border-[#CBD8EA] bg-white",
      "shadow-[0_10px_30px_rgba(15,23,42,0.06)]",
    ].join(" "),
    row: [
      "grid grid-cols-1 md:grid-cols-[minmax(260px,42%)_1fr]",
      "transition-colors duration-200 hover:bg-[#F8FBFF]",
    ].join(" "),
    rowDivider: "border-t border-[#CBD8EA]",
    topicCell:
      "border-b border-[#CBD8EA] p-5 md:border-b-0 md:border-r md:border-[#CBD8EA] md:p-6",
    topicText:
      "text-[30px] leading-[1.18] tracking-tight text-[#27374A] md:text-[38px] lg:text-[42px]",
    detailsCell: "p-5 md:p-6",
    detailsList: "space-y-2.5",
    detailsItem: "flex items-start gap-3 text-[15px] leading-relaxed text-[#516273] md:text-[16px]",
    detailsBullet:
      "mt-[10px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A8FA8]",
  },
};

const variantLabels: Record<WebinarsVariant, string> = {
  "executive-rail": "Executive Rail",
};

function normalizeWebinars(webinars: WebinarGroup[]): WebinarGroup[] {
  return webinars
    .map((webinar) => {
      const title = webinar.title.trim();
      const items = webinar.items
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      return { title, items };
    })
    .filter((webinar) => webinar.title.length > 0 || webinar.items.length > 0);
}

export function Webinars({
  id,
  title = "Вебинары",
  webinars,
  variant = "executive-rail",
  className,
}: WebinarsProps) {
  const normalizedWebinars = normalizeWebinars(webinars);

  if (!normalizedWebinars.length) {
    return null;
  }

  const styles = variantStyles[variant];

  return (
    <article
      id={id}
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] border p-5 md:p-7 lg:p-8",
        styles.shell,
        className
      )}
    >
      <div aria-hidden className={cn("pointer-events-none absolute inset-0", styles.shellGlow)} />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
              styles.badge
            )}
          >
            {variantLabels[variant]}
          </span>
          <h3
            className={cn(
              "text-xl font-semibold tracking-tight md:text-[26px]",
              styles.title
            )}
          >
            {title}
          </h3>
        </div>

        {normalizedWebinars.length > 0 && (
          <div className={cn("mt-6 md:mt-7", styles.tableWrap)}>
            {normalizedWebinars.map((webinar, webinarIndex) => (
              <section
                key={`${webinar.title}-${webinarIndex}`}
                className={cn(
                  styles.row,
                  webinarIndex > 0 && styles.rowDivider
                )}
              >
                <div className={styles.topicCell}>
                  <h4 className={cn("font-semibold", styles.topicText)}>
                    {webinar.title}
                  </h4>
                </div>

                <div className={styles.detailsCell}>
                  <ul className={styles.detailsList}>
                    {webinar.items.map((item, itemIndex) => (
                      <li
                        key={`${webinar.title}-${itemIndex}`}
                        className={styles.detailsItem}
                      >
                        <span aria-hidden className={styles.detailsBullet} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
