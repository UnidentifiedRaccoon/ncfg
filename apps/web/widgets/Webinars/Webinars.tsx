import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui";

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
  tableWrap: string;
  row: string;
  rowDivider: string;
  topicCell: string;
  topicHeader: string;
  topicNumber: string;
  topicTitle: string;
  detailsCell: string;
  detailsList: string;
  detailsItem: string;
  detailsBullet: string;
}

const variantStyles: Record<WebinarsVariant, VariantStyle> = {
  "executive-rail": {
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
    topicHeader: "flex items-start gap-3.5 md:gap-4",
    topicNumber:
      "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10 px-2 text-sm font-mono font-semibold tracking-wide text-[#1E3A5F] md:h-9 md:min-w-9 md:text-[15px]",
    topicTitle:
      "text-[22px] leading-[1.24] tracking-tight text-[#27374A] md:text-[26px] lg:text-[30px]",
    detailsCell: "p-5 md:p-6",
    detailsList: "space-y-2.5",
    detailsItem: "flex items-start gap-3 text-[15px] leading-relaxed text-[#516273] md:text-[16px]",
    detailsBullet:
      "mt-[10px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A8FA8]",
  },
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

function pad2(value: number): string {
  return String(value).padStart(2, "0");
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
    <Section
      id={id}
      title={title}
      className={cn(
        "bg-[radial-gradient(circle_at_24%_42%,rgba(88,168,224,0.10),transparent_52%),radial-gradient(circle_at_76%_58%,rgba(59,130,246,0.07),transparent_50%),linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_14%,#F8FBFF_30%,#F4F9FF_70%,#FFFFFF_86%,#FFFFFF_100%)]",
        className
      )}
    >
      {normalizedWebinars.length > 0 && (
        <div className={styles.tableWrap}>
          {normalizedWebinars.map((webinar, webinarIndex) => {
            const lessonCode = pad2(webinarIndex + 1);

            return (
              <section
                key={`${webinar.title}-${webinarIndex}`}
                className={cn(
                  styles.row,
                  webinarIndex > 0 && styles.rowDivider
                )}
              >
                <div className={styles.topicCell}>
                  <div className={styles.topicHeader}>
                    <span aria-hidden className={styles.topicNumber}>
                      {lessonCode}
                    </span>
                    <h3 className={cn("font-semibold", styles.topicTitle)}>
                      <span className="sr-only">
                        Урок {webinarIndex + 1}:{" "}
                      </span>
                      {webinar.title}
                    </h3>
                  </div>
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
            );
          })}
        </div>
      )}
    </Section>
  );
}
