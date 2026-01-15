import { useState } from "react"
import { GitHubInput } from "@/components/book/GitHubInput"
import { BookViewer } from "@/components/book/BookViewer"
import { TableOfContents } from "@/components/book/TableOfContents"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Settings } from "lucide-react"
import type { Book, GitHubProject } from "@/types"
import { buildBook } from "@/services/github"

function App() {
  const [book, setBook] = useState<Book | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showTOC, setShowTOC] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProjectLoad = async (project: GitHubProject) => {
    setIsLoading(true)
    setError(null)

    try {
      const loadedBook = await buildBook(project)
      setBook(loadedBook)
      setCurrentChapter(0)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load book"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseBook = () => {
    setBook(null)
    setCurrentChapter(0)
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
          <Button variant="outline" size="icon">
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
              onChapterChange={setCurrentChapter}
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
            Transform GitHub repositories into beautiful reading experiences
          </p>
        </div>

        {error && (
          <Card className="max-w-2xl mx-auto mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        <GitHubInput
          onProjectLoad={handleProjectLoad}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default App
