import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminLayout from '../components/layout/AdminLayout';
import { getUsers, updateUserRoles, deactivateUser, reactivateUser, type User } from '../services/admin';
import { Search, Edit, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'artist' | 'printShop'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Modal states
    const [showEditRolesModal, setShowEditRolesModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editUserRoles, setEditUserRoles] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Fetch all users, filter client-side to include users with multiple roles
            const response = await getUsers({ limit: 1000 });
            console.log('📦 Raw API response:', response);
            console.log('📦 First user sample:', response[0]);
            setUsers(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!user || !Array.isArray(user.roles)) return false;

        // Role filter
        const matchesRole =
            roleFilter === 'all' ? true :
                roleFilter === 'buyer' ? user.roles.includes('buyer') :
                    roleFilter === 'artist' ? user.roles.includes('artist') :
                        roleFilter === 'printShop' ? user.roles.includes('printShop') :
                            true;

        // Status filter
        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'active' ? user.isActive !== false :
                    statusFilter === 'inactive' ? user.isActive === false :
                        true;

        // Search filter
        const matchesSearch =
            searchTerm === '' ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.uid?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesRole && matchesStatus && matchesSearch;
    });

    const getRoleBadgeColor = (roles: string[]) => {
        if (!roles || !Array.isArray(roles)) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        if (roles.includes('admin')) return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
        if (roles.includes('artist')) return 'bg-sky-100 text-sky-700 hover:bg-sky-200';
        if (roles.includes('printShop')) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    };

    const getRoleLabel = (roles: string[]) => {
        if (!roles || !Array.isArray(roles)) return 'User';
        if (roles.includes('admin')) return 'Admin';
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
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const handleUpdateRoles = async () => {
        if (!selectedUser) return;

        console.log('🔄 Updating roles for user:', selectedUser.uid);
        console.log('📝 Current roles:', selectedUser.roles);
        console.log('✨ New roles:', editUserRoles);

        try {
            setActionLoading(true);

            // Make API call
            await updateUserRoles(selectedUser.uid, editUserRoles);
            console.log('✅ API call successful');

            // Update local state immediately to reflect changes
            setUsers(prevUsers => {
                const updated = prevUsers.map(user =>
                    user.uid === selectedUser.uid
                        ? { ...user, roles: editUserRoles }
                        : user
                );
                console.log('🔄 Updated users state:', updated.find(u => u.uid === selectedUser.uid));
                return updated;
            });

            // Update selected user to reflect new roles
            setSelectedUser({ ...selectedUser, roles: editUserRoles });

            toast.success('User roles updated successfully');
            setShowEditRolesModal(false);

            // Refresh from server to ensure consistency
            console.log('🔄 Fetching fresh data from server...');
            await fetchUsers();
            console.log('✅ Data refreshed');
        } catch (error) {
            console.error('❌ Error updating roles:', error);
            toast.error('Failed to update user roles');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeactivateUser = async (user: User) => {
        if (!confirm(`Are you sure you want to deactivate ${user.name || user.email}?`)) return;

        try {
            setActionLoading(true);
            await deactivateUser(user.uid);
            toast.success('User deactivated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error deactivating user:', error);
            toast.error('Failed to deactivate user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivateUser = async (user: User) => {
        try {
            setActionLoading(true);
            await reactivateUser(user.uid);
            toast.success('User reactivated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error reactivating user:', error);
            toast.error('Failed to reactivate user');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleRole = (role: string) => {
        setEditUserRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage platform users and their roles</p>
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
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant={roleFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setRoleFilter('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    size="sm"
                                    variant={roleFilter === 'buyer' ? 'default' : 'outline'}
                                    onClick={() => setRoleFilter('buyer')}
                                >
                                    Buyers
                                </Button>
                                <Button
                                    size="sm"
                                    variant={roleFilter === 'artist' ? 'default' : 'outline'}
                                    onClick={() => setRoleFilter('artist')}
                                >
                                    Artists
                                </Button>
                                <Button
                                    size="sm"
                                    variant={roleFilter === 'printShop' ? 'default' : 'outline'}
                                    onClick={() => setRoleFilter('printShop')}
                                >
                                    Shops
                                </Button>
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All Status
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

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading users...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Role</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Joined</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.uid}
                                                className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{user.name || 'Unnamed User'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getRoleBadgeColor(user.roles)}>
                                                        {getRoleLabel(user.roles)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={
                                                        user.isActive !== false
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }>
                                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(user.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setEditUserRoles(user.roles || []);
                                                                setShowEditRolesModal(true);
                                                            }}
                                                            disabled={actionLoading}
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit Roles
                                                        </Button>
                                                        {user.isActive !== false ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDeactivateUser(user)}
                                                                disabled={actionLoading}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <UserX className="h-3 w-3 mr-1" />
                                                                Deactivate
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleReactivateUser(user)}
                                                                disabled={actionLoading}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <UserCheck className="h-3 w-3 mr-1" />
                                                                Reactivate
                                                            </Button>
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

                {/* Edit Roles Modal */}
                <Dialog open={showEditRolesModal} onOpenChange={setShowEditRolesModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User Roles</DialogTitle>
                            <DialogDescription>
                                Update roles for {selectedUser?.name || selectedUser?.email}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-3">
                                {['buyer', 'artist', 'printShop', 'admin'].map(role => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`role-${role}`}
                                            checked={editUserRoles.includes(role)}
                                            onChange={() => toggleRole(role)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor={`role-${role}`} className="capitalize cursor-pointer">
                                            {role === 'printShop' ? 'Print Shop' : role}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditRolesModal(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateRoles}
                                    disabled={actionLoading || editUserRoles.length === 0}
                                >
                                    {actionLoading ? 'Updating...' : 'Update Roles'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default UsersList;
