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
    seller?: {
      businessName?: string;
      contactName?: string;
      whatsappNumber?: string;
      physicalLocation?: string;
    };
    request?: {
      id?: string;
      publicToken?: string;
      buyerName?: string;
      category?: string;
      maxBudget?: number;
    };
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  entityType: string;
  details: string;
  entityId?: string;
}

export interface InboundBatchRecord {
  id: string;
  sellerId: string;
  channel: 'TELEGRAM' | 'WHATSAPP';
  rawMessages: string[];
  rawPhotoUrls: string[];
  rawAudioUrls: string[];
  targetRequestId?: string;
  silenceExpires: Date;
  status: 'COLLECTING' | 'PROCESSED' | 'FAILED';
  createdAt: Date;
}

class MemoryStore {
  public sellers: SellerRecord[] = [
    {
      id: 'seller-1',
      businessName: 'Apex Gadgets Hub',
      contactName: 'Samuel Adebayo',
      whatsappNumber: '2348012345678',
      telegramHandle: 'apex_gadgets_campus',
      verificationStatus: 'VERIFIED',
      verificationTier: 'TIER_1_VERIFIED',
      physicalLocation: 'Shop 14, Main Campus Market Complex',
      stallPhoto: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
      ninOrId: 'NIN-29401849102',
      bankName: 'Kuda Microfinance Bank',
      accountNumber: '2019481920',
      accountName: 'Samuel Apex Enterprise',
      categories: ['LAPTOPS', 'PHONES'],
      rating: 4.9,
      completedDeals: 18,
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seller-2',
      businessName: 'Campus Tech Plug',
      contactName: 'Femi Olatunji',
      whatsappNumber: '2348023456789',
      telegramHandle: 'campus_plug',
      verificationStatus: 'VERIFIED',
      verificationTier: 'TIER_1_VERIFIED',
      physicalLocation: 'Stall B-08, Student Union Shopping Arcade',
      stallPhoto: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
      ninOrId: 'NIN-89301928401',
      bankName: 'OPay Digital Services',
      accountNumber: '8023456789',
      accountName: 'Femi Tech Ventures',
      categories: ['LAPTOPS', 'ACCESSORIES'],
      rating: 4.8,
      completedDeals: 12,
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ];

  public reviews: ReviewItem[] = [
    {
      id: 'rev-demo-1',
      requestId: 'req-demo-1',
      requestToken: 'REQ-86SB',
      buyerName: 'Blessing Okafor',
      buyerPhone: '08123456789',
      category: 'LAPTOPS',
      maxBudget: 650000,
      targetSpecs: {
        brand: 'Apple',
        useCase: 'Computer Science Coding & Figma UI Design',
        notes: 'Needs at least 16GB RAM, battery health > 80%',
      },
      sellerId: 'seller-1',
      sellerName: 'Apex Gadgets Hub',
      sellerPhone: '2348012345678',
      brand: 'Apple',
      model: 'MacBook Pro 13" (M1, 2020)',
      specs: {
        cpu: 'Apple M1 (8-core)',
        ram: '16GB Unified',
        storage: '512GB SSD',
        batteryHealth: '87%',
        screen: '13.3" Retina Display',
      },
      price: 600000,
      conditionGrade: 'Grade A UK Used',
      cloudinaryPhotos: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      ],
      aiConfidenceScore: 0.72,
      flagReason: 'Price is near upper budget limit, manual approval recommended',
      rawMessages: [
        'Clean M1 MacBook Pro 16GB RAM 512GB SSD Space Gray. Battery cycle 180, health 87%. Going for 600k final.',
      ],
      rawAudioUrls: [],
      audioTranscript: 'Yes boss, battery condition is sharp, original charger included.',
      createdAt: new Date().toISOString(),
    },
  ];

