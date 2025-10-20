export interface Article {
  _id: string;
  title: string;
  coverImage: string;
  publisherName: string;
  publisherLogo: string;
  authorName: string;
  datePosted: string;
  quickSummary: string;
  detailedSummary: string;
  whyItMatters: string;
  sourceUrl: string;
  category: 'AI' | 'Technology' | 'Startups' | 'Funding' | 'Machine Learning';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
