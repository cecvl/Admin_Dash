import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AdminLayout from '../components/layout/AdminLayout';
import { getSignups, reactivateUser, type User } from '../services/admin';
import { Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const SignupsList: React.FC = () => {
    const [signups, setSignups] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'artist' | 'printShop'>('all');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSignups();
    }, [roleFilter]);

    const fetchSignups = async () => {
        try {
            setLoading(true);
            const response = await getSignups(roleFilter === 'all' ? undefined : roleFilter);
            setSignups(response.signups || []);
        } catch (error) {
            console.error('Error fetching signups:', error);
            setSignups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleActivateUser = async (user: User) => {
        try {
            setActionLoading(true);
            await reactivateUser(user.uid);
            toast.success(`User ${user.name || user.email} activated successfully`);
            fetchSignups();
        } catch (error) {
            console.error('Error activating user:', error);
            toast.error('Failed to activate user');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredSignups = signups.filter(signup => {
        const matchesSearch =
            signup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            signup.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getRoleBadgeColor = (roles: string[]) => {
        if (!roles || !Array.isArray(roles)) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        if (roles.includes('artist')) return 'bg-sky-100 text-sky-700 hover:bg-sky-200';
        if (roles.includes('printShop')) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    };

    const getRoleLabel = (roles: string[]) => {
        if (!roles || !Array.isArray(roles)) return 'User';
        if (roles.includes('artist')) return 'Artist';
        if (roles.includes('printShop')) return 'Print Shop';
        if (roles.includes('buyer')) return 'Buyer';
        return 'User';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Pending Signups</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and activate pending user signups
                        <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Note: Signups auto-activate. Manual activation available if needed.
                        </span>
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setRoleFilter('all')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredSignups.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setRoleFilter('buyer')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Buyers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filteredSignups.filter(s => s.roles?.includes('buyer')).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setRoleFilter('artist')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Artists</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-sky-600">
                                {filteredSignups.filter(s => s.roles?.includes('artist')).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setRoleFilter('printShop')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Print Shops</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {filteredSignups.filter(s => s.roles?.includes('printShop')).length}
                            </div>
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
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Role Filter */}
                            <div className="flex gap-2">
                                <Button size="sm" variant={roleFilter === 'all' ? 'default' : 'outline'} onClick={() => setRoleFilter('all')}>All</Button>
                                <Button size="sm" variant={roleFilter === 'buyer' ? 'default' : 'outline'} onClick={() => setRoleFilter('buyer')}>Buyers</Button>
                                <Button size="sm" variant={roleFilter === 'artist' ? 'default' : 'outline'} onClick={() => setRoleFilter('artist')}>Artists</Button>
                                <Button size="sm" variant={roleFilter === 'printShop' ? 'default' : 'outline'} onClick={() => setRoleFilter('printShop')}>Shops</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Signups Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Signups ({filteredSignups.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading signups...</div>
                        ) : filteredSignups.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-medium">No pending signups</p>
                                <p className="text-sm mt-2">All signups have been processed</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Role</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Signed Up</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSignups.map((signup) => (
                                            <tr key={signup.uid} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{signup.name || 'Unnamed User'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">{signup.email || 'No email'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getRoleBadgeColor(signup.roles)}>
                                                        {getRoleLabel(signup.roles)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">{formatDate(signup.createdAt)}</div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleActivateUser(signup)}
                                                        disabled={actionLoading}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <UserCheck className="h-3 w-3 mr-1" />
                                                        Activate
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

export default SignupsList;
