import {
  Header,
  Hero,
  Products,
  Services,
  Partners,
  News,
  FAQ,
  LeadForm,
  Footer,
} from "@/widgets";
import homeData from "@/public/content/home.json";

export default function Home() {
  const { sections } = homeData;

  return (
    <>
      <Header />
      <main>
        <Hero
          headline="Более 20 лет помогаем клиентам разбираться в финансах — от программ для детей до федеральных инициатив"
          primaryCta={sections.Hero.data.primaryCta}
        />
        <Products />
        <Services
          title={sections.Services.data.title}
          services={sections.Services.data.services}
        />
        <Partners
          clientsCarousel={sections.Partners.data.clientsCarousel}
          testimonials={sections.Partners.data.testimonials}
        />
        <LeadForm />
        <FAQ title={sections.FAQ.data.title} items={[]} />
        <News
          title={sections.News.data.title}
          items={[]}
          archiveHref={sections.News.data.links[0]?.href}
        />
      </main>
      <Footer data={sections.Footer.data} />
    </>
  );
}
