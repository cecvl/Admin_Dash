import api from './api';
import type {
    Artwork,
    GetArtworksParams,
    ResolveArtworkRequest,
    AssignArtworkRequest,
    PrintShopProfile,
    PrintService,
    RefundRequest,
    AdminAction,
} from '../types/admin';

/**
 * Admin service for managing artworks, users, orders, payments, and reports
 * All endpoints require admin role
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SalesDataPoint {
    month: string;
    orders: number;
    revenue: number;
}

export interface PlatformStatistics {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    activeShops: number;
    pendingOrders: number;
    recentSignups: {
        buyers: number;
        artists: number;
        printShops: number;
    };
}

export interface User {
    uid: string;
    email: string;
    name: string;
    roles: string[];
    createdAt: string;
    isActive?: boolean;
}

export interface Order {
    orderId: string;
    buyerId: string;
    printShopId?: string;
    status: string;
    totalAmount: number;
    createdAt: string;
}

export interface Payment {
    paymentId: string;
    orderId: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
}

// ============================================================================
// ARTWORKS
// ============================================================================

/**
 * Get list of artworks with optional filters
 * GET /admin/artworks
 */
export const getArtworks = async (params?: GetArtworksParams): Promise<Artwork[]> => {
    const response = await api.get<Artwork[]>('/admin/artworks', { params });
    return response.data;
};

/**
 * Get single artwork by ID
 * GET /admin/artworks/get?id={id}
 */
export const getArtwork = async (id: string): Promise<Artwork> => {
    const response = await api.get<Artwork>('/admin/artworks/get', {
        params: { id },
    });
    return response.data;
};

/**
 * Resolve artwork (approve, reject, or reprocess)
 * POST /admin/artworks/resolve
 */
export const resolveArtwork = async (
    request: ResolveArtworkRequest
): Promise<void> => {
    await api.post('/admin/artworks/resolve', request);
};

/**
 * Assign artwork to a print shop
 * POST /admin/artworks/assign
 */
export const assignArtwork = async (
    request: AssignArtworkRequest
): Promise<void> => {
    await api.post('/admin/artworks/assign', request);
};

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Get monthly sales report
 * GET /admin/reports/sales-monthly
 */
export const getSalesReport = async (
    from?: string,
    to?: string,
    shopId?: string,
    artistId?: string
): Promise<{ series: SalesDataPoint[] }> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (shopId) params.append('shopId', shopId);
    if (artistId) params.append('artistId', artistId);

    const response = await api.get(`/admin/reports/sales-monthly?${params.toString()}`);
    return response.data;
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get platform statistics (aggregated from various endpoints)
 */
export const getPlatformStatistics = async (): Promise<PlatformStatistics> => {
    try {
        const [usersResponse, ordersResponse] = await Promise.all([
            api.get('/admin/users?limit=1000'),
            api.get('/admin/orders?limit=1000'),
        ]);

        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const orders = Array.isArray(ordersResponse.data?.orders) ? ordersResponse.data.orders : [];

        const totalUsers = users.length;
        const totalOrders = orders.length;

        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum: number, order: any) => {
            return sum + (order.totalAmount || 0);
        }, 0);

        // Count active shops (users with printShop role)
        const activeShops = users.filter((u: any) =>
            Array.isArray(u.roles) && u.roles.includes('printShop')
        ).length;

        // Count pending orders
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

        // Count recent signups (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsers = users.filter((u: any) => {
            if (!u.createdAt) return false;
            const createdDate = new Date(u.createdAt);
            return createdDate >= thirtyDaysAgo;
        });

        const recentSignups = {
            buyers: recentUsers.filter((u: any) =>
                Array.isArray(u.roles) && u.roles.includes('buyer')
            ).length,
            artists: recentUsers.filter((u: any) =>
                Array.isArray(u.roles) && u.roles.includes('artist')
            ).length,
            printShops: recentUsers.filter((u: any) =>
                Array.isArray(u.roles) && u.roles.includes('printShop')
            ).length,
        };

        return {
            totalUsers,
            totalOrders,
            totalRevenue,
            activeShops,
            pendingOrders,
            recentSignups,
        };
    } catch (error) {
        console.error('Error fetching platform statistics:', error);
        // Return default values on error
        return {
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            activeShops: 0,
            pendingOrders: 0,
            recentSignups: {
                buyers: 0,
                artists: 0,
                printShops: 0,
            },
        };
    }
};

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get list of users with filters
 * GET /admin/users
 */
