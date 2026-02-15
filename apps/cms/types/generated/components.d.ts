import type { Schema, Struct } from '@strapi/strapi';

export interface AboutHowWeWorkStep extends Struct.ComponentSchema {
  collectionName: 'components_about_how_we_work_steps';
  info: {
    description: 'About page: how we work step';
    displayName: 'How We Work Step';
    icon: 'list';
  };
  attributes: {
    description: Schema.Attribute.Text;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface AboutPrinciple extends Struct.ComponentSchema {
  collectionName: 'components_about_principles';
  info: {
    description: 'About page: principle item';
    displayName: 'Principle';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface HomeAward extends Struct.ComponentSchema {
  collectionName: 'components_home_awards';
  info: {
    description: 'Awards list item';
    displayName: 'Award';
    icon: 'trophy';
  };
  attributes: {
    imgPath: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    year: Schema.Attribute.Integer;
  };
}

export interface HomeClientsCarousel extends Struct.ComponentSchema {
  collectionName: 'components_home_clients_carousels';
  info: {
    description: 'Clients carousel section data';
    displayName: 'Clients Carousel';
    icon: 'carousel';
  };
  attributes: {
    archiveCta: Schema.Attribute.Component<'shared.link', false>;
    categories: Schema.Attribute.Component<'home.clients-category', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface HomeClientsCategory extends Struct.ComponentSchema {
  collectionName: 'components_home_clients_categories';
  info: {
    description: 'Carousel category with logos and "more" info';
    displayName: 'Clients Category';
    icon: 'folder';
  };
  attributes: {
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    logos: Schema.Attribute.Component<'home.logo', true>;
    moreDisplay: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    moreUnit: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    moreValue: Schema.Attribute.Integer;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface HomeLogo extends Struct.ComponentSchema {
  collectionName: 'components_home_logos';
  info: {
    description: 'Partner/client logo item';
    displayName: 'Logo';
    icon: 'picture';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    imgPath: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface HomePartners extends Struct.ComponentSchema {
  collectionName: 'components_home_partners_blocks';
  info: {
    description: 'Partners section data (awards + clients carousel + testimonials)';
    displayName: 'Partners Block';
    icon: 'users';
  };
  attributes: {
    awards: Schema.Attribute.Component<'home.award', true>;
    clientsCarousel: Schema.Attribute.Component<'home.clients-carousel', false>;
    testimonials: Schema.Attribute.Component<'home.testimonials', false>;
  };
}

export interface HomeProofPoint extends Struct.ComponentSchema {
  collectionName: 'components_home_proof_points';
  info: {
    description: 'Hero proof point with optional links';
    displayName: 'Proof Point';
    icon: 'check';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.link', true>;
    strong: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface HomeTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_home_testimonials';
  info: {
    description: 'Recommendation/testimonial item';
    displayName: 'Testimonial';
    icon: 'quote';
  };
  attributes: {
    company: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    logoImgPath: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface HomeTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_home_testimonials_blocks';
  info: {
    description: 'Testimonials section data';
    displayName: 'Testimonials Block';
    icon: 'comment';
  };
  attributes: {
    items: Schema.Attribute.Component<'home.testimonial', true>;
    more: Schema.Attribute.Component<'home.testimonials-more', false>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface HomeTestimonialsMore extends Struct.ComponentSchema {
  collectionName: 'components_home_testimonials_mores';
  info: {
    description: 'CTA for testimonials section';
    displayName: 'Testimonials More';
    icon: 'cursor';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    labelBottom: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    labelTop: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface IndividualsProduct extends Struct.ComponentSchema {
  collectionName: 'components_individuals_products';
  info: {
    description: 'Individuals page: product item';
    displayName: 'Product';
    icon: 'shopping-bag';
  };
  attributes: {
    audience: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    iconKey: Schema.Attribute.Enumeration<
      ['graduation-cap', 'trending-up', 'zap']
    >;
    imagePath: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface ServiceExpertAgenda extends Struct.ComponentSchema {
  collectionName: 'components_service_expert_agendas';
  info: {
    description: 'Expert role and topics for events';
    displayName: 'Expert Agenda';
    icon: 'user';
  };
  attributes: {
    role: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    topics: Schema.Attribute.Component<'shared.text-item', true>;
  };
}

export interface ServiceMethodologyItem extends Struct.ComponentSchema {
  collectionName: 'components_service_methodology_items';
  info: {
    description: 'Methodology approach item';
    displayName: 'Methodology Item';
    icon: 'cog';
  };
  attributes: {
    description: Schema.Attribute.Text;
    itemId: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface ServicePracticeBlock extends Struct.ComponentSchema {
  collectionName: 'components_service_practice_blocks';
  info: {
    description: 'Practice block for challenges/marathons';
    displayName: 'Practice Block';
    icon: 'apps';
  };
  attributes: {
    method: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    notes: Schema.Attribute.Text;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface ServiceProductItem extends Struct.ComponentSchema {
  collectionName: 'components_service_product_items';
  info: {
    description: 'Product offering within a service';
    displayName: 'Product Item';
    icon: 'shoppingCart';
  };
  attributes: {
    notes: Schema.Attribute.Text;
    pricingOptions: Schema.Attribute.Component<'shared.text-item', true>;
    productId: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    type: Schema.Attribute.Enumeration<
      ['online_school', 'subscription_club', 'custom_project', 'other']
    >;
  };
}

export interface ServiceServiceExample extends Struct.ComponentSchema {
  collectionName: 'components_service_service_examples';
  info: {
    description: 'Example of service in action';
    displayName: 'Service Example';
    icon: 'briefcase';
  };
  attributes: {
    description: Schema.Attribute.Text;
    durationMinutes: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    exampleId: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    link: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    notes: Schema.Attribute.Text;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    type: Schema.Attribute.Enumeration<
      ['link', 'fact', 'presentation', 'custom']
    >;
  };
}

export interface SharedCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_shared_call_to_actions';
  info: {
    description: 'CTA button configuration';
    displayName: 'Call to Action';
    icon: 'cursor';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    type: Schema.Attribute.Enumeration<['form', 'link', 'email', 'phone']> &
      Schema.Attribute.DefaultTo<'form'>;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Question + answer';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    question: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SharedHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_heroes';
  info: {
    description: 'Headline + lead + CTA';
    displayName: 'Hero';
    icon: 'star';
  };
  attributes: {
    headline: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    lead: Schema.Attribute.Text;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'Label + href';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface SharedMetric extends Struct.ComponentSchema {
  collectionName: 'components_shared_metrics';
  info: {
    description: 'Display metric';
    displayName: 'Metric';
    icon: 'chart';
  };
  attributes: {
    displayValue: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    valueNumber: Schema.Attribute.Decimal;
  };
}

export interface SharedTextItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_items';
  info: {
    description: 'Single text item for lists';
    displayName: 'Text Item';
    icon: 'quote';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SiteLegalDocument extends Struct.ComponentSchema {
  collectionName: 'components_site_legal_documents';
  info: {
    description: 'Footer legal document link';
    displayName: 'Legal Document';
    icon: 'file';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    type: Schema.Attribute.Enumeration<['pdf', 'docx', 'other']> &
      Schema.Attribute.DefaultTo<'other'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about.how-we-work-step': AboutHowWeWorkStep;
      'about.principle': AboutPrinciple;
      'home.award': HomeAward;
      'home.clients-carousel': HomeClientsCarousel;
      'home.clients-category': HomeClientsCategory;
      'home.logo': HomeLogo;
      'home.partners': HomePartners;
      'home.proof-point': HomeProofPoint;
      'home.testimonial': HomeTestimonial;
      'home.testimonials': HomeTestimonials;
      'home.testimonials-more': HomeTestimonialsMore;
      'individuals.product': IndividualsProduct;
      'service.expert-agenda': ServiceExpertAgenda;
      'service.methodology-item': ServiceMethodologyItem;
      'service.practice-block': ServicePracticeBlock;
      'service.product-item': ServiceProductItem;
      'service.service-example': ServiceServiceExample;
      'shared.call-to-action': SharedCallToAction;
      'shared.faq-item': SharedFaqItem;
      'shared.hero': SharedHero;
      'shared.link': SharedLink;
      'shared.metric': SharedMetric;
      'shared.text-item': SharedTextItem;
      'site.legal-document': SiteLegalDocument;
    }
  }
}
