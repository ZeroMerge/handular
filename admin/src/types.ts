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
  buyerPhone?: string;
  category?: string;
  maxBudget?: number;
  targetSpecs?: any;
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
  verificationTier?: 'BASIC' | 'TIER_1_VERIFIED';
  physicalLocation?: string;
  stallPhoto?: string;
  ninOrId?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  categories: string[];
  rating: number;
  completedDeals: number;
  notes?: string;
  createdAt: string;
}

export interface DealRecord {
  id: string;
  offerId: string;
  finalAgreedPrice: number;
  commissionAmount: number;
  status: 'IN_PROGRESS' | 'INSPECTION' | 'SUCCESSFUL' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  dbStatus?: string;
  disputeReason?: string;
  notes?: string;
  studentFeedback?: string;
  sellerRating?: number;
  closedAt?: string;
  createdAt: string;
  offer: {
    id: string;
    brand: string;
    model: string;
    conditionGrade: string;
    price: number;
    specs: any;
    request: {
      id: string;
      publicToken: string;
      buyerName: string;
      buyerPhone: string;
      category: string;
      maxBudget: number;
    };
    seller: SellerRecord;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  entityType: 'VENDOR' | 'OFFER' | 'REQUEST' | 'SYSTEM';
  entityId?: string;
  details: string;
}

