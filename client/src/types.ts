export interface BuyerRequestData {
  id: string;
  publicToken: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  category: 'LAPTOPS' | 'PHONES' | 'ACCESSORIES';
  targetSpecs: {
    brand?: string;
    useCase?: string;
    notes?: string;
  };
  minBudget: number;
  maxBudget: number;
  currency: string;
  status: 'OPEN' | 'BROADCASTED' | 'OFFERS_READY' | 'OFFER_SELECTED' | 'CLOSED_WON' | 'CLOSED_LOST' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

export interface SellerData {
  id: string;
  businessName: string;
  contactName?: string;
  whatsappNumber: string;
  rating: number;
  completedDeals: number;
}

export interface OfferData {
  id: string;
  requestId: string;
  sellerId: string;
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
  isNegotiable: boolean;
  conditionGrade: string;
  cloudinaryPhotos: string[];
  aiConfidenceScore: number;
  reviewStatus: 'AUTO_APPROVED' | 'PENDING_REVIEW' | 'STAFF_APPROVED' | 'REJECTED';
  isPublishedToBuyer: boolean;
  isBuyerSelected: boolean;
  createdAt: string;
  seller?: SellerData;
}
