import { useState, useEffect } from "react"
import { Auth } from "@/components/auth/Auth"
import { BookViewer } from "@/components/book/BookViewer"
import { Settings } from "@/components/settings/Settings"
import { Loader2, BookOpen } from "lucide-react"
import type { Book } from "@/types"
import type { User } from "@/lib/db"
import { CachedRepos } from "@/components/book/CachedRepos"
import { SettingsProvider, useSettings } from "@/context/SettingsContext"
import { FeaturesPage } from "@/components/pages/FeaturesPage"
import { PrivacyPage } from "@/components/pages/PrivacyPage"
import { ContactPage } from "@/components/pages/ContactPage"
import { SpeedInsightsPage } from "@/components/pages/SpeedInsightsPage"

type ViewState = 'dashboard' | 'features' | 'privacy' | 'contact' | 'speed-insights'

function AppContent() {
  const [user, setUser] = useState<User | null>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showTOC, setShowTOC] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [initialPageIndex, setInitialPageIndex] = useState(0)
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')

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
        // Failed to parse saved user
      }
    }
    
    if (savedBook) {
      try {
        setBook(JSON.parse(savedBook))
      } catch (e) {
        // Failed to parse saved book
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

  const handleNavigate = (view: ViewState, sectionId?: string) => {
    setBook(null) // Close book if open
    setCurrentView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    if (sectionId) {
      // Small timeout to allow render
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
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
      className={`min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col`}
      data-theme={theme}
      data-font-size={fontSize}
      data-font-family={fontFamily}
    >
      {/* Settings Modal Triggered by Profile Icon */}
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Header - Only show when logged in */}
      {user && (
        <header className="sticky top-0 z-40 border-b bg-background/95 border-border backdrop-blur transition-colors duration-300">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-serif italic font-medium tracking-tight text-foreground">
                  MarkBook
                </h1>
              </button>
              
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
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-20 flex-grow">
        {currentView === 'features' ? (
           <FeaturesPage onBack={() => setCurrentView('dashboard')} />
        ) : currentView === 'privacy' ? (
           <PrivacyPage onBack={() => setCurrentView('dashboard')} />
        ) : currentView === 'contact' ? (
           <ContactPage onBack={() => setCurrentView('dashboard')} />
        ) : currentView === 'speed-insights' ? (
           <SpeedInsightsPage onBack={() => setCurrentView('dashboard')} />
        ) : (
          <>
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
                    Convert GitHub markdown repositories into organized, offline-ready electronic books.
                  </p>
                </div>

                {/* Main Content */}
                <CachedRepos
                  onBookSelect={handleBookSelect}
                  onDownloadStart={handleDownloadStart}
                  onDownloadEnd={() => setIsDownloading(false)}
                />
              </>
            ) : (
              <Auth onAuthChange={handleAuthChange} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <button onClick={() => setCurrentView('dashboard')} className="font-medium text-sm mb-4 flex items-center gap-2 text-foreground hover:text-green-600 transition-colors">
                  <BookOpen className="w-4 h-4" />
                  MarkBook
                </button>
                <p className="text-xs text-muted-foreground leading-relaxed">Read repositories the way they deserve to be read—beautifully, offline, on your terms.</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-4 text-foreground">Features</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><button onClick={() => handleNavigate('features', 'offline-reading')} className="hover:text-green-600 transition-colors text-left">Offline Reading</button></li>
                  <li><button onClick={() => handleNavigate('features', 'custom-themes')} className="hover:text-green-600 transition-colors text-left">Custom Themes</button></li>
                  <li><button onClick={() => handleNavigate('features', 'privacy-first')} className="hover:text-green-600 transition-colors text-left">Privacy First</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-4 text-foreground">Project</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><a href="https://github.com/nimxch/mdx-book" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">GitHub</a></li>
                  <li><button onClick={() => setCurrentView('speed-insights')} className="hover:text-green-600 transition-colors text-left">Speed Insights</button></li>
                  <li><button onClick={() => setCurrentView('privacy')} className="hover:text-green-600 transition-colors text-left">Privacy</button></li>
                  <li><button onClick={() => setCurrentView('contact')} className="hover:text-green-600 transition-colors text-left">Contact</button></li>
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
