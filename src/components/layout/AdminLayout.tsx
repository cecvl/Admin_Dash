import React from 'react';
import AdminHeader from '../navigation/AdminHeader';
import AdminSidebar from '../navigation/AdminSidebar';
import Footer from '../navigation/Footer';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <AdminHeader />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminLayout;

