import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Search, Bookmark, Type, MessageSquare, Book as BookIcon, Share2 } from "lucide-react"
import type { Book } from "@/types"
import { useSettings } from "@/context/SettingsContext"
import { ProgressBar } from "./ProgressBar"

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
  const { theme, fontSize, fontFamily } = useSettings()
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const currentPage = book.pages[currentPageIndex]
  const totalPages = book.pages.length

  const handlePrevious = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
      const newChapter = book.pages[currentPageIndex - 1].chapterIndex
      if (newChapter !== currentChapter) {
        onChapterChange(newChapter)
      }
    } else if (currentChapter > 0) {
      onChapterChange(currentChapter - 1)
    }
  }, [currentPageIndex, book.pages, currentChapter, onChapterChange])

  const handleNext = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
      const newChapter = book.pages[currentPageIndex + 1].chapterIndex
      if (newChapter !== currentChapter) {
        onChapterChange(newChapter)
      }
    }
  }, [currentPageIndex, totalPages, book.pages, currentChapter, onChapterChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevious()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevious, handleNext])

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href")
    if (href && (href.startsWith("http") || href.startsWith("https"))) {
      event.preventDefault()
      window.open(href, "_blank", "noopener,noreferrer")
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text && text.length > 0) {
      setSelectedText(text)
      setShowActionMenu(true)
    } else {
      setShowActionMenu(false)
      setSelectedText("")
    }
  }

  const handleAddNote = () => {
    if (selectedText) {
      alert(`Note added for: "${selectedText}"`)
      setShowActionMenu(false)
    }
  }

  const handleDictionary = () => {
    if (selectedText) {
      window.open(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(selectedText)}`, "_blank")
      setShowActionMenu(false)
    }
  }

  const handleShare = () => {
    if (selectedText && navigator.share) {
      navigator.share({
        title: book.title,
        text: selectedText,
      }).catch(() => {
        navigator.clipboard.writeText(selectedText)
        alert("Quote copied to clipboard!")
      })
    } else if (selectedText) {
      navigator.clipboard.writeText(selectedText)
      alert("Quote copied to clipboard!")
    }
    setShowActionMenu(false)
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

      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/30 backdrop-blur-sm bg-background/95 sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleTOC} 
            className="hover:bg-muted/50 lg:hidden"
            title="Table of Contents"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-muted/50 hidden md:inline-flex"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-muted/50 hidden md:inline-flex"
            title="Bookmark"
          >
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-muted/50 hidden md:inline-flex"
            title="Font Settings"
          >
            <Type className="w-5 h-5" />
          </Button>
        </div>
        
        <h1 className="flex-1 text-center px-4 text-sm md:text-base font-medium text-foreground truncate">
          {book.title}
        </h1>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover:bg-muted/50"
          title="Close"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <aside
          className={`fixed inset-y-0 left-0 w-80 bg-background border-r border-border/30 transform transition-transform duration-300 z-20 ${
            showTOC ? "translate-x-0" : "-translate-x-full"
          } lg:hidden`}
        >
          <div className="h-full overflow-y-auto p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-foreground">
              <BookOpen className="w-5 h-5" />
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {book.chapters.map((ch, index) => (
                <button
                  key={`${ch.path}-${ch.id}`}
                  onClick={() => {
                    const firstPageOfChapter = book.pages.findIndex(p => p.chapterIndex === index)
                    setCurrentPageIndex(firstPageOfChapter >= 0 ? firstPageOfChapter : 0)
                    onChapterChange(index)
                    if (window.innerWidth < 1024) onToggleTOC()
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    index === currentChapter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-60">{index + 1}</span>
                    <span className="block truncate flex-1">{ch.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {showTOC && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-10"
            onClick={onToggleTOC}
          />
        )}

        <div className="flex-1 overflow-hidden relative flex flex-row">
          <div className="flex-1 overflow-hidden relative w-full">
            <div
              className={`h-full ${getFontFamilyClass()} overflow-y-auto px-8 md:px-12 lg:px-24 py-8 pb-24 md:pb-28`}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              style={{ textAlign: 'justify', textJustify: 'inter-word', scrollBehavior: 'smooth' }}
            >
              {currentPage && (
                <div className={`${getFontSizeClass()} prose-custom`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: renderLink,
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-6">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mt-10 mb-5">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-8 mb-4">{children}</h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-lg font-semibold mt-6 mb-3">{children}</h4>
                      ),
                      p: ({ children, node }) => {
                        const hasOnlyImage = node?.children?.length === 1 && 
                          node.children[0]?.type === 'element' && 
                          node.children[0]?.tagName === 'img'
                        
                        if (hasOnlyImage) {
                          return <>{children}</>
                        }
                        
                        return <p className="mb-5 leading-[1.8]">{children}</p>
                      },
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-5 space-y-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-5 space-y-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-6 bg-muted/30 py-3 pr-3 rounded-r">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border-collapse border border-border">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="border-b border-border">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-semibold text-foreground border border-border">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-2 border border-border text-foreground">
                          {children}
                        </td>
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
                        if (!src || src.trim() === "") {
                          return null
                        }
                        
                        const hasCaption = alt && alt.trim() !== ""
                        if (hasCaption) {
                          return (
                            <figure className="my-8">
                              <img
                                src={src}
                                alt={alt}
                                className="rounded-lg max-w-full h-auto shadow-sm"
                                loading="lazy"
                              />
                              <figcaption className="text-center text-sm text-muted-foreground mt-3">
                                {alt}
                              </figcaption>
                            </figure>
                          )
                        }
                        return (
                          <img
                            src={src}
                            alt={alt || ""}
                            className="rounded-lg max-w-full h-auto shadow-sm my-6"
                            loading="lazy"
                          />
                        )
                      },
                      hr: () => <hr className="my-10 border-border/30" />,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {currentPage.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {showActionMenu && selectedText && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 min-w-40">
              <button
                onClick={handleAddNote}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">ADD NOTE</span>
              </button>
              <button
                onClick={handleDictionary}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <BookIcon className="w-4 h-4" />
                <span className="text-sm font-medium">DICTIONARY</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">SHARE</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/20">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 md:py-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentPageIndex === 0}
                  className="gap-2 hover:bg-muted/50 text-xs md:text-sm flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="text-center flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground truncate px-2">
                    <span className="hidden sm:inline">{currentPage?.title} • </span>
                    <span>Page {currentPageIndex + 1} of {totalPages}</span>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleNext}
                  disabled={currentPageIndex >= totalPages - 1}
                  className="gap-2 hover:bg-muted/50 text-xs md:text-sm flex-shrink-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
