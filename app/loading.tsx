
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-400 font-medium animate-pulse">Loading MiniEpic...</p>
      </div>
    </div>
  );
}
