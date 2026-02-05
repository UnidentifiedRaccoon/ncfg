import type { Schema, Struct } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'service.expert-agenda': ServiceExpertAgenda;
      'service.methodology-item': ServiceMethodologyItem;
      'service.practice-block': ServicePracticeBlock;
      'service.product-item': ServiceProductItem;
      'service.service-example': ServiceServiceExample;
      'shared.call-to-action': SharedCallToAction;
      'shared.text-item': SharedTextItem;
    }
  }
}
