"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Shield, AlertTriangle, CheckCircle, BarChart3, FileText, Zap, Upload, X, Plus, ImageIcon, Camera } from "lucide-react"

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
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFileUpload = (file: File) => {
    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    
    // For simplicity, we'll only read text files properly
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
        setFileName(file.name)
        setResult(null)
      }
      reader.readAsText(file)
    } else {
      alert("Please upload a .txt or .md file. Other formats are not supported yet.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const clearFile = () => {
    setFileName(null)
    setText("")
    setResult(null)
  }

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
    <div className="w-full max-w-4xl mx-auto relative z-10">
      <div className="flex flex-col gap-8">
        {/* Input Section */}
        <div className="glass-card glow-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle glow effect behind input */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
                <FileText className="w-4.5 h-4.5 text-primary" />
              </div>
              Enter News Article
            </h2>
            <div className="flex gap-2.5">
              <button
                onClick={() => loadSample("fake")}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-all duration-200"
              >
                Load Fake Sample
              </button>
              <button
                onClick={() => loadSample("real")}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-success/15 text-success hover:bg-success/25 border border-success/25 transition-all duration-200"
              >
                Load Real Sample
              </button>
            </div>
          </div>

          {/* File Name Badge */}
          {fileName && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-secondary/50 rounded-lg w-fit border border-border/40">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">{fileName}</span>
              <button
                onClick={clearFile}
                className="p-0.5 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          )}

          {/* Text Input with Plus Button */}
          <div 
            className={`relative bg-input/40 backdrop-blur-sm border rounded-xl transition-all duration-300 ${
              isDragging ? "border-accent bg-accent/5 ring-2 ring-accent/15" : "border-border/60 hover:border-border"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setFileName(null)
                setResult(null)
              }}
              placeholder="Paste or type the news article text here..."
              className="w-full h-52 bg-transparent p-5 pb-16 text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none leading-relaxed text-sm md:text-base"
            />
            
            {/* Bottom toolbar with Plus button */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="relative" ref={menuRef}>
                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.doc,.docx,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                    setShowAttachMenu(false)
                  }}
                  className="hidden"
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      alert("Image OCR coming soon! For now, please upload text files.")
                    }
                    setShowAttachMenu(false)
                  }}
                  className="hidden"
                />
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                    setShowAttachMenu(false)
                  }}
                  className="hidden"
                />

                {/* Plus button */}
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="w-9 h-9 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-all duration-200 border border-border/50 group"
                >
                  <Plus className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all duration-300 ${showAttachMenu ? "rotate-45" : ""}`} />
                </button>

                {/* Attachment Menu Popup */}
                {showAttachMenu && (
                  <div className="absolute bottom-12 left-0 glass-card border border-border/50 rounded-2xl shadow-2xl py-3 min-w-[220px] animate-in fade-in slide-in-from-bottom-3 duration-250 z-50">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/80">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Upload file</div>
                        <div className="text-xxs text-muted-foreground">Select local files</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/80">
                        <ImageIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Photos</div>
                        <div className="text-xxs text-muted-foreground">Extract text from image</div>
                      </div>
                    </button>

                    <button
                      onClick={() => documentInputRef.current?.click()}
                      className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100/80">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Documents</div>
                        <div className="text-xxs text-muted-foreground">Upload .txt or .md</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        alert("Camera capture coming soon!")
                        setShowAttachMenu(false)
                      }}
                      className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100/80">
                        <Camera className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Take photo</div>
                        <div className="text-xxs text-muted-foreground">Use system camera</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground font-medium">
                Drop files here or click +
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-5">
            <span className="text-sm text-muted-foreground font-medium">
              {text.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl px-7 py-2.5 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Article
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500 relative overflow-hidden">
            {/* Subtle mesh overlay */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Main Result Header */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl mb-8 gap-4 border ${
              result.prediction === "FAKE" 
                ? "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/25" 
                : "bg-gradient-to-br from-success/15 to-success/5 border-success/25"
            }`}>
              <div className="flex items-center gap-4.5">
                {result.prediction === "FAKE" ? (
                  <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center shadow-lg shadow-destructive/10 border border-destructive/30">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center shadow-lg shadow-success/10 border border-success/30">
                    <CheckCircle className="w-7 h-7 text-success" />
                  </div>
                )}
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${
                    result.prediction === "FAKE" ? "text-destructive" : "text-success"
                  }`}>
                    {result.prediction === "FAKE" ? "Likely Fake News" : "Likely Real News"}
                  </h3>
                  <p className="text-sm text-muted-foreground/80 font-medium mt-0.5">
                    Analyzed with {result.confidence}% confidence check
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className={`text-4xl font-extrabold tracking-tight ${
                  result.prediction === "FAKE" ? "text-destructive" : "text-success"
                }`}>
                  {result.confidence}%
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Confidence Score</div>
              </div>
            </div>

            {/* Indicators Grid */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 tracking-wide uppercase">
                <BarChart3 className="w-4 h-4 text-accent" />
                Analysis Indicators
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.indicators.map((indicator) => (
                  <div key={indicator.name} className="bg-secondary/35 backdrop-blur-md rounded-xl p-5 border border-border/30 hover:border-border/50 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground/90">{indicator.name}</span>
                      <span className={`text-sm font-bold ${
                        indicator.score > 50 ? "text-destructive" : "text-success"
                      }`}>
                        {indicator.score}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          indicator.score > 50 
                            ? "bg-gradient-to-r from-destructive/80 to-destructive" 
                            : "bg-gradient-to-r from-success/80 to-success"
                        }`}
                        style={{ width: `${indicator.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/85 leading-relaxed">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/35 border border-border/30 rounded-xl p-5 text-center">
                <div className="text-2xl font-extrabold text-foreground">{result.wordCount}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Words Analyzed</div>
              </div>
              <div className="bg-secondary/35 border border-border/30 rounded-xl p-5 text-center">
                <div className="text-2xl font-extrabold text-foreground">{result.sentimentScore}%</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Subjectivity Index</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
