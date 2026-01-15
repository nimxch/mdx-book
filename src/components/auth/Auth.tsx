import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Check, LogOut } from "lucide-react"
import { getStoredUser, loginWithToken, logout } from "@/services/auth"
import type { User } from "@/lib/db"

interface AuthProps {
  onAuthChange: (user: User | null) => void
}

export function Auth({ onAuthChange }: AuthProps) {
  const [user, setUser] = useState<User | null>(null)
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
      <Card className="border-gray-200 max-w-2xl mx-auto bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-14 h-14 rounded-full ring-1 ring-gray-300"
              />
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-600">@{user.login}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout()
                setUser(null)
                onAuthChange(null)
              }}
              className="gap-2 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left side - Value Proposition */}
        <div className="space-y-8">
          <div>
            <h2 className="text-5xl font-serif italic font-light mb-4 leading-tight text-gray-900">
              Read Code Better
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Sign in to transform GitHub repositories into beautifully formatted, offline-readable experiences tailored to your preferences.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full mt-1 shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Access public repositories instantly</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full mt-1 shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Customize fonts, themes, and reading mode</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full mt-1 shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Read offline with automatic syncing</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full mt-1 shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">All data stays private on your device</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs uppercase tracking-wider text-gray-600 mb-3">Privacy & Security</p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600/50"></div>
                No tracking
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600/50"></div>
                No analytics
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600/50"></div>
                Local first
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h3 className="text-2xl font-serif italic font-light mb-2 text-gray-900">Connect GitHub</h3>
                  <p className="text-sm text-gray-600">Securely connect your account to access your repositories.</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                  <p className="mb-2 font-medium">How it works (Local & Private)</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700/90">
                    <li>Create a secure token on GitHub</li>
                    <li>Paste it below to sign in</li>
                  </ol>
                  <p className="mt-2 text-xs opacity-75">Your token is stored <strong>only on this device</strong>.</p>
                </div>

                {/* Token Generation */}
                <div>
                  <button
                    onClick={() => {
                        import("@/services/auth").then(m => m.openGitHubTokenPage())
                    }}
                    className="w-full group mb-4"
                  >
                    <div className="relative p-3 rounded border border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400 transition-all text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-700 font-medium text-sm">
                        <Github className="w-4 h-4" />
                        <span>Step 1: Generate Token on GitHub</span>
                      </div>
                    </div>
                  </button>

                  <div className="relative flex justify-center text-xs mb-4">
                     <span className="bg-white px-2 text-gray-400">Step 2: Paste & Connect</span>
                  </div>

                  {/* Token Form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
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
                    className="space-y-3"
                  >
                    <div className="space-y-2">
                       <Input
                         type="password"
                         placeholder="Paste your token here (ghp_...)"
                         value={token}
                         onChange={(e) => setToken(e.target.value)}
                         disabled={isLoading}
                         className="text-sm border-gray-300 bg-white text-gray-900 placeholder-gray-500 font-mono"
                       />
                       <p className="text-xs text-gray-500 mt-2 italic">
                         Note: This will be used in case you are downloading a private repository.
                       </p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white border-transparent"
                      disabled={!token || isLoading}
                    >
                      {isLoading ? "Connecting..." : "Connect GitHub Account"}
                    </Button>
                  </form>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      // Import dynamically to avoid circular dependencies if any
                      const { loginAsGuest } = await import("@/services/auth")
                      const user = await loginAsGuest()
                      setUser(user)
                      onAuthChange(user)
                    } catch (err) {
                      setError("Failed to continue as guest")
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  variant="ghost"
                  className="w-full text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Continue as Guest
                </Button>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded bg-red-50 border border-red-200">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-600 mt-6">
            Free, private, and no ads ever.
          </p>
        </div>
      </div>
    </div>
  )
}
