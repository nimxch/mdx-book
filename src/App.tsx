import { useState, useEffect } from "react"
import { Auth } from "@/components/auth/Auth"
import { BookViewer } from "@/components/book/BookViewer"
import { TableOfContents } from "@/components/book/TableOfContents"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Settings, Loader2 } from "lucide-react"
import type { Book } from "@/types"
import type { User } from "@/lib/db"
import { CachedRepos } from "@/components/book/CachedRepos"

function App() {
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
    console.log("Book selected:", selectedBook.title, "chapters:", selectedBook.chapters.length)
    setBook(selectedBook)
    setCurrentChapter(0)
  }

  const handleCloseBook = () => {
    setBook(null)
    setCurrentChapter(0)
  }

  const handleDownloadStart = () => {
    setIsDownloading(true)
  }

  if (book) {
    return (
      <div className="container mx-auto p-4 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTOC(!showTOC)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{book.title}</h1>
              {book.description && (
                <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {book.description}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={handleCloseBook}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {showTOC && (
            <div className="w-64 hidden md:block">
              <TableOfContents
                book={book}
                currentChapter={currentChapter}
                onChapterSelect={setCurrentChapter}
                onClose={() => setShowTOC(false)}
              />
            </div>
          )}
          <div className="flex-1">
            <BookViewer
              book={book}
              currentChapter={currentChapter}
              onChapterChange={(chapter) => {
                console.log("Chapter changed to:", chapter)
                setCurrentChapter(chapter)
              }}
              onClose={handleCloseBook}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">GitHub Book Reader</h1>
          <p className="text-muted-foreground">
            Download GitHub repositories for offline reading
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {isDownloading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Downloading repository...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {user ? (
            <CachedRepos
              onBookSelect={handleBookSelect}
              onDownloadStart={handleDownloadStart}
            />
          ) : (
            <Auth onAuthChange={handleAuthChange} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
