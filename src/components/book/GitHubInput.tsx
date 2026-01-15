import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Github, BookOpen, Loader2 } from "lucide-react"
import type { GitHubProject } from "@/types"
import { parseGitHubUrl } from "@/services/github"

interface GitHubInputProps {
  onProjectLoad: (project: GitHubProject) => void
  isLoading: boolean
}

export function GitHubInput({ onProjectLoad, isLoading }: GitHubInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const project = parseGitHubUrl(url.trim())
    if (!project) {
      setError(
        "Invalid GitHub URL. Please use format: https://github.com/owner/repo or owner/repo"
      )
      return
    }

    onProjectLoad(project)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">GitHub Book Reader</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-url">GitHub Repository URL</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Load Book
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Enter a GitHub repository URL containing markdown files</p>
          <p className="mt-1">
            Examples:{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              facebook/react
            </code>{" "}
            or{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              https://github.com/vercel/next.js/tree/main/docs
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
