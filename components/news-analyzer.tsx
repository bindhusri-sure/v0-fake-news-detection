"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Shield, AlertTriangle, CheckCircle, BarChart3, FileText, Zap } from "lucide-react"

interface AnalysisResult {
  prediction: "FAKE" | "REAL"
  confidence: number
  indicators: {
    name: string
    score: number
    description: string
  }[]
  wordCount: number
  sentimentScore: number
}

// Fake news detection indicators (heuristic-based for demo)
const FAKE_NEWS_PATTERNS = [
  "breaking", "shocking", "you won't believe", "doctors hate", "secret", "miracle",
  "exposed", "conspiracy", "mainstream media", "they don't want you to know",
  "share before deleted", "100% proven", "scientists baffled", "one weird trick"
]

const CLICKBAIT_PATTERNS = [
  "click here", "share now", "must see", "gone viral", "mind-blowing",
  "jaw-dropping", "unbelievable", "insane", "crazy", "epic fail"
]

function analyzeText(text: string): AnalysisResult {
  const lowerText = text.toLowerCase()
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Calculate various indicators
  let fakePatternCount = 0
  FAKE_NEWS_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) fakePatternCount++
  })
  
  let clickbaitCount = 0
  CLICKBAIT_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) clickbaitCount++
  })
  
  // Check for excessive capitalization
  const capsWords = words.filter(w => w === w.toUpperCase() && w.length > 2)
  const capsRatio = capsWords.length / Math.max(words.length, 1)
  
  // Check for excessive punctuation
  const exclamationCount = (text.match(/!/g) || []).length
  const questionCount = (text.match(/\?/g) || []).length
  const punctuationScore = (exclamationCount + questionCount) / Math.max(sentences.length, 1)
  
  // Check for source citations
  const hasSourceCitation = /according to|study shows|research|university|institute|journal/i.test(text)
  const hasQuotes = (text.match(/"/g) || []).length >= 2
  
  // Calculate sentiment (simplified)
  const positiveWords = ["good", "great", "excellent", "amazing", "wonderful", "best", "success"]
  const negativeWords = ["bad", "terrible", "worst", "horrible", "disaster", "fail", "crisis"]
  
  let sentimentScore = 0
  positiveWords.forEach(w => { if (lowerText.includes(w)) sentimentScore += 1 })
  negativeWords.forEach(w => { if (lowerText.includes(w)) sentimentScore -= 1 })
  
  // Build indicators
  const indicators = [
    {
      name: "Sensationalism",
      score: Math.min(100, fakePatternCount * 25),
      description: fakePatternCount > 0 
        ? `Found ${fakePatternCount} sensational phrase(s)`
        : "No sensational language detected"
    },
    {
      name: "Clickbait",
      score: Math.min(100, clickbaitCount * 30),
      description: clickbaitCount > 0
        ? `Found ${clickbaitCount} clickbait pattern(s)`
        : "No clickbait patterns detected"
    },
    {
      name: "Caps/Punctuation",
      score: Math.min(100, (capsRatio * 200) + (punctuationScore * 20)),
      description: capsRatio > 0.1 || punctuationScore > 2
        ? "Excessive capitalization or punctuation"
        : "Normal text formatting"
    },
    {
      name: "Source Quality",
      score: (hasSourceCitation || hasQuotes) ? 20 : 60,
      description: hasSourceCitation 
        ? "Contains source citations"
        : hasQuotes 
          ? "Contains quoted content"
          : "No verifiable sources cited"
    }
  ]
  
  // Calculate overall fake probability
  const avgIndicatorScore = indicators.reduce((sum, i) => sum + i.score, 0) / indicators.length
  const fakeScore = Math.min(95, Math.max(5, avgIndicatorScore))
  
  // Determine prediction
  const isFake = fakeScore > 45
  const confidence = isFake ? fakeScore : (100 - fakeScore)
  
  return {
    prediction: isFake ? "FAKE" : "REAL",
    confidence: Math.round(confidence),
    indicators,
    wordCount: words.length,
    sentimentScore: Math.round((sentimentScore / 5) * 100)
  }
}

const SAMPLE_FAKE = `BREAKING: Scientists SHOCKED by new discovery that mainstream media is hiding from you! You won't believe what they found - a miracle cure that doctors hate! Share before this gets deleted! This secret has been exposed and they don't want you to know about it!!!`

const SAMPLE_REAL = `According to a study published in the Journal of Medicine, researchers at Harvard University have identified a new biomarker that may help in early detection of certain conditions. "This finding represents a significant step forward," said Dr. Sarah Johnson, lead author of the study. The research team analyzed data from over 10,000 participants over a five-year period.`

export function NewsAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    
    setIsAnalyzing(true)
    setResult(null)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analysis = analyzeText(text)
    setResult(analysis)
    setIsAnalyzing(false)
  }

  const loadSample = (type: "fake" | "real") => {
    setText(type === "fake" ? SAMPLE_FAKE : SAMPLE_REAL)
    setResult(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Input Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Enter News Article
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => loadSample("fake")}
                className="text-xs px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                Load Fake Sample
              </button>
              <button
                onClick={() => loadSample("real")}
                className="text-xs px-3 py-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
              >
                Load Real Sample
              </button>
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setResult(null)
            }}
            placeholder="Paste or type the news article text here..."
            className="w-full h-48 bg-input border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {text.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-card rounded-xl border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Result */}
            <div className={`flex items-center justify-between p-6 rounded-lg mb-6 ${
              result.prediction === "FAKE" 
                ? "bg-destructive/10 border border-destructive/30" 
                : "bg-success/10 border border-success/30"
            }`}>
              <div className="flex items-center gap-4">
                {result.prediction === "FAKE" ? (
                  <div className="w-14 h-14 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-success" />
                  </div>
                )}
                <div>
                  <h3 className={`text-2xl font-bold ${
                    result.prediction === "FAKE" ? "text-destructive" : "text-success"
                  }`}>
                    {result.prediction === "FAKE" ? "Likely Fake News" : "Likely Real News"}
                  </h3>
                  <p className="text-muted-foreground">
                    Analysis completed with {result.confidence}% confidence
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  result.prediction === "FAKE" ? "text-destructive" : "text-success"
                }`}>
                  {result.confidence}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            </div>

            {/* Indicators Grid */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Analysis Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.indicators.map((indicator) => (
                  <div key={indicator.name} className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{indicator.name}</span>
                      <span className={`text-sm font-bold ${
                        indicator.score > 50 ? "text-destructive" : "text-success"
                      }`}>
                        {indicator.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          indicator.score > 50 ? "bg-destructive" : "bg-success"
                        }`}
                        style={{ width: `${indicator.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{result.wordCount}</div>
                <div className="text-sm text-muted-foreground">Words Analyzed</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{result.indicators.length}</div>
                <div className="text-sm text-muted-foreground">Indicators Checked</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
