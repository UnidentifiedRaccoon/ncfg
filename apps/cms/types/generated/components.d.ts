import type { Schema, Struct } from '@strapi/strapi';

export interface DiagnosticOption extends Struct.ComponentSchema {
  collectionName: 'components_diagnostic_options';
  info: {
    description: 'Answer option with weight';
    displayName: 'Diagnostic Option';
    icon: 'bulletList';
  };
  attributes: {
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    weight: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface DiagnosticQuestion extends Struct.ComponentSchema {
  collectionName: 'components_diagnostic_questions';
  info: {
    description: 'Question with answer options';
    displayName: 'Diagnostic Question';
    icon: 'question';
  };
  attributes: {
    description: Schema.Attribute.Text;
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    options: Schema.Attribute.Component<'diagnostic.option', true>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface DiagnosticSubmissionAnswer extends Struct.ComponentSchema {
  collectionName: 'components_diagnostic_submission_answers';
  info: {
    description: 'Answer snapshot stored with submission';
    displayName: 'Diagnostic Submission Answer';
    icon: 'check';
  };
  attributes: {
    answerKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    answerLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    questionKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    questionTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    weight: Schema.Attribute.Integer & Schema.Attribute.Required;
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
      ['link', 'fact', 'presentation', 'material']
    >;
  };
}

export interface ServiceWebinar extends Struct.ComponentSchema {
  collectionName: 'components_service_webinars';
  info: {
    description: 'Webinar block with title and list of items';
    displayName: 'Webinar';
    icon: 'presentation-chart';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.text-item', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
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
      'diagnostic.option': DiagnosticOption;
      'diagnostic.question': DiagnosticQuestion;
      'diagnostic.submission-answer': DiagnosticSubmissionAnswer;
      'service.service-example': ServiceServiceExample;
      'service.webinar': ServiceWebinar;
      'shared.call-to-action': SharedCallToAction;
      'shared.text-item': SharedTextItem;
    }
  }
}
