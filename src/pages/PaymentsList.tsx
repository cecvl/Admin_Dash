import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AdminLayout from '../components/layout/AdminLayout';
import { getPayments, type Payment } from '../services/admin';
import { Search, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const PaymentsList: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const filters: any = { limit: 100 };

            if (statusFilter !== 'all') {
                filters.status = statusFilter;
            }

            const response = await getPayments(filters);
            setPayments(response.payments || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (filteredPayments.length === 0) {
            toast.error('No payments to export');
            return;
        }

        const csvContent = [
            ['Payment ID', 'Order ID', 'Amount', 'Method', 'Status', 'Date'].join(','),
            ...filteredPayments.map(p => [
                p.paymentId,
                p.orderId,
                p.amount.toFixed(2),
                p.method || 'N/A',
                p.status,
                new Date(p.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Payments exported successfully');
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'failed':
            case 'error':
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = filteredPayments
        .filter(p => p.status.toLowerCase() === 'completed' || p.status.toLowerCase() === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all platform payments</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('all')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredPayments.length}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('all')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('completed')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(completedAmount)}</div>
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
                                    placeholder="Search by payment ID or order ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('pending')}
                                >
                                    Pending
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('completed')}
                                >
                                    Completed
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'failed' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('failed')}
                                >
                                    Failed
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Payments ({filteredPayments.length})</CardTitle>
                            <Button size="sm" variant="outline" onClick={handleExport}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading payments...
                            </div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No payments found
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Payment ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Order ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Method</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Date</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment) => (
                                            <tr
                                                key={payment.paymentId}
                                                className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="font-mono text-sm">{payment.paymentId.slice(0, 8)}...</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {payment.orderId?.slice(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground capitalize">
                                                        {payment.method || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getStatusBadgeColor(payment.status)}>
                                                        {payment.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(payment.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <Button size="sm" variant="outline">
                                                        View Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default PaymentsList;
