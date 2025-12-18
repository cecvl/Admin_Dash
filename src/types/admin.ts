// Admin-related TypeScript types based on backend API

export interface Artwork {
    id: string;
    artistId: string;
    title: string;
    description?: string;
    imageUrl: string;
    cloudinaryPublicId?: string;
    cloudinaryFolder?: string;
    processingStatus: 'pending' | 'processing' | 'ready' | 'failed';
    processingErrors?: string[];
    createdAt: Date | string;
    updatedAt?: Date | string;
    assignedTo?: {
        printShopId: string;
        assignedAt: Date | string;
        assignedBy: string;
    };
    admin?: {
        resolvedBy?: string;
        resolvedAt?: Date | string;
        resolutionNote?: string;
    };
}

export interface User {
    uid: string;
    email: string;
    name?: string;
    roles: string[];
    description?: string;
    avatarUrl?: string;
    isActive?: boolean;
    createdAt: Date | string;
}

export interface PrintShop {
    id: string;
    userId: string;
    name: string;
    description?: string;
    location: {
        address: string;
        city: string;
        country: string;
    };
    contact: {
        email: string;
        phone: string;
    };
    status: 'active' | 'inactive' | 'pending';
    rating?: number;
    createdAt: Date | string;
    updatedAt?: Date | string;
}

export interface Order {
    orderId: string;
    buyerId: string;
    printShopId?: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    adminNotes?: AdminNote[];
    createdAt: Date | string;
    updatedAt?: Date | string;
}

export interface OrderItem {
    artworkId: string;
    artworkTitle?: string;
    quantity: number;
    printOptions: {
        size: string;
        material: string;
        medium: string;
        frame?: string;
    };
    price: number;
}

export interface Payment {
    id: string;
    orderId: string;
    buyerId: string;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    createdAt: Date | string;
    completedAt?: Date | string;
}

export interface PrintShopProfile {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt?: Date | string;
}

export interface PrintService {
    id: string;
    shopId: string;
    name: string;
    description: string;
    basePrice: number;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface AdminNote {
    note: string;
    createdAt: Date | string;
    createdBy: string;
}

export interface RefundRequest {
    orderId?: string;
    paymentId?: string;
    reason?: string;
}

export interface AdminAction {
    action: string;
    resourceType: string;
    resourceId: string;
    performedBy: string;
    createdAt: Date | string;
    details?: any;
}

// API Request/Response Types
export interface GetArtworksParams {
    status?: 'pending' | 'processing' | 'ready' | 'failed';
    artistId?: string;
    from?: string; // RFC3339 format
    to?: string; // RFC3339 format
    limit?: number;
}

export interface ResolveArtworkRequest {
    id: string;
    action: 'approve' | 'reject' | 'reprocess';
    note?: string;
}

export interface AssignArtworkRequest {
    id: string;
    printShopId: string;
}

// Dashboard Statistics
export interface DashboardStats {
    totalUsers: {
        buyers: number;
        artists: number;
        shops: number;
    };
    orders: {
        total: number;
        paid: number;
        pending: number;
    };
    signups: {
        buyers: number;
        artists: number;
        shops: number;
    };
    revenue: {
        total: number;
        artistPayouts: number;
        shopCommissions: number;
    };
}

