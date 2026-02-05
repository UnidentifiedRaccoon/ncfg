/**
 * Strapi API Response Types
 * 
 * These types match the Strapi 5 REST API response structure.
 */

// ==================
// Generic Types
// ==================

export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// ==================
// Tag
// ==================

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
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
  anonsImage: StrapiImage | null;
  tags: StrapiTag[];
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
  type: 'link' | 'fact' | 'presentation' | 'custom' | null;
  link: string | null;
  description: string | null;
  notes: string | null;
  durationMinutes: string | null;
}

export interface StrapiProductItem {
  id: number;
  productId: string | null;
  title: string;
  type: 'online_school' | 'subscription_club' | 'custom_project' | 'other' | null;
  notes: string | null;
  pricingOptions: StrapiTextItem[];
}

export interface StrapiCallToAction {
  id: number;
  label: string;
  type: 'form' | 'link' | 'email' | 'phone';
}

export interface StrapiService {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  order: number;
  shortDescription: string | null;
  fullDescription: string | null;
  benefits: StrapiTextItem[];
  howWeWork: StrapiTextItem[];
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
  team: { id: number } | null;
  expertGroup: { id: number } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
