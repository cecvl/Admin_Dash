import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export function SignupForm({
    className,
    onLoginClick,
    onClose,
    onGoogleSignup,
    onEmailSignup,
    ...props
}: React.ComponentPropsWithoutRef<"div"> & {
    onLoginClick?: () => void
    onClose?: () => void
    onGoogleSignup?: () => Promise<void>
    onEmailSignup?: (name: string, email: string, password: string, confirmPassword: string, userType: string) => Promise<void>
}) {
    const navigate = useNavigate()
    const [userType, setUserType] = useState<'buyer' | 'artist' | 'printShop'>('buyer')
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleGoogleClick = async () => {
        if (!onGoogleSignup) {
            toast.error("Google signup not configured")
            return
        }
        try {
            setLoading(true)
            await onGoogleSignup()
        } catch (err: any) {
            toast.error(err?.message || "Google signup failed")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!onEmailSignup) {
            toast.error("Email signup not configured")
            return
        }

        try {
            setLoading(true)
            await onEmailSignup(name, email, password, confirmPassword, userType)

            // Show success toast
            toast.success("Account created successfully!", {
                description: "Welcome to Art Print",
            })

            // Close modal if onClose is provided
            if (onClose) {
                onClose()
            }

            // Navigate to homepage
            setTimeout(() => {
                navigate("/")
            }, 500)
        } catch (err: any) {
            toast.error(err?.message || "Signup failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>
                        Enter your information below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            {/* User Type Selector */}
                            <div className="grid gap-2">
                                <Label>Account Type</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        type="button"
                                        variant={userType === 'buyer' ? 'default' : 'outline'}
                                        onClick={() => setUserType('buyer')}
                                        disabled={loading}
                                        className="flex items-center gap-1"
                                    >
                                        <span>🛍️</span>
                                        <span>Buyer</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={userType === 'artist' ? 'default' : 'outline'}
                                        onClick={() => setUserType('artist')}
                                        disabled={loading}
                                        className="flex items-center gap-1"
                                    >
                                        <span>🎨</span>
                                        <span>Artist</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={userType === 'printShop' ? 'default' : 'outline'}
                                        onClick={() => setUserType('printShop')}
                                        disabled={loading}
                                        className="flex items-center gap-1"
                                    >
                                        <span>🖨️</span>
                                        <span>Shop</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Must be at least 8 characters long.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                type="button"
                                onClick={handleGoogleClick}
                                disabled={loading}
                            >
                                {loading ? "Signing up..." : "Sign up with Google"}
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <a
                                href="#"
                                className="underline underline-offset-4"
                                onClick={(e) => {
                                    e.preventDefault()
                                    onLoginClick?.()
                                }}
                            >
                                Sign in
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
