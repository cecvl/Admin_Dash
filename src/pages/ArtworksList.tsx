import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AdminLayout from '../components/layout/AdminLayout';
import { getArtworks } from '../services/admin';
import type { Artwork } from '../types/admin';
import { Search, Image as ImageIcon, Grid3x3, List } from 'lucide-react';

const ArtworksList: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ready' | 'failed'>('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all artworks, filter client-side
            const response = await getArtworks();
            setArtworks(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching artworks:', error);
            setError('Failed to load artworks');
            setArtworks([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredArtworks = artworks.filter(artwork => {
        if (!artwork) return false;

        // Status filter - safely handle status property
        const artworkStatus = (artwork as any).status;
        const matchesStatus =
            statusFilter === 'all' ? true :
                artworkStatus?.toLowerCase() === statusFilter.toLowerCase();

        // Search filter
        const matchesSearch =
            searchTerm === '' ||
            artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artwork.artistId?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusBadgeColor = (status: string) => {
        if (!status) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        switch (status.toLowerCase()) {
            case 'ready':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'pending':
            case 'processing':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    const pendingCount = filteredArtworks.filter(a => a?.processingStatus === 'pending').length;
    const readyCount = filteredArtworks.filter(a => a?.processingStatus === 'ready').length;
    const failedCount = filteredArtworks.filter(a => a?.processingStatus === 'failed').length;

    if (error) {
        return (
            <AdminLayout>
                <div className="max-w-[1400px] mx-auto my-8 px-4">
                    <div className="text-center py-12">
                        <div className="text-red-600 font-semibold mb-2">Error Loading Artworks</div>
                        <div className="text-muted-foreground">{error}</div>
                        <Button onClick={fetchArtworks} className="mt-4">
                            Retry
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Artwork Management</h1>
                    <p className="text-muted-foreground mt-1">Review and manage artworks on the platform</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Artworks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredArtworks.length}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('pending')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('ready')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ready</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{readyCount}</div>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setStatusFilter('failed')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by title or artist ID..."
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
                                    variant={statusFilter === 'ready' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('ready')}
                                >
                                    Ready
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

                {/* Artworks Display */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Artworks ({filteredArtworks.length})</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3x3 className="h-4 w-4 mr-2" />
                                    Grid
                                </Button>
                                <Button
                                    size="sm"
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4 mr-2" />
                                    List
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading artworks...
                            </div>
                        ) : filteredArtworks.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No artworks found
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* Grid View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredArtworks.map((artwork) => (
                                    <div
                                        key={artwork.id}
                                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    >
                                        <div className="aspect-square bg-muted flex items-center justify-center">
                                            {artwork.imageUrl ? (
                                                <img
                                                    src={artwork.imageUrl}
                                                    alt={artwork.title || 'Artwork'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium mb-1 truncate">{artwork.title || 'Untitled'}</h3>
                                            <p className="text-sm text-muted-foreground mb-2 font-mono truncate">
                                                {artwork.artistId?.slice(0, 12) || 'Unknown'}...
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <Badge className={getStatusBadgeColor(artwork.processingStatus)}>
                                                    {artwork.processingStatus || 'unknown'}
                                                </Badge>
                                                <Button size="sm" variant="outline">
                                                    Review
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Image</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Title</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Artist ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Created</th>
                                            <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredArtworks.map((artwork) => (
                                            <tr
                                                key={artwork.id}
                                                className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                                                        {artwork.imageUrl ? (
                                                            <img
                                                                src={artwork.imageUrl}
                                                                alt={artwork.title || 'Artwork'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{artwork.title || 'Untitled'}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {artwork.artistId?.slice(0, 8) || 'Unknown'}...
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getStatusBadgeColor(artwork.processingStatus)}>
                                                        {artwork.processingStatus || 'unknown'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        {artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <Button size="sm" variant="outline">
                                                        Review
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

export default ArtworksList;