export const getUsers = async (filters?: {
    role?: string;
    isActive?: boolean;
    limit?: number;
}): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<User[]>(`/admin/users?${params.toString()}`);
    return response.data;
};

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

/**
 * Get list of orders with filters
 * GET /admin/orders
 */
export const getOrders = async (filters?: {
    status?: string;
    buyerId?: string;
    printShopId?: string;
    createdAfter?: string;
    limit?: number;
}): Promise<{ orders: Order[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.buyerId) params.append('buyerId', filters.buyerId);
    if (filters?.printShopId) params.append('printShopId', filters.printShopId);
    if (filters?.createdAfter) params.append('createdAfter', filters.createdAfter);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/admin/orders?${params.toString()}`);
    return response.data;
};

// ============================================================================
// PAYMENT MANAGEMENT
// ============================================================================

/**
 * Get list of payments
 * GET /admin/payments
 */
export const getPayments = async (filters?: {
    status?: string;
    orderId?: string;
    buyerId?: string;
    limit?: number;
}): Promise<{ payments: Payment[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.orderId) params.append('orderId', filters.orderId);
    if (filters?.buyerId) params.append('buyerId', filters.buyerId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/admin/payments?${params.toString()}`);
    return response.data;
};

/**
 * Get single payment with linked order
 * GET /admin/payments/get?paymentId={id}
 */
export const getPaymentById = async (paymentId: string): Promise<{ payment: Payment; order?: Order }> => {
    const response = await api.get('/admin/payments/get', {
        params: { paymentId },
    });
    return response.data;
};

/**
 * Verify payment with provider
 * POST /admin/payments/verify
 */
export const verifyPayment = async (paymentId: string): Promise<Payment> => {
    const response = await api.post('/admin/payments/verify', { paymentId });
    return response.data;
};

/**
 * Refund payment (full refund only)
 * POST /admin/payments/refund
 */
export const refundPayment = async (paymentId: string, reason?: string): Promise<void> => {
    await api.post('/admin/payments/refund', { paymentId, reason });
};

// ============================================================================
// PRINT SHOP MANAGEMENT
// ============================================================================

/**
 * Get list of print shops
 * GET /admin/printshops
 */
export const getPrintShops = async (filters?: {
    isActive?: boolean;
    limit?: number;
}): Promise<{ printshops: PrintShopProfile[] }> => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/admin/printshops?${params.toString()}`);
    return response.data;
};

/**
 * Get single print shop with services
 * GET /admin/printshops/get?shopId={id}
 */
export const getPrintShopById = async (shopId: string): Promise<{ shop: PrintShopProfile; services: PrintService[] }> => {
    const response = await api.get('/admin/printshops/get', {
        params: { shopId },
    });
    return response.data;
};

/**
 * Update service base price
 * POST /admin/printshops/update-service-price
 */
export const updateServicePrice = async (serviceId: string, price: number): Promise<void> => {
    await api.post('/admin/printshops/update-service-price', { serviceId, price });
};

/**
 * Create new service for a shop
 * POST /admin/printshops/service-add
 */
export const createService = async (shopId: string, service: Partial<PrintService>): Promise<{ serviceId: string }> => {
    const response = await api.post('/admin/printshops/service-add', { shopId, service });
    return response.data;
};

/**
 * Enable or disable a service
 * POST /admin/printshops/service-status
 */
export const updateServiceStatus = async (serviceId: string, isActive: boolean, reason?: string): Promise<void> => {
    await api.post('/admin/printshops/service-status', { serviceId, isActive, reason });
};

// ============================================================================
// SIGNUP MANAGEMENT
// ============================================================================

/**
 * Get pending signups (users with isActive=false)
 * GET /admin/signups
 */
export const getSignups = async (role?: string): Promise<{ signups: User[] }> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);

    const response = await api.get(`/admin/signups?${params.toString()}`);
    return response.data;
};

// ============================================================================
// ADMIN ACTIONS / AUDIT LOG
// ============================================================================

/**
 * Get admin actions for audit log
 * Note: This endpoint may need to be implemented in backend
 */
export const getAdminActions = async (filters?: {
    action?: string;
    resourceType?: string;
    performedBy?: string;
    from?: string;
    to?: string;
    limit?: number;
}): Promise<AdminAction[]> => {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resourceType) params.append('resourceType', filters.resourceType);
    if (filters?.performedBy) params.append('performedBy', filters.performedBy);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/admin/actions?${params.toString()}`);
    return response.data;
};

