import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Book } from "@/types"

interface BookViewerProps {
  book: Book
  currentChapter: number
  onChapterChange: (chapter: number) => void
  onClose: () => void
}

export function BookViewer({
  book,
  currentChapter,
  onChapterChange,
  onClose,
}: BookViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  
  console.log("BookViewer render:", { currentChapter, totalChapters: book.totalChapters, chaptersCount: book.chapters.length })
  
  const chapter = book.chapters[currentChapter] || book.chapters[0]

  console.log("Current chapter:", chapter?.title, "content length:", chapter?.content?.length)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [currentChapter])

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.href
    if (href && (href.startsWith("http") || href.startsWith("https"))) {
      event.preventDefault()
      window.open(href, "_blank", "noopener,noreferrer")
    }
  }

  const handlePrevious = () => {
    onChapterChange(Math.max(0, currentChapter - 1))
  }

  const handleNext = () => {
    onChapterChange(Math.min(book.totalChapters - 1, currentChapter + 1))
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold truncate max-w-[200px] sm:max-w-[400px]">
                {chapter?.title || "Untitled"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Chapter {currentChapter + 1} of {book.totalChapters}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentChapter === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentChapter + 1} / {book.totalChapters}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentChapter === book.totalChapters - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent
          ref={contentRef}
          className="flex-1 overflow-y-auto p-8 prose prose-slate dark:prose-invert max-w-none"
        >
          <article className="max-w-2xl mx-auto" data-chapter={currentChapter}>
            <ReactMarkdown
              components={{
                a: (props) => {
                  const href = props.href || ""
                  const isExternal = href.startsWith("http") || href.startsWith("https")
                  if (isExternal) {
                    return (
                      <a
                        {...props}
                        onClick={handleLinkClick}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {props.children}
                      </a>
                    )
                  }
                  return <a {...props}>{props.children}</a>
                },
              }}
            >
              {chapter?.content || ""}
            </ReactMarkdown>
          </article>
        </CardContent>

        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentChapter === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {book.title}
          </span>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentChapter === book.totalChapters - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
