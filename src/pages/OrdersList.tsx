import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '../components/layout/AdminLayout';
import {
    getOrders,
    getOrderById,
    updateOrderStatus,
    reassignOrder,
    cancelOrder,
    refundOrder,
    type Order
} from '../services/admin';
import { Search, Package, RefreshCw, XCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const OrdersList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

    // Modal states
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [newPrintShopId, setNewPrintShopId] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [refundReason, setRefundReason] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const filters: any = { limit: 100 };

            if (statusFilter !== 'all') {
                filters.status = statusFilter;
            }

            const response = await getOrders(filters);
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            setActionLoading(true);
            await updateOrderStatus(selectedOrder.orderId, newStatus, statusNote);
            toast.success('Order status updated successfully');
            setShowStatusModal(false);
            setStatusNote('');
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update order status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReassignOrder = async () => {
        if (!selectedOrder || !newPrintShopId) return;

        try {
            setActionLoading(true);
            await reassignOrder(selectedOrder.orderId, newPrintShopId);
            toast.success('Order reassigned successfully');
            setShowReassignModal(false);
            setNewPrintShopId('');
            fetchOrders();
        } catch (error) {
            console.error('Error reassigning order:', error);
            toast.error('Failed to reassign order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelOrder = async (order: Order) => {
        if (!confirm(`Are you sure you want to cancel order ${order.orderId}?`)) return;

        const reason = prompt('Enter cancellation reason (optional):');

        try {
            setActionLoading(true);
            await cancelOrder(order.orderId, reason || undefined);
            toast.success('Order cancelled successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefundOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading(true);
            await refundOrder({ orderId: selectedOrder.orderId, reason: refundReason });
            toast.success('Order refunded successfully');
            setShowRefundModal(false);
            setRefundReason('');
            fetchOrders();
        } catch (error) {
            console.error('Error refunding order:', error);
            toast.error('Failed to refund order');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.buyerId?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all platform orders</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter('all')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredOrders.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter('completed')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by order ID or buyer ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>All</Button>
                                <Button size="sm" variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')}>Pending</Button>
                                <Button size="sm" variant={statusFilter === 'confirmed' ? 'default' : 'outline'} onClick={() => setStatusFilter('confirmed')}>Confirmed</Button>
                                <Button size="sm" variant={statusFilter === 'completed' ? 'default' : 'outline'} onClick={() => setStatusFilter('completed')}>Completed</Button>
                                <Button size="sm" variant={statusFilter === 'cancelled' ? 'default' : 'outline'} onClick={() => setStatusFilter('cancelled')}>Cancelled</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No orders found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Order ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Date</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.orderId} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="font-mono text-sm">{order.orderId.slice(0, 8)}...</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setNewStatus(order.status);
                                                                setShowStatusModal(true);
                                                            }}
                                                            disabled={actionLoading}
                                                        >
                                                            <Package className="h-3 w-3 mr-1" />
                                                            Status
                                                        </Button>
                                                        {order.status !== 'cancelled' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setShowReassignModal(true);
                                                                    }}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                                    Reassign
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleCancelOrder(order)}
                                                                    disabled={actionLoading}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setShowRefundModal(true);
                                                                    }}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                                    Refund
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Update Status Modal */}
                <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                            <DialogDescription>Change the status for order {selectedOrder?.orderId}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>New Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Admin Note (Optional)</Label>
                                <Textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="Add a note about this status change..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowStatusModal(false)} disabled={actionLoading}>Cancel</Button>
                                <Button onClick={handleUpdateStatus} disabled={actionLoading || !newStatus}>
                                    {actionLoading ? 'Updating...' : 'Update Status'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Reassign Order Modal */}
                <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reassign Order</DialogTitle>
                            <DialogDescription>Assign order {selectedOrder?.orderId} to a different print shop</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Print Shop ID</Label>
                                <Input
                                    value={newPrintShopId}
                                    onChange={(e) => setNewPrintShopId(e.target.value)}
                                    placeholder="Enter print shop ID..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowReassignModal(false)} disabled={actionLoading}>Cancel</Button>
                                <Button onClick={handleReassignOrder} disabled={actionLoading || !newPrintShopId}>
                                    {actionLoading ? 'Reassigning...' : 'Reassign Order'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Refund Order Modal */}
                <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Refund Order</DialogTitle>
                            <DialogDescription>Process full refund for order {selectedOrder?.orderId}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    This will process a <strong>full refund</strong> for the order amount of{' '}
                                    <strong>{selectedOrder && formatCurrency(selectedOrder.totalAmount)}</strong>
                                </p>
                            </div>
                            <div>
                                <Label>Refund Reason (Optional)</Label>
                                <Textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Enter reason for refund..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowRefundModal(false)} disabled={actionLoading}>Cancel</Button>
                                <Button onClick={handleRefundOrder} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                                    {actionLoading ? 'Processing...' : 'Process Refund'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default OrdersList;
