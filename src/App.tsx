import { useState, useEffect } from "react"
import { Auth } from "@/components/auth/Auth"
import { BookViewer } from "@/components/book/BookViewer"
import { Settings } from "@/components/settings/Settings"
import { BookOpen, Loader2, Zap, Eye, Lock } from "lucide-react"
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
  const [initialPageIndex, setInitialPageIndex] = useState(0)

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
        onToggleTOC={() => setShowTOC(!showTOC)}
        showTOC={showTOC}
        initialPageIndex={initialPageIndex}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Settings />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                Book Reader
              </h1>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-1 ring-gray-300"
                />
                <span className="text-sm hidden sm:inline text-gray-700">{user.name}</span>
              </div>
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
              <span className="text-sm font-medium text-gray-900">Downloading repository...</span>
            </div>
          </div>
        )}

        {user ? (
          <>
            {/* Welcome Section */}
            <div className="max-w-4xl mx-auto mb-16 text-center">
              <h2 className="text-5xl md:text-6xl font-serif italic font-light mb-6 leading-tight text-gray-900">
                Welcome back, {user.name.split(' ')[0]}!
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-12">
                Your reading hub for GitHub repositories. Transform code into beautiful books with custom fonts, themes, and offline access.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                  <Zap className="w-5 h-5 text-green-600 mb-3 mx-auto" />
                  <h3 className="font-medium text-sm mb-2 text-gray-900">Instant Access</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Convert GitHub repos into readable format in seconds</p>
                </div>
                <div className="p-6 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                  <Eye className="w-5 h-5 text-green-600 mb-3 mx-auto" />
                  <h3 className="font-medium text-sm mb-2 text-gray-900">Customize Everything</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Choose your font, size, color and reading experience</p>
                </div>
                <div className="p-6 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                  <Lock className="w-5 h-5 text-green-600 mb-3 mx-auto" />
                  <h3 className="font-medium text-sm mb-2 text-gray-900">Fully Private</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Everything stays on your device, always</p>
                </div>
              </div>
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
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="font-medium text-sm mb-4 flex items-center gap-2 text-gray-900">
                  <BookOpen className="w-4 h-4" />
                  Book Reader
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">Read repositories the way they deserve to be read—beautifully, offline, on your terms.</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-4 text-gray-900">Features</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li><a href="#" className="hover:text-green-600 transition-colors">Offline Reading</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Custom Themes</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Privacy First</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-4 text-gray-900">Project</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li><a href="#" className="hover:text-green-600 transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-green-600 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 text-center text-xs text-gray-600">
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
