import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Package,
    CreditCard,
    Store,
    Image,
    BarChart3,
    UserPlus,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Signups',
        href: '/signups',
        icon: UserPlus,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: Package,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard,
    },
    {
        title: 'Print Shops',
        href: '/printshops',
        icon: Store,
    },
    {
        title: 'Artworks',
        href: '/artworks',
        icon: Image,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
    },
];

const AdminSidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="w-64 border-r bg-gray-50/50 min-h-screen p-4">
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
