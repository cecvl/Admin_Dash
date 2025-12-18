import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SalesChart from './SalesChart';
import AdminLayout from './layout/AdminLayout';
import { getPlatformStatistics, getUsers, getPayments, type PlatformStatistics, type User, type Payment } from '../services/admin';

type UserType = 'all' | 'artist' | 'shop';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<UserType>('all');
    const [selectedStat, setSelectedStat] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchFilteredUsers();
    }, [activeFilter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [stats, paymentsData] = await Promise.all([
                getPlatformStatistics(),
                getPayments({ limit: 10 }),
            ]);

            setStatistics(stats);
            setPayments(paymentsData.payments || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredUsers = async () => {
        try {
            // Always fetch all users, then filter client-side
            // This ensures users with multiple roles appear in all relevant filters
            const response = await getUsers({ limit: 100 });
            setUsers(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!user || !Array.isArray(user.roles)) return false;
        if (activeFilter === 'all') return true;
        if (activeFilter === 'artist') return user.roles.includes('artist');
        if (activeFilter === 'shop') return user.roles.includes('printShop');
        return true;
    });

    const handleStatClick = (stat: string, route?: string) => {
        setSelectedStat(stat);
        if (route) {
            navigate(route);
        }
    };

    const handleViewAllUsers = () => {
        navigate('/users');
    };

    const handleViewAllOrders = () => {
        navigate('/orders');
    };

    const handleViewPayments = () => {
        navigate('/payments');
    };

    const getTodayPayments = () => {
        const today = new Date().toDateString();
        return payments.filter(p => new Date(p.createdAt).toDateString() === today);
    };

    const calculateTodayPayouts = () => {
        const todayPayments = getTodayPayments();
        const artistPayouts = todayPayments.reduce((sum, p) => sum + (p.amount * 0.7), 0);
        const shopCommissions = todayPayments.reduce((sum, p) => sum + (p.amount * 0.3), 0);
        return { artistPayouts, shopCommissions };
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="max-w-[1200px] mx-auto my-8 px-4">
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-muted-foreground">Loading dashboard...</div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const payouts = calculateTodayPayouts();

    return (
        <AdminLayout>
            {/* Dashboard Container */}
            <div className="max-w-[1200px] mx-auto my-8 px-4">

                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Platform overview, sales, and user management.</p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">

                    {/* LEFT COLUMN */}
                    <div className="space-y-6">

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-auto flex-col items-start py-4 hover:border-primary hover:bg-accent/10 transition-all duration-200"
                                onClick={handleViewAllUsers}
                            >
                                <div className="font-medium">User Management</div>
                                <div className="text-xs text-muted-foreground font-normal">Manage Users & Roles</div>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-auto flex-col items-start py-4 hover:border-primary hover:bg-accent/10 transition-all duration-200"
                                onClick={handleViewAllOrders}
                            >
                                <div className="font-medium">Order Management</div>
                                <div className="text-xs text-muted-foreground font-normal">View & Process Orders</div>
                            </Button>
                        </div>

                        {/* Manage Artists / Shops */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Manage Artists / Shops</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                                            onClick={() => setActiveFilter('all')}
                                            className="h-8 transition-all duration-200"
                                        >
                                            All
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={activeFilter === 'artist' ? 'default' : 'outline'}
                                            onClick={() => setActiveFilter('artist')}
                                            className="h-8 transition-all duration-200"
                                        >
                                            Artists
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={activeFilter === 'shop' ? 'default' : 'outline'}
                                            onClick={() => setActiveFilter('shop')}
                                            className="h-8 transition-all duration-200"
                                        >
                                            Shops
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-0">
                                {filteredUsers.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        No {activeFilter}s found
                                    </div>
                                ) : (
                                    <>
                                        {filteredUsers.slice(0, 5).map((user, index) => (
                                            <div
                                                key={user.uid}
                                                className={`flex justify-between items-center py-3 hover:bg-muted/50 px-2 -mx-2 rounded transition-colors duration-200 cursor-pointer ${index !== Math.min(filteredUsers.length, 5) - 1 ? 'border-b' : ''
                                                    }`}
                                                onClick={() => navigate('/users')}
                                            >
                                                <div>
                                                    <div className="font-medium">{user.name || 'Unnamed User'}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                                <Badge className={
                                                    user.roles.includes('artist')
                                                        ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                }>
                                                    {user.roles.includes('artist') ? 'Artist' : 'Shop'}
                                                </Badge>
                                            </div>
                                        ))}
                                        {filteredUsers.length > 5 && (
                                            <div className="pt-3 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleViewAllUsers}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    View All {filteredUsers.length} {activeFilter === 'all' ? 'Users' : activeFilter === 'artist' ? 'Artists' : 'Shops'}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Sales Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`bg-muted rounded-lg p-3 text-center cursor-pointer transition-all duration-200 hover:bg-muted/80 hover:scale-105 ${selectedStat === 'orders-paid' ? 'ring-2 ring-primary' : ''
                                            }`}
                                        onClick={() => handleStatClick('orders-paid', '/orders')}
                                    >
                                        <div className="text-2xl font-bold">{statistics?.totalOrders || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">Total Orders</div>
                                    </div>
                                    <div
                                        className={`bg-muted rounded-lg p-3 text-center cursor-pointer transition-all duration-200 hover:bg-muted/80 hover:scale-105 ${selectedStat === 'pending' ? 'ring-2 ring-primary' : ''
                                            }`}
                                        onClick={() => handleStatClick('pending', '/orders')}
                                    >
                                        <div className="text-2xl font-bold">{statistics?.pendingOrders || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">Pending</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Signups Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>New Signups (This Week)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div
                                        className={`bg-muted rounded-lg p-3 text-center cursor-pointer transition-all duration-200 hover:bg-muted/80 hover:scale-105 ${selectedStat === 'buyers' ? 'ring-2 ring-primary' : ''
                                            }`}
                                        onClick={() => handleStatClick('buyers', '/users')}
                                    >
                                        <div className="text-2xl font-bold">{statistics?.recentSignups.buyers || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">Buyers</div>
                                    </div>
                                    <div
                                        className={`bg-muted rounded-lg p-3 text-center cursor-pointer transition-all duration-200 hover:bg-muted/80 hover:scale-105 ${selectedStat === 'artists' ? 'ring-2 ring-primary' : ''
                                            }`}
                                        onClick={() => handleStatClick('artists', '/users')}
                                    >
                                        <div className="text-2xl font-bold">{statistics?.recentSignups.artists || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">Artists</div>
                                    </div>
                                    <div
                                        className={`bg-muted rounded-lg p-3 text-center cursor-pointer transition-all duration-200 hover:bg-muted/80 hover:scale-105 ${selectedStat === 'shops' ? 'ring-2 ring-primary' : ''
                                            }`}
                                        onClick={() => handleStatClick('shops', '/printshops')}
                                    >
                                        <div className="text-2xl font-bold">{statistics?.recentSignups.printShops || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">Shops</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">

                        {/* Sales Graph */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Performance</CardTitle>
                                <p className="text-sm text-muted-foreground">Monthly revenue breakdown (Last 8 months)</p>
                            </CardHeader>
                            <CardContent>
                                <SalesChart />
                            </CardContent>
                        </Card>

                        {/* Payments Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payments Processed</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div
                                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                                    onClick={handleViewPayments}
                                >
                                    <div>
                                        <div className="font-semibold">Artists Payout</div>
                                        <div className="text-sm text-muted-foreground">Processed today</div>
                                    </div>
                                    <div className="font-bold">${payouts.artistPayouts.toFixed(2)}</div>
                                </div>

                                <div
                                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                                    onClick={handleViewPayments}
                                >
                                    <div>
                                        <div className="font-semibold">Shop Commissions</div>
                                        <div className="text-sm text-muted-foreground">Processed today</div>
                                    </div>
                                    <div className="font-bold">${payouts.shopCommissions.toFixed(2)}</div>
                                </div>

                                <div className="text-center mt-4">
                                    <button
                                        className="text-primary underline font-semibold hover:no-underline transition-all duration-200"
                                        onClick={handleViewPayments}
                                    >
                                        View Transaction History
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
