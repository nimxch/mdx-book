import { useState, useEffect } from "react"
import { Auth } from "@/components/auth/Auth"
import { BookViewer } from "@/components/book/BookViewer"
import { Settings } from "@/components/settings/Settings"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Loader2 } from "lucide-react"
import type { Book } from "@/types"
import type { User } from "@/lib/db"
import { CachedRepos } from "@/components/book/CachedRepos"
import { SettingsProvider } from "@/context/SettingsContext"

function AppContent() {
  const [user, setUser] = useState<User | null>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showTOC, setShowTOC] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    if (code) {
      handleOAuthCallback(code)
    }
  }, [])

  const handleOAuthCallback = async (code: string) => {
    try {
      const { handleOAuthCallback: exchangeCode } = await import("@/services/auth")
      const user = await exchangeCode(code)
      setUser(user)
      window.history.replaceState({}, "", window.location.pathname)
    } catch (error) {
      console.error("OAuth error:", error)
    }
  }

  const handleAuthChange = (newUser: User | null) => {
    setUser(newUser)
  }

  const handleBookSelect = (selectedBook: Book) => {
    setBook(selectedBook)
    setCurrentChapter(0)
  }

  const handleCloseBook = () => {
    setBook(null)
    setCurrentChapter(0)
    setShowTOC(false)
  }

  const handleDownloadStart = () => {
    setIsDownloading(true)
  }

  if (book) {
    return (
      <BookViewer
        book={book}
        currentChapter={currentChapter}
        onChapterChange={setCurrentChapter}
        onClose={handleCloseBook}
        onToggleTOC={() => setShowTOC(!showTOC)}
        showTOC={showTOC}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Settings />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GitHub Book Reader</h1>
                <p className="text-sm text-muted-foreground">
                  Beautiful offline reading for GitHub repositories
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isDownloading && (
          <Card className="max-w-2xl mx-auto mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Downloading repository...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="max-w-4xl mx-auto">
          {user ? (
            <CachedRepos
              onBookSelect={handleBookSelect}
              onDownloadStart={handleDownloadStart}
            />
          ) : (
            <Auth onAuthChange={handleAuthChange} />
          )}
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>GitHub Book Reader - Transform repositories into beautiful reading experiences</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

export default App
