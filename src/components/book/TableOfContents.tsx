import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Book } from "@/types"

interface TableOfContentsProps {
  book: Book
  currentChapter: number
  onChapterSelect: (index: number) => void
  onClose: () => void
}

export function TableOfContents({
  book,
  currentChapter,
  onChapterSelect,
  onClose,
}: TableOfContentsProps) {
  const handleChapterClick = (index: number) => {
    onChapterSelect(index)
    onClose()
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Table of Contents</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <nav className="space-y-1">
          {book.chapters.map((chapter, index) => (
            <button
              key={`${chapter.path}-${chapter.id}`}
              onClick={() => handleChapterClick(index)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                index === currentChapter
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className="block truncate">{chapter.title}</span>
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
