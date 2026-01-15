import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, LogOut, Loader2, User } from "lucide-react"
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

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Github className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Sign in to GitHub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={initiateOAuth}
          >
            <Github className="w-4 h-4 mr-2" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use personal token
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Create a token at{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                GitHub Settings → Personal Access Tokens
              </a>
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            variant="outline"
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
                <Loader2 className="w-4 h-4 animate-spin" />
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
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <p className="font-semibold">{user.name}</p>
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
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
