import { useEffect, useRef, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Loader2 } from "lucide-react"
import type { Book } from "@/types"
import { useSettings } from "@/context/SettingsContext"
import { ProgressBar } from "./ProgressBar"
import { getFileContent } from "@/services/github"

interface BookViewerProps {
  book: Book
  currentChapter: number
  onChapterChange: (chapter: number) => void
  onClose: () => void
  onToggleTOC: () => void
  showTOC: boolean
}

export function BookViewer({
  book,
  currentChapter,
  onChapterChange,
  onClose,
  onToggleTOC,
  showTOC,
}: BookViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const chapter = book.chapters[currentChapter] || book.chapters[0]
  const { theme, fontSize, fontFamily } = useSettings()
  const [content, setContent] = useState(chapter?.content || "")
  const [isLoading, setIsLoading] = useState(false)

  const fetchChapterContent = useCallback(async () => {
    if (!chapter) return

    const isLargeFile = chapter.content.length > 500000

    if (!isLargeFile || !chapter.path) {
      setContent(chapter.content)
      return
    }

    setIsLoading(true)
    try {
      const repo = book.title
      const owner = book.description?.split(" - ")[0] || ""
      const content = await getFileContent(owner, repo, chapter.path, chapter.id)
      setContent(content)
    } catch (error) {
      console.error("Failed to load chapter content:", error)
      setContent(chapter.content)
    } finally {
      setIsLoading(false)
    }
  }, [chapter, book])

  useEffect(() => {
    fetchChapterContent()
  }, [fetchChapterContent])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [currentChapter, content])

  const handlePrevious = () => {
    onChapterChange(Math.max(0, currentChapter - 1))
  }

  const handleNext = () => {
    onChapterChange(Math.min(book.totalChapters - 1, currentChapter + 1))
  }

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href")
    if (href && (href.startsWith("http") || href.startsWith("https"))) {
      event.preventDefault()
      window.open(href, "_blank", "noopener,noreferrer")
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "prose-sm"
      case "lg": return "prose-lg"
      case "xl": return "prose-xl"
      default: return "prose-base"
    }
  }

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "sans": return "font-sans"
      case "mono": return "font-mono"
      default: return "font-serif"
    }
  }

  const getThemeClasses = () => {
    switch (theme) {
      case "dark": return "bg-slate-900 text-slate-100"
      case "sepia": return "bg-[#f4ecd8] text-slate-800"
      default: return "bg-white text-slate-900"
    }
  }

  const renderLink = (props: { href?: string; children?: React.ReactNode }) => {
    const href = props.href || ""
    const isExternal = href.startsWith("http") || href.startsWith("https")
    
    if (isExternal) {
      return (
        <a
          {...props}
          href={href}
          onClick={handleLinkClick}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          {props.children}
          <svg className="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )
    }
    
    return <a {...props} href={href}>{props.children}</a>
  }

  return (
    <div className={`h-screen flex flex-col ${getThemeClasses()} transition-colors duration-300`}>
      <ProgressBar book={book} currentChapter={currentChapter} />

      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onToggleTOC}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="font-semibold truncate max-w-[200px] sm:max-w-[300px] text-foreground">
              {chapter?.title || "Untitled"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {book.title} • {currentChapter + 1} of {book.totalChapters}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-background border-r transform transition-transform duration-300 z-20 ${
            showTOC ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 ${showTOC ? "lg:w-72" : "lg:w-0"}`}
        >
          <div className="h-full overflow-y-auto p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Contents
            </h3>
            <nav className="space-y-1">
              {book.chapters.map((ch, index) => {
                const chapterSize = ch.content.length
                const isLarge = chapterSize > 500000
                const sizeLabel = isLarge ? " (large)" : ""
                
                return (
                  <button
                    key={`${ch.path}-${ch.id}`}
                    onClick={() => {
                      onChapterChange(index)
                      if (window.innerWidth < 1024) onToggleTOC()
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      index === currentChapter
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="block truncate">{ch.title}{sizeLabel}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {showTOC && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-10"
            onClick={onToggleTOC}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Loading large chapter...</p>
              </div>
            </div>
          ) : (
            <article
              ref={contentRef}
              className={`max-w-2xl mx-auto px-6 py-8 ${getFontFamilyClass()}`}
            >
              <div className={getFontSizeClass()}>
                <ReactMarkdown
                  components={{
                    a: renderLink,
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="leading-relaxed mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="ml-4">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4 bg-muted/30 py-2 pr-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    code: (props) => {
                      const { inline, className, children } = props as { inline?: boolean; className?: string; children?: React.ReactNode }
                      if (inline) {
                        return (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className={`${className || ""} block p-4 rounded-lg overflow-x-auto my-4 bg-muted`}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="overflow-x-auto my-4 rounded-lg bg-muted p-4">
                        {children}
                      </pre>
                    ),
                    img: ({ src, alt }) => {
                      const hasCaption = alt && alt.trim() !== ""
                      if (hasCaption) {
                        return (
                          <figure className="my-6">
                            <img
                              src={src}
                              alt={alt}
                              className="rounded-lg max-w-full h-auto"
                              loading="lazy"
                            />
                            <figcaption className="text-center text-sm text-muted-foreground mt-2">
                              {alt}
                            </figcaption>
                          </figure>
                        )
                      }
                      return (
                        <img
                          src={src}
                          alt={alt || ""}
                          className="rounded-lg max-w-full h-auto"
                          loading="lazy"
                        />
                      )
                    },
                    hr: () => <hr className="my-8 border-border" />,
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentChapter === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentChapter === book.totalChapters - 1}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  )
}