// ============================================================================
// USER MANAGEMENT (EXTENDED)
// ============================================================================

/**
 * Get single user by UID
 * GET /admin/users/get?uid={uid}
 */
export const getUserById = async (uid: string): Promise<User> => {
    const response = await api.get('/admin/users/get', {
        params: { uid },
    });
    return response.data;
};

/**
 * Update user roles
 * POST /admin/users/update-roles
 */
export const updateUserRoles = async (uid: string, roles: string[]): Promise<void> => {
    await api.post('/admin/users/update-roles', { uid, roles });
};

/**
 * Deactivate user
 * POST /admin/users/deactivate
 */
export const deactivateUser = async (uid: string): Promise<void> => {
    await api.post('/admin/users/deactivate', { uid });
};

/**
 * Reactivate user
 * POST /admin/users/reactivate
 */
export const reactivateUser = async (uid: string): Promise<void> => {
    await api.post('/admin/users/reactivate', { uid });
};

// ============================================================================
// ORDER MANAGEMENT (EXTENDED)
// ============================================================================

/**
 * Get single order with payments
 * GET /admin/orders/get?orderId={id}
 */
export const getOrderById = async (orderId: string): Promise<{ order: Order; payments: Payment[] }> => {
    const response = await api.get('/admin/orders/get', {
        params: { orderId },
    });
    return response.data;
};

/**
 * Update order status with optional admin note
 * POST /admin/orders/update-status
 */
export const updateOrderStatus = async (orderId: string, status: string, note?: string): Promise<void> => {
    await api.post('/admin/orders/update-status', { orderId, status, note });
};

/**
 * Reassign order to different print shop
 * POST /admin/orders/reassign
 */
export const reassignOrder = async (orderId: string, printShopId: string): Promise<void> => {
    await api.post('/admin/orders/reassign', { orderId, printShopId });
};

/**
 * Cancel order with reason
 * POST /admin/orders/cancel
 */
export const cancelOrder = async (orderId: string, reason?: string): Promise<void> => {
    await api.post('/admin/orders/cancel', { orderId, reason });
};

/**
 * Refund order (full refund)
 * POST /admin/orders/refund
 */
export const refundOrder = async (request: RefundRequest): Promise<{ refunded: string[] }> => {
    const response = await api.post('/admin/orders/refund', request);
    return response.data;
};

// Export all as a single object for convenience
const adminService = {
    // Artworks
    getArtworks,
    getArtwork,
    resolveArtwork,
    assignArtwork,
    // Reports
    getSalesReport,
    // Statistics
    getPlatformStatistics,
    // Users
    getUsers,
    getUserById,
    updateUserRoles,
    deactivateUser,
    reactivateUser,
    // Orders
    getOrders,
    getOrderById,
    updateOrderStatus,
    reassignOrder,
    cancelOrder,
    refundOrder,
    // Payments
    getPayments,
    getPaymentById,
    verifyPayment,
    refundPayment,
    // Print Shops
    getPrintShops,
    getPrintShopById,
    updateServicePrice,
    createService,
    updateServiceStatus,
    // Signups
    getSignups,
    // Admin Actions
    getAdminActions,
};

export default adminService;

