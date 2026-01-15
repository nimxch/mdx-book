import { useState, useEffect } from "react"
import { Auth } from "@/components/auth/Auth"
import { BookViewer } from "@/components/book/BookViewer"
import { Settings } from "@/components/settings/Settings"
import { Github, Loader2, BookOpen } from "lucide-react"
import type { Book } from "@/types"
import type { User } from "@/lib/db"
import { CachedRepos } from "@/components/book/CachedRepos"
import { SettingsProvider, useSettings } from "@/context/SettingsContext"

function AppContent() {
  const [user, setUser] = useState<User | null>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showTOC, setShowTOC] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [initialPageIndex, setInitialPageIndex] = useState(0)
  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Load persisted state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('book-reader-user')
    const savedBook = localStorage.getItem('book-reader-current-book')
    const savedChapter = localStorage.getItem('book-reader-current-chapter')
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse saved user', e)
      }
    }
    
    if (savedBook) {
      try {
        setBook(JSON.parse(savedBook))
      } catch (e) {
        console.error('Failed to parse saved book', e)
      }
    }
    
    if (savedChapter) {
      setCurrentChapter(parseInt(savedChapter, 10) || 0)
    }
  }, [])

  // Persist user state
  useEffect(() => {
    if (user) {
      localStorage.setItem('book-reader-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('book-reader-user')
    }
  }, [user])

  // Persist book state
  useEffect(() => {
    if (book) {
      localStorage.setItem('book-reader-current-book', JSON.stringify(book))
    } else {
      localStorage.removeItem('book-reader-current-book')
    }
  }, [book])

  // Persist chapter state
  useEffect(() => {
    if (book) {
      localStorage.setItem('book-reader-current-chapter', currentChapter.toString())
    } else {
      localStorage.removeItem('book-reader-current-chapter')
    }
  }, [currentChapter, book])

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

  const handleBookSelect = (selectedBook: Book & { initialPageIndex?: number }) => {
    setBook(selectedBook)
    setCurrentChapter(0)
    // If initialPageIndex is provided, pass to BookViewer
    setInitialPageIndex(selectedBook.initialPageIndex ?? 0)
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
        showTOC={showTOC}
        initialPageIndex={initialPageIndex}
      />
    )
  }

  // Get global theme/font from context
  const { theme, fontSize, fontFamily } = useSettings();

  return (
    <div
      className={`min-h-screen bg-background text-foreground transition-colors duration-300`}
      data-theme={theme}
      data-font-size={fontSize}
      data-font-family={fontFamily}
    >
      {/* Settings Modal Triggered by Profile Icon */}
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 border-border backdrop-blur transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Book Reader
              </h1>
            </div>
            {user && (
              <button
                className="flex items-center gap-3 hover:bg-muted/50 p-1.5 pr-3 rounded-full transition-colors group border border-transparent hover:border-border"
                onClick={() => setSettingsOpen(true)}
                title="Profile & Settings"
              >
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-1 ring-border"
                />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm hidden sm:inline text-foreground font-medium group-hover:text-primary transition-colors">{user.name}</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        {/* Download Progress Card */}
        {isDownloading && (
          <div className="max-w-2xl mx-auto mb-12 animate-in fade-in">
            <div className="p-4 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              <span className="text-sm font-medium text-foreground">Downloading repository...</span>
            </div>
          </div>
        )}

        {user ? (
          <>
            {/* Welcome Section */}
            <div className="max-w-4xl mx-auto mb-16 text-center">
              <h2 className="text-5xl md:text-6xl font-serif italic font-light mb-6 leading-tight text-foreground">
                Welcome back, {user.name.split(' ')[0]}!
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
                Your reading hub for GitHub repositories. Transform code into beautiful books with custom fonts, themes, and offline access.
              </p>


            </div>

            {/* Main Content */}
            <CachedRepos
              onBookSelect={handleBookSelect}
              onDownloadStart={handleDownloadStart}
            />
          </>
        ) : (
          <Auth onAuthChange={handleAuthChange} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="font-medium text-sm mb-4 flex items-center gap-2 text-foreground">
                  <BookOpen className="w-4 h-4" />
                  Book Reader
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Read repositories the way they deserve to be read—beautifully, offline, on your terms.</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-4 text-foreground">Features</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><a href="#" className="hover:text-green-600 transition-colors">Offline Reading</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Custom Themes</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Privacy First</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-4 text-foreground">Project</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><a href="#" className="hover:text-green-600 transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
              <p>Read better. Read anywhere. Read yours.</p>
            </div>
          </div>
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
