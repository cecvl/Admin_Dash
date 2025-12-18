import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '../components/layout/AdminLayout';
import SalesChart from '../components/SalesChart';
import { getSalesReport, getPlatformStatistics, type SalesDataPoint, type PlatformStatistics } from '../services/admin';
import { Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const Reports: React.FC = () => {
    const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            const [stats, salesResponse] = await Promise.all([
                getPlatformStatistics(),
                getSalesReport(),
            ]);

            setStatistics(stats);
            setSalesData(salesResponse.series || []);
        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (salesData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const csvContent = [
            ['Month', 'Orders', 'Revenue', 'Avg Order Value'].join(','),
            ...salesData.map(data => [
                data.month,
                data.orders,
                data.revenue.toFixed(2),
                data.orders > 0 ? (data.revenue / data.orders).toFixed(2) : '0.00'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Report exported successfully');
    };

    const handleExportJSON = () => {
        if (salesData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const jsonContent = JSON.stringify({
            exportDate: new Date().toISOString(),
            statistics,
            salesData
        }, null, 2);

        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Report exported successfully');
    };

    const formatCurrency = (amount: number) => {
        return `$${(amount / 1000).toFixed(1)}k`;
    };

    const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
    const totalOrders = salesData.reduce((sum, data) => sum + data.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth from previous month
    const getGrowth = () => {
        if (salesData.length < 2) return null;
        const current = salesData[salesData.length - 1];
        const previous = salesData[salesData.length - 2];
        const growth = ((current.revenue - previous.revenue) / previous.revenue) * 100;
        return growth;
    };

    const growth = getGrowth();

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto my-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">Platform performance and sales analytics</p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Loading reports...
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Last 8 months</p>
                                    {growth !== null && (
                                        <div className={`flex items-center gap-1 mt-2 text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {Math.abs(growth).toFixed(1)}% from last month
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalOrders}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Last 8 months</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Per order</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Shops</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics?.activeShops || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sales Chart */}
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Sales Performance</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Monthly revenue and order trends</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={handleExportCSV}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Export CSV
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleExportJSON}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Export JSON
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <SalesChart />
                            </CardContent>
                        </Card>

                        {/* Monthly Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {salesData.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No sales data available
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Month</th>
                                                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Orders</th>
                                                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Revenue</th>
                                                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Avg Order</th>
                                                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Growth</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salesData.map((data, index) => {
                                                    const prevData = index > 0 ? salesData[index - 1] : null;
                                                    const monthGrowth = prevData
                                                        ? ((data.revenue - prevData.revenue) / prevData.revenue) * 100
                                                        : null;

                                                    return (
                                                        <tr
                                                            key={index}
                                                            className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${selectedMonth === index ? 'bg-muted' : ''
                                                                }`}
                                                            onClick={() => setSelectedMonth(selectedMonth === index ? null : index)}
                                                        >
                                                            <td className="py-4 px-4">
                                                                <div className="font-medium">
                                                                    {new Date(data.month + '-01').toLocaleDateString('en-US', {
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                <div className="font-medium">{data.orders}</div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                <div className="font-medium">${data.revenue.toFixed(2)}</div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                <div className="text-sm text-muted-foreground">
                                                                    ${data.orders > 0 ? (data.revenue / data.orders).toFixed(2) : '0.00'}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                {monthGrowth !== null ? (
                                                                    <div className={`text-sm font-medium ${monthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {monthGrowth >= 0 ? '+' : ''}{monthGrowth.toFixed(1)}%
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-muted-foreground">-</div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default Reports;
