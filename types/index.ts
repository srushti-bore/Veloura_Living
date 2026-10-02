export * from './product';
export * from './room';
export * from './cart';
export * from './order';

import { Product } from './product';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  roomTip?: string;
  paletteSuggestion?: string[];
  actionPrompt?: string;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  readTime: string;
  date: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  excerpt: string;
  paragraphs: string[];
  tags: string[];
}
