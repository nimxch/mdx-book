import type { Book } from "@/types"

interface ProgressBarProps {
  book: Book
  currentChapter: number
}

export function ProgressBar({ book, currentChapter }: ProgressBarProps) {
  const currentPage = book.pages.findIndex(p => p.chapterIndex === currentChapter)
  const progress = currentPage >= 0 ? ((currentPage + 1) / book.pages.length) * 100 : 0

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted/30 z-50 backdrop-blur-sm">
      <div
        className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-500 ease-out shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
