import { Button } from "@/components/ui/button"
import { ArrowLeft, Zap, Code, TrendingUp, CheckCircle } from "lucide-react"

interface SpeedInsightsPageProps {
  onBack: () => void
}

export function SpeedInsightsPage({ onBack }: SpeedInsightsPageProps) {
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

      <div className="space-y-12 pb-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-green-600" />
            <h1 className="text-4xl md:text-5xl font-serif italic font-light text-foreground">
              Getting Started with Speed Insights
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to enable Vercel Speed Insights on your project and track performance metrics in real-time.
          </p>
        </div>

        {/* Prerequisites Section */}
        <div id="prerequisites" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Prerequisites</h2>
          
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">A Vercel Account</h3>
                  <p className="text-muted-foreground text-sm">
                    If you don't have one, you can <a href="https://vercel.com/signup" className="text-green-600 hover:underline">sign up for free</a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">A Vercel Project</h3>
                  <p className="text-muted-foreground text-sm">
                    If you don't have one, you can <a href="https://vercel.com/new" className="text-green-600 hover:underline">create a new project</a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Vercel CLI</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    If you don't have it installed, use your package manager:
                  </p>
                  <div className="space-y-2 text-sm bg-black/50 p-3 rounded-lg font-mono text-white/90">
                    <p><span className="text-green-400"># pnpm</span></p>
                    <p>pnpm i vercel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Enable Speed Insights */}
        <div id="enable-speed-insights" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Step 1: Enable Speed Insights in Vercel</h2>
          
          <div className="p-6 rounded-xl border border-border bg-muted/30">
            <p className="text-muted-foreground mb-4">
              On the <a href="/dashboard" className="text-green-600 hover:underline">Vercel dashboard</a>, select your Project followed by the <strong>Speed Insights</strong> tab, then select <strong>Enable</strong> from the dialog.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>💡 Note:</strong> Enabling Speed Insights will add new routes (scoped at <code className="bg-white/50 px-2 py-1 rounded">/_vercel/speed-insights/*</code>) after your next deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Add Package */}
        <div id="add-package" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Step 2: Add @vercel/speed-insights to Your Project</h2>
          
          <p className="text-muted-foreground">
            Using the package manager of your choice, add the <code className="bg-muted px-2 py-1 rounded text-sm">@vercel/speed-insights</code> package to your project:
          </p>

          <div className="space-y-3 text-sm bg-black/50 p-4 rounded-lg font-mono text-white/90 overflow-x-auto">
            <p><span className="text-green-400"># pnpm</span></p>
            <p>pnpm i @vercel/speed-insights</p>
            <p className="mt-4"><span className="text-green-400"># yarn</span></p>
            <p>yarn i @vercel/speed-insights</p>
            <p className="mt-4"><span className="text-green-400"># npm</span></p>
            <p>npm i @vercel/speed-insights</p>
            <p className="mt-4"><span className="text-green-400"># bun</span></p>
            <p>bun i @vercel/speed-insights</p>
          </div>
        </div>

        {/* Step 3: Integration Guide */}
        <div id="integration" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Step 3: Add SpeedInsights Component to Your App</h2>
          
          <div className="space-y-6">
            {/* Next.js */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-green-600" />
                Next.js (App Router)
              </h3>
              <p className="text-muted-foreground text-sm">
                Add the component to your root layout:
              </p>
              <pre className="text-sm bg-black/50 p-4 rounded-lg font-mono text-white/90 overflow-x-auto"><code>{`import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}`}</code></pre>
            </div>

            {/* React */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-green-600" />
                React
              </h3>
              <p className="text-muted-foreground text-sm">
                Add the component to your main App file:
              </p>
              <pre className="text-sm bg-black/50 p-4 rounded-lg font-mono text-white/90 overflow-x-auto"><code>{`import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <div>
      {/* ... */}
      <SpeedInsights />
    </div>
  )
}`}</code></pre>
            </div>

            {/* HTML */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-green-600" />
                HTML
              </h3>
              <p className="text-muted-foreground text-sm">
                Add the following scripts before the closing tag of the <code className="bg-muted px-2 py-1 rounded">&lt;body&gt;</code>:
              </p>
              <div className="space-y-2 text-sm bg-black/50 p-4 rounded-lg font-mono text-white/90 overflow-x-auto">
                <p><span className="text-orange-400">&lt;script&gt;</span></p>
                <p className="pl-4">window.si = window.si || <span className="text-blue-400">function</span> <span className="text-white">()</span> <span className="text-orange-400">{'{'}</span> <span className="text-white">(window.siq = window.siq || []).push(arguments);</span> <span className="text-orange-400">{'}'}</span><span className="text-white">;</span></p>
                <p><span className="text-orange-400">&lt;/script&gt;</span></p>
                <p><span className="text-orange-400">&lt;script</span> <span className="text-green-400">defer</span> <span className="text-blue-400">src</span><span className="text-white">=</span><span className="text-yellow-400">"/_vercel/speed-insights/script.js"</span><span className="text-orange-400">&gt;&lt;/script&gt;</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Deploy */}
        <div id="deploy" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Step 4: Deploy Your App to Vercel</h2>
          
          <p className="text-muted-foreground">
            Deploy your app to Vercel's global CDN by running the following command:
          </p>

          <div className="space-y-2 text-sm bg-black/50 p-4 rounded-lg font-mono text-white/90">
            <p>vercel deploy</p>
          </div>

          <p className="text-muted-foreground text-sm">
            Alternatively, you can <a href="https://vercel.com/docs/git" className="text-green-600 hover:underline">connect your project's git repository</a>, which will enable Vercel to deploy your latest pushes and merges to main.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Note:</strong> If everything is set up correctly, you should be able to find the <code className="bg-white/50 px-2 py-1 rounded">/_vercel/speed-insights/script.js</code> script inside the body tag of your page.
            </p>
          </div>
        </div>

        {/* Step 5: View Data */}
        <div id="view-data" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Step 5: View Your Data in the Dashboard</h2>
          
          <p className="text-muted-foreground">
            Once your app is deployed and users have visited your site, you can view the data in the dashboard.
          </p>

          <p className="text-muted-foreground">
            To do so, go to your <a href="/dashboard" className="text-green-600 hover:underline">Vercel dashboard</a>, select your project, and click the <strong>Speed Insights</strong> tab.
          </p>

          <p className="text-muted-foreground">
            After a few days of visitors, you'll be able to start exploring your metrics. For more information on how to use Speed Insights, see the <a href="https://vercel.com/docs/speed-insights/using-speed-insights" className="text-green-600 hover:underline">Speed Insights documentation</a>.
          </p>
        </div>

        {/* Next Steps */}
        <div id="next-steps" className="scroll-mt-24 space-y-6 p-6 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-medium text-foreground">Next Steps</h2>
          </div>
          
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
              <a href="https://vercel.com/docs/speed-insights/package" className="text-green-600 hover:underline">Learn how to use the @vercel/speed-insights package</a>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
              <a href="https://vercel.com/docs/speed-insights/metrics" className="text-green-600 hover:underline">Learn about metrics</a>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
              <a href="https://vercel.com/docs/speed-insights/privacy-policy" className="text-green-600 hover:underline">Read about privacy and compliance</a>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
              <a href="https://vercel.com/docs/speed-insights/limits-and-pricing" className="text-green-600 hover:underline">Explore pricing</a>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
              <a href="https://vercel.com/docs/speed-insights/troubleshooting" className="text-green-600 hover:underline">Troubleshooting</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
