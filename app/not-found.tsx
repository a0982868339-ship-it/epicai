
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
      <FileQuestion size={64} className="text-slate-600 mb-4" />
      <h2 className="text-4xl font-bold mb-2">404</h2>
      <p className="text-slate-400 mb-6">Page not found</p>
      <Link 
        href="/dashboard" 
        className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg font-bold transition"
      >
        Return Home
      </Link>
    </div>
  );
}
