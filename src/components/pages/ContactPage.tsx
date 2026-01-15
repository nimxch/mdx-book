import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageSquare, Github } from "lucide-react"

interface ContactPageProps {
  onBack: () => void
}

export function ContactPage({ onBack }: ContactPageProps) {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
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
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif italic font-light text-foreground">
            Get in touch
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We'd love to hear from you. Whether you have a feature request, found a bug, or just want to chat about markdown.
          </p>
        </div>

        <div className="grid gap-6">
          <a 
            href="mailto:nimaic.dev@gmail.com" 
            className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="p-4 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">Email Support</h3>
              <p className="text-sm text-muted-foreground">nimaic.dev@gmail.com</p>
            </div>
          </a>

          <a 
            href="https://github.com/nimxch/mdx-book/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="p-4 rounded-full bg-gray-100 text-gray-900 group-hover:bg-gray-200 transition-colors">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">GitHub Issues</h3>
              <p className="text-sm text-muted-foreground">Report bugs & feature requests</p>
            </div>
          </a>

          <a 
            href="https://x.com/nimxch" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="p-4 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">Social</h3>
              <p className="text-sm text-muted-foreground">Follow on X (@nimxch)</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
