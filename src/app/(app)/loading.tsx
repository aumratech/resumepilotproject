import { Loader2, Sparkles } from 'lucide-react'

export default function AppLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center min-h-[400px] bg-background/50 backdrop-blur-sm p-6 text-center space-y-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-primary/20 animate-pulse">
        <Sparkles size={28} className="text-white animate-spin-slow" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground text-base">Loading ResumeAI...</h3>
        <p className="text-xs text-muted-foreground">Preparing your dashboard and data...</p>
      </div>
    </div>
  )
}
