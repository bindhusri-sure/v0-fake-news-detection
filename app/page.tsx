import { NewsAnalyzer } from "@/components/news-analyzer"
import { Shield, Github, Brain, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen mesh-bg relative pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
              <Shield className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">FakeCheck</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              How it Works
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 shadow-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            AI-Powered Detection Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 text-balance leading-tight tracking-tight">
            Detect Fake News with <span className="text-glow-gradient">Deep AI Analysis</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
            Verify the accuracy of any news article instantly. 
            Our advanced models inspect sensationalism, clickbait markers, linguistic patterns, and reference quality.
          </p>
        </div>
      </section>

      {/* Main Analyzer */}
      <section className="px-4 pb-20 relative z-10">
        <NewsAnalyzer />
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 border-t border-border/40 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-16 tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 hover:translate-y-[-4px] transition-all duration-300 border border-border/50 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Paste Article</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Provide the full text or copy and paste the news article you want to verify.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 hover:translate-y-[-4px] transition-all duration-300 border border-border/50 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">AI Deep Scan</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The NLP engine analyzes text structures, capitalization habits, citations, and clickbait phrases.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 hover:translate-y-[-4px] transition-all duration-300 border border-border/50 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-6 border border-success/20">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Credibility Report</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Receive an immediate breakdown of indicators with detailed confidence scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/30 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p className="leading-relaxed">
            FakeCheck uses heuristic and pattern-matching analysis to identify potential misinformation. 
            Always cross-reference news with official sources.
          </p>
          <p className="mt-4 text-xs opacity-75">
            Built with Next.js, Tailwind CSS v4, and Machine Learning Principles.
          </p>
        </div>
      </footer>
    </main>
  )
}
