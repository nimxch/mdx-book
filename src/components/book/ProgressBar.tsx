import type { Book } from "@/types"

interface ProgressBarProps {
  book: Book
  currentChapter: number
}

export function ProgressBar({ book, currentChapter }: ProgressBarProps) {
  const progress = ((currentChapter + 1) / book.totalChapters) * 100

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted/30 z-50 backdrop-blur-sm">
      <div
        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
