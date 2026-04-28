import { NewsAnalyzer } from "@/components/news-analyzer"
import { Shield, Github, Brain, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">FakeCheck</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Detection
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Detect Fake News with AI Analysis
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Paste any news article and get instant analysis on its credibility. 
            Our system checks for sensationalism, clickbait patterns, and source quality.
          </p>
        </div>
      </section>

      {/* Main Analyzer */}
      <section className="px-4 pb-16">
        <NewsAnalyzer />
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 px-4 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Paste Article</h3>
              <p className="text-sm text-muted-foreground">
                Copy and paste the news article text you want to verify
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our system analyzes text patterns, language, and credibility indicators
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Get Results</h3>
              <p className="text-sm text-muted-foreground">
                Receive a detailed breakdown with confidence scores and explanations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            FakeCheck uses heuristic analysis to detect potential misinformation. 
            Always verify news from multiple trusted sources.
          </p>
          <p className="mt-2">
            Built with Next.js and Machine Learning principles
          </p>
        </div>
      </footer>
    </main>
  )
}
