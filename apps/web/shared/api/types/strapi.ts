/**
 * Strapi API Response Types
 * 
 * These types match the Strapi 5 REST API response structure.
 */

// ==================
// Generic Types
// ==================

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number | null;
  height: number | null;
  size: number;
  url: string;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
}

export type StrapiImage = StrapiMedia;

// ==================
// Blog Category (Rubric)
// ==================

export interface StrapiBlogCategory {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  order: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================
// News Article
// ==================

export interface StrapiNewsArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body: string | null;
  showQuestionForm: boolean | null;
  questionFormTitle: string | null;
  questionFormDescription: string | null;
  anonsImage: StrapiImage | null;
  postImage: StrapiImage | null;
  category: StrapiBlogCategory | null;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Service Category
// ==================

export interface StrapiServiceCategory {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  services?: StrapiService[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Service
// ==================

export interface StrapiTextItem {
  id: number;
  text: string;
}

export interface StrapiServiceExample {
  id: number;
  exampleId: string | null;
  title: string;
  type: 'link' | 'fact' | 'presentation' | 'material' | null;
  link: string | null;
  description: string | null;
  notes: string | null;
  durationMinutes: string | null;
}

export interface StrapiCallToAction {
  id: number;
  label: string;
  type: 'form' | 'link' | 'email' | 'phone';
}

export interface StrapiServiceWebinar {
  id: number;
  title: string;
  items: StrapiTextItem[];
}

export interface StrapiService {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  order: number;
  shortDescription: string | null;
  fullDescriptionTitle: string | null;
  fullDescription: string | null;
  benefitsTitle: string | null;
  benefits: StrapiTextItem[];
  htmlSectionBefore: string | null;
  usefulInformation: string | null;
  htmlSectionAfter: string | null;
  howWeWorkTitle: string | null;
  howWeWork: StrapiTextItem[];
  webinarsTitle: string | null;
  webinars: StrapiServiceWebinar[];
  examplesTitle: string | null;
  examples: StrapiServiceExample[];
  cta: StrapiCallToAction | null;
  category: StrapiServiceCategory | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Person
// ==================

export interface StrapiPerson {
  id: number;
  documentId: string;
  fullName: string;
  photo: StrapiImage | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  order: number;
  teamGroup: { id: number } | null;
  expertGroup: { id: number } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Recommendation
// ==================

export interface StrapiRecommendation {
  id: number;
  documentId: string;
  company: string;
  slug: string;
  quote: string;
  fullQuote: string | null;
  logoImg: string | null;
  sourceLink: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiCertificate {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  company: string;
  year: number | null;
  fileType: string;
  file: StrapiMedia | null;
  order: number;
  sourceFileId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Shared Components
// ==================

export interface StrapiLink {
  id: number;
  label: string;
  href: string;
}

export interface StrapiFaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface StrapiHero {
  id: number;
  headline: string;
  lead: string | null;
  primaryCta: StrapiLink | null;
}

export interface StrapiMetric {
  id: number;
  key: string;
  label: string;
  displayValue: string;
  valueNumber: number | null;
}

export interface StrapiLegalDocument {
  id: number;
  label: string;
  href: string;
  type: 'pdf' | 'docx' | 'other';
}

// ==================
// Site Setting
// ==================

export interface StrapiSiteSetting {
  id: number;
  documentId: string;
  organizationFullName: string;
  organizationShortName: string;
  contactsPhone: string;
  contactsEmail: string;
  socialLinks: StrapiLink[];
  legalLinks: StrapiLink[];
  legalDocumentsTitle: string | null;
  legalDocuments: StrapiLegalDocument[];
  copyrightYears: string | null;
  copyrightText: string | null;
  copyrightNotice: string | null;
  metrics: StrapiMetric[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Home Page
// ==================

export interface StrapiHomeProofPoint {
  id: number;
  strong: boolean;
  text: string;
  links: StrapiLink[];
}

interface StrapiHomeAward {
  id: number;
  title: string;
  year: number | null;
}

interface StrapiHomeLogo {
  id: number;
  title: string;
  href: string | null;
  imgPath: string | null;
}

interface StrapiHomeClientsCategory {
  id: number;
  key: string;
  name: string;
  logos: StrapiHomeLogo[];
  moreDisplay: string | null;
  moreValue: number | null;
  moreUnit: string | null;
}

interface StrapiHomeClientsCarousel {
  id: number;
  title: string;
  archiveCta: StrapiLink | null;
  categories: StrapiHomeClientsCategory[];
}

export interface StrapiHomePartnersBlock {
  id: number;
  awards: StrapiHomeAward[];
  clientsCarousel: StrapiHomeClientsCarousel | null;
}

export interface StrapiHomePage {
  id: number;
  documentId: string;
  hero: StrapiHero | null;
  supportingHeadings: StrapiTextItem[];
  proofPoints: StrapiHomeProofPoint[];
  servicesTitle: string | null;
  partners: StrapiHomePartnersBlock | null;
  newsTitle: string | null;
  newsTeaser: string | null;
  newsArchiveLink: StrapiLink | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Companies Page
// ==================

export interface StrapiCompaniesPage {
  id: number;
  documentId: string;
  hero: StrapiHero | null;
  faqItems: StrapiFaqItem[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Individuals Page
// ==================

export interface StrapiIndividualsProduct {
  id: number;
  title: string;
  description: string;
  href: string;
  audience: string | null;
  iconKey: 'graduation-cap' | 'trending-up' | 'zap' | null;
  imagePath: string | null;
}

export interface StrapiIndividualsPage {
  id: number;
  documentId: string;
  hero: StrapiHero | null;
  productsTitle: string | null;
  productsLead: string | null;
  products: StrapiIndividualsProduct[];
  faqItems: StrapiFaqItem[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Portfolio Page
// ==================

export interface StrapiPortfolioProject {
  id: number;
  title: string;
  description: string;
  period: string | null;
}

export interface StrapiPortfolioPage {
  id: number;
  documentId: string;
  title: string;
  lead: string | null;
  projects: StrapiPortfolioProject[];
  presentationLabel: string | null;
  presentationHref: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// About Page
// ==================

export interface StrapiHowWeWorkStep {
  id: number;
  order: number;
  title: string;
  description: string | null;
}

export interface StrapiPrinciple {
  id: number;
  key: string;
  order: number;
  title: string;
  description: string;
  linkLabel: string | null;
  href: string | null;
}

export interface StrapiAboutPage {
  id: number;
  documentId: string;
  heroHeadline: string | null;
  heroCta: StrapiLink | null;
  howWeWorkTitle: string | null;
  howWeWorkLead: string | null;
  howWeWorkSteps: StrapiHowWeWorkStep[];
  principlesTitle: string | null;
  principlesLead: string | null;
  principles: StrapiPrinciple[];
  faqItems: StrapiFaqItem[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Blog Page
// ==================

export interface StrapiBlogPage {
  id: number;
  documentId: string;
  title: string;
  lead: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
