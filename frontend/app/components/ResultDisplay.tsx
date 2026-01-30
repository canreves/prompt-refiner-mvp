import { useState } from 'react';
import { Copy, Check, Clock, Hash } from 'lucide-react';
import { RatingStars } from '@/app/components/RatingStars';

interface ResultDisplayProps {
  originalPrompt: string;
  optimizedPrompt: string;
  tokenCount: number;
  latency: number;
  promptId?: string | null;
  onRate?: (rating: number) => void;
}

export function ResultDisplay({ originalPrompt, optimizedPrompt, tokenCount, latency, promptId, onRate }: ResultDisplayProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);

  const handleCopy = async (text: string, type: 'original' | 'optimized') => {
    await navigator.clipboard.writeText(text);
    
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedOptimized(true);
      setTimeout(() => setCopiedOptimized(false), 2000);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Results</h2>
        
        {/* Token ve Latency Bilgileri */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <Hash className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {tokenCount} tokens
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              {latency}ms
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Öncesi */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Before</h3>
            <button
              onClick={() => handleCopy(originalPrompt, 'original')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Copy"
            >
              {copiedOriginal ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {originalPrompt}
          </div>
        </div>

        {/* Sonrası */}
        <div className="bg-white border border-green-200 rounded-lg p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-green-900">After</h3>
            <button
              onClick={() => handleCopy(optimizedPrompt, 'optimized')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              title="Copy"
            >
              {copiedOptimized ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-green-50 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {optimizedPrompt}
          </div>
        </div>
      </div>

      {/* Değerlendirme */}
      {onRate && (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Rating</h3>
          <RatingStars key={promptId || 'no-prompt'} onRate={onRate} />
        </div>
      )}
    </div>
  );
}