import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Database, FileKey } from "lucide-react"

interface PrivacyPageProps {
  onBack: () => void
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
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

      <div className="space-y-12 pb-20">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-green-100 text-green-600">
              <Shield className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-light text-foreground">
            Privacy First. Always.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We built MarkBook with a simple philosophy: <strong>Your code is none of our business.</strong>
          </p>
        </div>

        <div className="grid gap-8">
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-green-700">
              <Database className="w-6 h-6" />
              <h3 className="font-medium text-lg">No Backend Database</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              MarkBook is a <strong>Local-First</strong> application. We do not have servers that store your data. 
              When you "sign in", you are simply saving your credentials locally in your own browser's secure storage. 
              We never see, store, or transmit your GitHub tokens to our servers.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-green-700">
              <FileKey className="w-6 h-6" />
              <h3 className="font-medium text-lg">Your Tokens Stay Yours</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Your Personal Access Token (PAT) is stored exclusively in `localStorage` on your device. 
              It is used directly from your browser to the GitHub API to fetch your repositories. 
              It never passes through any intermediary proxy.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-green-700">
              <Lock className="w-6 h-6" />
              <h3 className="font-medium text-lg">Offline & Private</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Downloaded repositories, chapters, and images are cached in `IndexedDB` within your browser. 
              This means your reading library exists physically on your device. 
              Clearing your browser data or clicking "Sign Out & Clear Data" completely wipes this information.
            </p>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Have security questions? <button onClick={() => window.location.href = 'mailto:security@markbook.app'} className="text-green-600 hover:underline">Contact our security team</button>.
          </p>
        </div>
      </div>
    </div>
  )
}
