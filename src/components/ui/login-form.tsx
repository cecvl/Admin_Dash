import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export function LoginForm({
  className,
  onSignUpClick,
  onClose,
  onGoogleLogin,
  onEmailLogin,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  onSignUpClick?: () => void
  onClose?: () => void
  onGoogleLogin?: () => Promise<void>
  onEmailLogin?: (email: string, password: string) => Promise<void>
}) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGoogleClick = async () => {
    if (!onGoogleLogin) {
      toast.error("Google login not configured")
      return
    }
    try {
      setLoading(true)
      await onGoogleLogin()
    } catch (err: any) {
      toast.error(err?.message || "Google login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!onEmailLogin) {
      toast.error("Email login not configured")
      return
    }

    try {
      setLoading(true)
      await onEmailLogin(email, password)

      // Show success toast
      toast.success("Login successful!", {
        description: "Welcome back to Art Print",
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
      toast.error(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login with Google"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="underline underline-offset-4"
                onClick={(e) => {
                  e.preventDefault()
                  onSignUpClick?.()
                }}
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
