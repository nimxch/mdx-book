import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Loader2, User, Shield } from "lucide-react"
import { getStoredUser, initiateOAuth, loginWithToken, logout } from "@/services/auth"
import type { User as UserType } from "@/lib/db"

interface AuthProps {
  onAuthChange: (user: UserType | null) => void
}

export function Auth({ onAuthChange }: AuthProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getStoredUser().then((storedUser) => {
      setUser(storedUser)
      onAuthChange(storedUser)
    })
  }, [onAuthChange])

  if (user) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg max-w-md mx-auto">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-14 h-14 rounded-full ring-2 ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.login}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                await logout()
                setUser(null)
                onAuthChange(null)
              }}
              className="shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 bg-primary/10 rounded-full w-fit">
            <Github className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to GitHub Reader</CardTitle>
          <CardDescription>
            Sign in to download and read repositories offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={initiateOAuth}
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use a personal token
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token" className="text-sm font-medium">
              Personal Access Token
            </Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
              <Shield className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">
                Create a token at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub Settings
                </a>{" "}
                with <code className="bg-muted px-1 rounded">repo</code> scope
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            variant="outline"
            size="lg"
            onClick={async () => {
              if (!token.trim()) {
                setError("Please enter a token")
                return
              }
              setIsLoading(true)
              setError(null)
              try {
                const user = await loginWithToken(token.trim())
                setUser(user)
                onAuthChange(user)
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to login")
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Sign in with Token
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        By signing in, you agree to store your token locally in your browser
      </p>
    </div>
  )
}

function LogOut({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
