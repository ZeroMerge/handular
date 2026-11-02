export interface DashboardMetrics {
  activeRequests: number;
  pendingReviews: number;
  offersReady: number;
  totalSellers: number;
  totalVolume: number;
  totalCommissions: number;
  completedDealsCount: number;
}

export interface AdminRequestItem {
  id: string;
  publicToken: string;
  buyerName: string;
  buyerPhone: string;
  category: 'LAPTOPS' | 'PHONES' | 'ACCESSORIES';
  targetSpecs: any;
  minBudget: number;
  maxBudget: number;
  status: string;
  sellersBroadcasted: number;
  offersReceived: number;
  pendingReviews: number;
  expiresAt: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  requestId: string;
  requestToken: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  brand: string;
  model: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    batteryHealth?: string;
    screen?: string;
    warranty?: string;
  };
  price: number;
  conditionGrade: string;
  cloudinaryPhotos: string[];
  aiConfidenceScore: number;
  flagReason: string;
  rawMessages: string[];
  rawAudioUrls: string[];
  audioTranscript?: string;
  createdAt: string;
}

export interface SellerRecord {
  id: string;
  businessName: string;
  contactName: string;
  whatsappNumber: string;
  telegramHandle?: string;
  verificationStatus: string;
  categories: string[];
  rating: number;
  completedDeals: number;
  notes?: string;
  createdAt: string;
}
