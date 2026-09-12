import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Reveal } from "@/shared/ui/Reveal";
import { ASSET_PATH, FINANCIAL_GAMES_PATH, companyGamesCopy } from "./content";
import styles from "./financial-games-catalog.module.css";

export function FinancialGamesCatalogBlock() {
  const id = "services-financial-games";
  return <section id={id} className={`${styles.theme} ${styles.serviceBlock}`} aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`} className={styles.title}>{companyGamesCopy.title}</h3>
    <Reveal variant="card" className={styles.panel}>
      <div className={styles.copy}>
        <p className={styles.description}>{companyGamesCopy.description}</p>
        <nav className={styles.formats} aria-label="Форматы финансовых игр">
          {companyGamesCopy.formats.map(format => <Link key={format.id} href={`${FINANCIAL_GAMES_PATH}#${format.id}`}>
            <span><strong>{format.title}</strong><span>{format.description}</span></span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>)}
        </nav>
        <Button href={FINANCIAL_GAMES_PATH} className={styles.action}>{companyGamesCopy.action}<ArrowUpRight size={18} aria-hidden="true" /></Button>
      </div>
      <div className={styles.photo}>
        <Image src={`${ASSET_PATH}/game-company.webp`} alt="Участники обсуждают ход за столом с полем, карточками и фишками финансовой игры" width={1672} height={941} unoptimized />
      </div>
    </Reveal>
  </section>;
}
