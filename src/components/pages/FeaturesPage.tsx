import { Button } from "@/components/ui/button"
import { ArrowLeft, WifiOff, Palette, Shield } from "lucide-react"

interface FeaturesPageProps {
  onBack: () => void
}

export function FeaturesPage({ onBack }: FeaturesPageProps) {


  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-2 pl-0 hover:bg-transparent hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-16 pb-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif italic font-light text-foreground">
            Features
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Built for developers who love to read code.
          </p>
        </div>

        {/* Offline Reading Section */}
        <div id="offline-reading" className="scroll-mt-24 p-8 rounded-2xl bg-muted/30 border border-border">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 rounded-xl bg-orange-100 text-orange-600 shrink-0">
              <WifiOff className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-foreground">Offline Reading</h2>
              <p className="text-muted-foreground leading-relaxed">
                Once you download a repository, it's yours to keep locally. MarkBook utilizes 
                advanced caching strategies (IndexedDB) to store chapters, images, and formatting 
                specifically on your device.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Read on trains, planes, or disconnected environments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Zero latency page turns
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Automatic background syncing when online
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Custom Themes Section */}
        <div id="custom-themes" className="scroll-mt-24 p-8 rounded-2xl bg-muted/30 border border-border">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 rounded-xl bg-purple-100 text-purple-600 shrink-0">
              <Palette className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-foreground">Custom Themes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Code shouldn't hurt your eyes. We provide carefully crafted themes designed for long 
                reading sessions, whether you prefer high contrast or paper-like comfort.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  System, Light, Dark, and Sepia modes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Adjustable font sizes and families (Serif/Sans)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Distraction-free "Zen Mode"
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy First Section */}
        <div id="privacy-first" className="scroll-mt-24 p-8 rounded-2xl bg-muted/30 border border-border">
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="p-4 rounded-xl bg-green-100 text-green-600 shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-foreground">Privacy First</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your code and reading habits are your business. This application is architected as a 
                "Local-First" web app. We don't have a backend database storing your tokens or repos.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  GitHub Tokens stored only in localStorage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Repositories cached in your browser's IndexedDB
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  No analytics or tracking scripts
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
