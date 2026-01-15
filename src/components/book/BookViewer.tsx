import { useEffect, useState, useCallback, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Search, Bookmark, Type, MessageSquare, Book as BookIcon, Share2, Home, Maximize2, Minimize2, ChevronDown } from "lucide-react"
import type { Book } from "@/types"
import { useSettings } from "@/context/SettingsContext"
import { ProgressBar } from "./ProgressBar"
import { db } from "@/lib/db"
import type { BookBookmark } from "@/types"

interface BookViewerProps {
  book: Book
  currentChapter: number
  onChapterChange: (chapter: number) => void
  onClose: () => void
  showTOC: boolean
}

export function BookViewer({
  book,
  currentChapter,
  onChapterChange,
  onClose,
  initialPageIndex = 0,
}: BookViewerProps & { initialPageIndex?: number }) {
  const { theme, fontSize, fontFamily } = useSettings()
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarks, setBookmarks] = useState<BookBookmark[]>([])
  const [zenMode, setZenMode] = useState(false)
  const [showDownArrow, setShowDownArrow] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [searchMode, setSearchMode] = useState<'page' | 'repo'>("page")
  const [fontOption, setFontOption] = useState<'serif' | 'sans' | 'mono'>(fontFamily || 'serif')
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

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
    // Scroll to top
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
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
    // Scroll to top
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
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

  useEffect(() => {
    // Load single bookmark for this repo
    db.bookmarks
      .where({ repoId: `${book.owner}/${book.repo}` })
      .first()
      .then((b) => {
        if (b) {
          setBookmarks([{ pageIndex: b.pageIndex, chapterIndex: b.chapterIndex, title: b.title, createdAt: b.createdAt }])
          setIsBookmarked(b.pageIndex === currentPageIndex)
        } else {
          setBookmarks([])
          setIsBookmarked(false)
        }
      })
  }, [book.owner, book.repo, currentPageIndex])

  useEffect(() => {
    // On mount, jump to bookmarked page if exists
    db.bookmarks
      .where({ repoId: `${book.owner}/${book.repo}` })
      .first()
      .then((b) => {
        if (b && b.pageIndex !== undefined) {
          setCurrentPageIndex(b.pageIndex)
        }
      })
  }, [book.owner, book.repo])

  const handleBookmark = async () => {
    // Always keep only one bookmark per repo
    await db.bookmarks.where({ repoId: `${book.owner}/${book.repo}` }).delete()
    await db.bookmarks.add({
      id: `${book.owner}/${book.repo}`,
      repoId: `${book.owner}/${book.repo}`,
      pageIndex: currentPageIndex,
      chapterIndex: currentPage.chapterIndex,
      title: currentPage.title,
      createdAt: Date.now(),
    })
    setIsBookmarked(true)
    setBookmarks([{ pageIndex: currentPageIndex, chapterIndex: currentPage.chapterIndex, title: currentPage.title, createdAt: Date.now() }])
  }

  const handleZenMode = () => {
    if (!zenMode) {
      // Enter fullscreen
      const el = document.documentElement
      if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen()
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen()
      }
      setZenMode(true)
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setZenMode(false)
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setZenMode(false)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const handleResize = () => {
    if (zenMode && contentRef.current) {
      contentRef.current.style.height = `${window.innerHeight}px`
    }
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [zenMode])

  const handleScroll = (direction: 'up' | 'down') => {
    if (contentRef.current) {
      const scrollStep = 100
      const { scrollTop } = contentRef.current
      if (direction === 'up') {
        contentRef.current.scrollTo({ top: scrollTop - scrollStep, behavior: 'smooth' })
      } else {
        contentRef.current.scrollTo({ top: scrollTop + scrollStep, behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const el = contentRef.current
        setShowDownArrow(el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 2)
      }
    }
    checkOverflow()
    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', checkOverflow)
    }
    window.addEventListener('resize', checkOverflow)
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('scroll', checkOverflow)
      }
      window.removeEventListener('resize', checkOverflow)
    }
  }, [currentPageIndex, book, zenMode])

  // Search logic
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([])
      setActiveSearchIndex(0)
      return
    }
    let results: number[] = []
    if (searchMode === 'page') {
      const content = currentPage.content.toLowerCase()
      let idx = content.indexOf(searchTerm.toLowerCase())
      while (idx !== -1) {
        results.push(idx)
        idx = content.indexOf(searchTerm.toLowerCase(), idx + 1)
      }
    } else {
      // repo search: find all page indices containing the term
      results = book.pages
        .map((p, i) => p.content.toLowerCase().includes(searchTerm.toLowerCase()) ? i : -1)
        .filter(i => i !== -1)
    }
    setSearchResults(results)
    setActiveSearchIndex(0)
  }, [searchTerm, searchMode, currentPage, book.pages])

  // Font change logic
  useEffect(() => {
    // Optionally persist fontOption in localStorage or context
  }, [fontOption])

  return (
    <div className={`h-screen flex flex-col font-${fontFamily} bg-background text-foreground transition-colors duration-300${zenMode ? ' zen-mode-active' : ''}`} data-theme={theme} data-font-size={fontSize} data-font-family={fontFamily}>
      <ProgressBar book={book} currentChapter={currentChapter} />

      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/30 backdrop-blur-sm bg-background/95 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-muted/50"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Button>
          <Button 
            variant={zenMode ? "default" : "ghost"}
            size="icon"
            className={zenMode ? "bg-green-600 text-white" : "hover:bg-muted/50"}
            title={zenMode ? "Exit Fullscreen" : "Zen Mode (Fullscreen)"}
            onClick={handleZenMode}
          >
            {zenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          <Button 
            variant={isBookmarked ? "default" : "ghost"}
            size="icon"
            className={isBookmarked ? "bg-green-600 text-white" : "hover:bg-muted/50"}
            title={isBookmarked ? "Bookmarked" : "Bookmark this page"}
            onClick={handleBookmark}
          >
            <Bookmark className="w-5 h-5" />
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
            title="Font Settings"
          >
            <Type className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={searchMode === 'page' ? "Search in page..." : "Search in repo..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-40 text-sm"
          />
          <Button
            variant={searchMode === 'page' ? "default" : "ghost"}
            size="sm"
            onClick={() => setSearchMode('page')}
          >Page</Button>
          <Button
            variant={searchMode === 'repo' ? "default" : "ghost"}
            size="sm"
            onClick={() => setSearchMode('repo')}
          >Repo</Button>
          <select
            value={fontOption}
            onChange={e => setFontOption(e.target.value as any)}
            className="ml-2 border rounded px-2 py-1 text-sm"
          >
            <option value="serif">Serif</option>
            <option value="sans">Sans</option>
            <option value="mono">Mono</option>
          </select>
        </div>
        <h1 className="flex-1 text-center px-4 text-sm md:text-base font-medium text-foreground truncate">
          {book.title}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className={`flex-1 overflow-hidden flex${zenMode ? ' zen' : ''}`}>
        <div className="flex-1 overflow-hidden relative flex flex-row">
          <div className="flex-1 overflow-hidden relative w-full">
            <div
              ref={contentRef}
              className={`h-full font-${fontOption} ${getFontFamilyClass()} overflow-y-auto no-scrollbar px-8 md:px-12 lg:px-24 py-8 pb-24 md:pb-28${zenMode ? ' bg-background' : ''}`}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              style={{ textAlign: 'justify', textJustify: 'inter-word', scrollBehavior: 'smooth', position: 'relative' }}
            >
              {/* Highlight search results in page */}
              {searchTerm && searchMode === 'page' ? (
                <div className="bg-yellow-100">
                  {currentPage.content.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                      <mark key={i} className="bg-yellow-300 text-black">{part}</mark>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              ) : (
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
              )}
              {/* Repo search navigation */}
              {searchTerm && searchMode === 'repo' && searchResults.length > 0 && (
                <div className="fixed left-1/2 bottom-24 z-30 flex gap-2 items-center" style={{ transform: 'translateX(-50%)' }}>
                  <Button size="sm" onClick={() => setCurrentPageIndex(searchResults[Math.max(activeSearchIndex - 1, 0)])} disabled={activeSearchIndex === 0}>Prev</Button>
                  <span className="text-xs">{activeSearchIndex + 1} / {searchResults.length}</span>
                  <Button size="sm" onClick={() => setCurrentPageIndex(searchResults[Math.min(activeSearchIndex + 1, searchResults.length - 1)])} disabled={activeSearchIndex === searchResults.length - 1}>Next</Button>
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

          {showDownArrow && (
            <div style={{ position: 'absolute', left: '50%', bottom: 32, transform: 'translateX(-50%)', zIndex: 20, opacity: 0.25 }}>
              <ChevronDown className="w-14 h-14 animate-flicker" />
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
