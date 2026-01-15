import type { Book } from "@/types"

interface ProgressBarProps {
  book: Book
  currentChapter: number
}

export function ProgressBar({ book, currentChapter }: ProgressBarProps) {
  const progress = ((currentChapter + 1) / book.totalChapters) * 100

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
