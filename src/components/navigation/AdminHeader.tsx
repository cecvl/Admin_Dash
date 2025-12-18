import React, { useState } from "react";
import ArtPrintLogo from '../../assets/PaaJuuPrints.svg';
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import * as authService from "../../services/auth";

// Admin Header Component - Simplified version of Header.tsx for admin dashboard
const AdminHeader: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);

        try {
            await authService.login(loginEmail, loginPassword);

            toast.success("Login successful!", {
                description: "Welcome to the Admin Dashboard",
            });

            setIsAuthenticated(true);
            setShowLoginModal(false);
            setLoginEmail("");
            setLoginPassword("");

            // Reload the page to fetch data with the new session cookie
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error: any) {
            toast.error("Login failed", {
                description: error.message || "Please check your credentials and try again",
            });
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();

            toast.success("Logged out successfully", {
                description: "You have been logged out of the Admin Dashboard",
            });

            setIsAuthenticated(false);
        } catch (error: any) {
            toast.error("Logout failed", {
                description: error.message || "Please try again",
            });
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex items-center border-b border-gray-200 bg-gray-50 px-3 py-3 sm:px-4">
                {/* LOGO ON THE LEFT */}
                <div className="flex flex-none items-center min-w-[62px]">
                    <img
                        src={ArtPrintLogo}
                        alt="PaaJuu Prints Logo"
                        className="ml-1 mr-6"
                        style={{ height: 80, width: 'auto' }}
                    />
                </div>

                {/* CENTER - Admin Dashboard Label */}
                <div className="flex flex-1 justify-center min-w-0">
                    <div className="text-lg font-bold tracking-wide text-gray-800">
                        ADMIN DASHBOARD
                    </div>
                </div>

                {/* RIGHT SIDE - Login/Logout Button */}
                <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
                    {isAuthenticated ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setShowLoginModal(true)}
                        >
                            Login
                        </Button>
                    )}
                </div>
            </header>

            {/* Login Modal */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Admin Login</CardTitle>
                            <CardDescription>
                                Enter your admin credentials to access the dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            disabled={loginLoading}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                            disabled={loginLoading}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loginLoading}>
                                        {loginLoading ? "Logging in..." : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminHeader;