  public requests: AdminRequestItem[] = [
    {
      id: 'req-demo-1',
      publicToken: 'REQ-86SB',
      buyerName: 'Blessing Okafor',
      buyerPhone: '08123456789',
      category: 'LAPTOPS',
      targetSpecs: {
        brand: 'Apple',
        useCase: 'Computer Science Coding & Figma UI Design',
        notes: 'Needs at least 16GB RAM, battery health > 80%',
      },
      minBudget: 400000,
      maxBudget: 650000,
      status: 'OFFERS_READY',
      sellersBroadcasted: 4,
      offersReceived: 2,
      pendingReviews: 1,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-demo-2',
      publicToken: 'REQ-91PQ',
      buyerName: 'Emeka Nwosu',
      buyerPhone: '08098765432',
      category: 'PHONES',
      targetSpecs: {
        brand: 'Samsung',
        useCase: 'Daily Driver & Content Creation',
        notes: 'Galaxy S22 or S23 Ultra',
      },
      minBudget: 350000,
      maxBudget: 500000,
      status: 'BROADCASTED',
      sellersBroadcasted: 3,
      offersReceived: 0,
      pendingReviews: 0,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  public deals: DealRecord[] = [
    {
      id: 'deal-demo-1',
      offerId: 'rev-demo-1',
      finalAgreedPrice: 600000,
      commissionAmount: 30000,
      status: 'INSPECTION',
      createdAt: new Date().toISOString(),
      offer: {
        id: 'rev-demo-1',
        brand: 'Apple',
        model: 'MacBook Pro 13" (M1)',
        conditionGrade: 'Grade A UK Used',
        price: 600000,
        seller: {
          businessName: 'Apex Gadgets Hub',
          contactName: 'Samuel Adebayo',
          whatsappNumber: '2348012345678',
          physicalLocation: 'Shop 14, Main Campus Market Complex',
        },
        request: {
          id: 'req-demo-1',
          publicToken: 'REQ-86SB',
          buyerName: 'Blessing Okafor',
          category: 'LAPTOPS',
          maxBudget: 650000,
        },
      },
    },
  ];

  public auditLogs: AuditLogItem[] = [
    {
      id: 'audit-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'SYSTEM_STARTUP',
      actor: 'system@handular.internal',
      entityType: 'SYSTEM',
      details: 'Handular Campus Operations Core started',
    },
  ];

  public inboundBatches: InboundBatchRecord[] = [];

  // Register or link seller from Telegram or WhatsApp
  public getOrCreateSeller(params: {
    phone: string;
    telegramHandle?: string;
    contactName?: string;
  }): SellerRecord {
    const cleanPhone = params.phone.replace(/[^0-9a-zA-Z_]/g, '');
    let seller = this.sellers.find(
      (s) =>
        s.whatsappNumber === params.phone ||
        s.whatsappNumber === cleanPhone ||
        (params.telegramHandle && (s.telegramHandle === params.telegramHandle || s.telegramHandle === `@${params.telegramHandle.replace('@', '')}`))
    );

    if (seller) {
      if (params.telegramHandle && !seller.telegramHandle) {
        seller.telegramHandle = params.telegramHandle;
      }
      return seller;
    }

    const newSeller: SellerRecord = {
      id: `seller-${Date.now()}`,
      businessName: `${params.contactName || 'Campus Vendor'} (${cleanPhone.slice(-4) || 'Desk'})`,
      contactName: params.contactName || 'Vendor',
      whatsappNumber: params.phone,
      telegramHandle: params.telegramHandle,
      verificationStatus: 'VERIFIED',
      verificationTier: 'TIER_1_VERIFIED',
      physicalLocation: 'Campus Market',
      categories: ['LAPTOPS', 'PHONES', 'ACCESSORIES'],
      rating: 5.0,
      completedDeals: 0,
      createdAt: new Date().toISOString(),
    };

    this.sellers.push(newSeller);
    return newSeller;
  }

  public recordAudit(action: string, actor: string, entityType: string, details: string, entityId?: string) {
    const item: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      entityType,
      details,
      entityId,
    };
    this.auditLogs.unshift(item);
    return item;
  }

  public addReview(item: ReviewItem) {
    this.reviews.unshift(item);
    // Update matching request
    const req = this.requests.find((r) => r.id === item.requestId || r.publicToken === item.requestToken);
    if (req) {
      req.status = 'OFFERS_READY';
      req.pendingReviews = (req.pendingReviews || 0) + 1;
      req.offersReceived = (req.offersReceived || 0) + 1;
    }
    this.recordAudit(
      'OFFER_RECEIVED',
      item.sellerName,
      'OFFER',
      `New offer for ${item.brand} ${item.model} (₦${item.price.toLocaleString()}) on #${item.requestToken}`,
      item.id
    );
  }

  public approveReview(offerId: string, edits?: { price?: number; conditionGrade?: string }) {
    const revIndex = this.reviews.findIndex((r) => r.id === offerId);
    if (revIndex === -1) return null;
    const rev = this.reviews[revIndex];
    if (edits?.price) rev.price = edits.price;
    if (edits?.conditionGrade) rev.conditionGrade = edits.conditionGrade;

    // Remove from pending reviews
    this.reviews.splice(revIndex, 1);

    // Update request
    const req = this.requests.find((r) => r.id === rev.requestId || r.publicToken === rev.requestToken);
    if (req) {
      req.pendingReviews = Math.max(0, (req.pendingReviews || 1) - 1);
      req.status = 'OFFERS_READY';
    }

    this.recordAudit(
      'OFFER_APPROVED',
      'admin@handular.com',
      'OFFER',
      `Approved offer for ${rev.brand} ${rev.model} (₦${rev.price.toLocaleString()}) on #${rev.requestToken}`,
      rev.id
    );

    return rev;
  }

  public rejectReview(offerId: string, reason: string) {
    const revIndex = this.reviews.findIndex((r) => r.id === offerId);
    if (revIndex === -1) return null;
    const rev = this.reviews[revIndex];
    this.reviews.splice(revIndex, 1);

    const req = this.requests.find((r) => r.id === rev.requestId || r.publicToken === rev.requestToken);
    if (req) {
      req.pendingReviews = Math.max(0, (req.pendingReviews || 1) - 1);
    }

    this.recordAudit(
      'OFFER_DECLINED',
      'admin@handular.com',
      'OFFER',
      `Declined offer for ${rev.brand} ${rev.model} on #${rev.requestToken}. Reason: ${reason}`,
      rev.id
    );

    return rev;
  }

  public rebroadcastRequest(requestId: string): { request: AdminRequestItem | null; sellerCount: number } {
    const req = this.requests.find((r) => r.id === requestId || r.publicToken === requestId);
    if (!req) return { request: null, sellerCount: 0 };

    req.status = 'BROADCASTED';
    req.sellersBroadcasted = (req.sellersBroadcasted || 0) + this.sellers.length;

    this.recordAudit(
      'REQUEST_REBROADCAST',
      'admin@handular.com',
      'REQUEST',
      `Re-broadcasted request #${req.publicToken} to ${this.sellers.length} campus vendors`,
      req.id
    );

    return { request: req, sellerCount: this.sellers.length };
  }
}

export const sharedStore = new MemoryStore();
