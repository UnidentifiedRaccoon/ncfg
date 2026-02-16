export interface FaqItem {
  question: string;
  answer: string;
}

interface OrderedFaqItemInput {
  order: number;
  question: string;
  answer: string;
}

export function mapOrderedFaqItems<T extends OrderedFaqItemInput>(
  items: readonly T[]
): FaqItem[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ question: item.question, answer: item.answer }));
}

