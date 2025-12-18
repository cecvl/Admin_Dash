import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AdminLayout from '../components/layout/AdminLayout';
import { getUsers, type User } from '../services/admin';
import { Search, Store } from 'lucide-react';

const PrintShopsList: React.FC = () => {
    const [shops, setShops] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchShops();
    }, [statusFilter]);

    const fetchShops = async () => {
        try {
            setLoading(true);
            // Fetch all users, filter client-side to include users with multiple roles
            const response = await getUsers({ limit: 1000 }); // Fetch a larger set of users
            const allUsers = Array.isArray(response) ? response : [];
            // Filter for users with printShop role
            const printShops = allUsers.filter(user =>
                user && Array.isArray(user.roles) && user.roles.includes('printShop')
            );
            setShops(printShops);
        } catch (error) {
            console.error('Error fetching print shops:', error);
            setShops([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredShops = shops.filter(shop => {
        if (!shop) return false;
        const matchesSearch =
            shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'active' ? shop.isActive !== false :
                    statusFilter === 'inactive' ? shop.isActive === false :
                        true; // Default to true if statusFilter is unexpected

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const activeShops = filteredShops.filter(s => s?.isActive !== false).length;
    const inactiveShops = filteredShops.filter(s => s?.isActive === false).length;

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Print Shop Management</h1>
                    <p className="text-muted-foreground mt-1">Manage print shops and their services</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('all')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Shops</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredShops.length}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('active')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Shops</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{activeShops}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('inactive')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Shops</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{inactiveShops}</div>
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
                                    placeholder="Search by shop name or email..."
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
                                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('active')}
                                >
                                    Active
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('inactive')}
                                >
                                    Inactive
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shops Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Print Shops ({filteredShops.length})</CardTitle>
                            <Button size="sm">
                                <Store className="h-4 w-4 mr-2" />
                                Add Shop
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading print shops...
                            </div>
                        ) : filteredShops.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No print shops found
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Shop Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Joined</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredShops.map((shop) => (
                                            <tr
                                                key={shop.uid}
                                                className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{shop.name || 'Unnamed Shop'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">{shop.email || 'No email'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant={shop.isActive !== false ? 'default' : 'secondary'}>
                                                        {shop.isActive !== false ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(shop.createdAt)}
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

export default PrintShopsList;
