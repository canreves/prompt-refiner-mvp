import { useState } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { PromptHistory } from '@/app/components/PromptHistory';
import { PromptInput } from '@/app/components/PromptInput';
import { LLMSelector } from '@/app/components/LLMSelector';
import { ScoreSettings } from '@/app/components/ScoreSettings';
import { OptimizeButton } from '@/app/components/OptimizeButton';
import { ResultDisplay } from '@/app/components/ResultDisplay';
import { Toaster } from '@/app/components/ui/sonner';
import { saveFeedback } from '@/services/feedbackService';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

interface HistoryItem {
  id: string;
  prompt: string;
  optimizedPrompt: string;
  timestamp: Date;
  tokenCount: number;
  latency: number;
}

interface ScoreWeights {
  task: number;
  role: number;
  style: number;
  output: number;
  rules: number;
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedLLM, setSelectedLLM] = useState('');
  const [scoreWeights, setScoreWeights] = useState<ScoreWeights>({
    task: 0,
    role: 0,
    style: 0,
    output: 0,
    rules: 0,
  });
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [latency, setLatency] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleOptimize = async () => {
    if (!prompt.trim()) return;

    setIsOptimizing(true);
    const startTime = Date.now();
    
    // Mock optimization - Backend'den gelecek
    setTimeout(() => {
      const endTime = Date.now();
      const calculatedLatency = endTime - startTime;
      
      // Backend'den gelecek - şimdilik mock
      const mockTokenCount = Math.ceil(prompt.length / 4);
      const mockOptimized = `Bu optimize edilmiş prompttur. Backend entegrasyonu yapıldığında buraya gerçek optimize edilmiş prompt gelecek.\n\nÖrnek optimize edilmiş içerik: ${prompt.substring(0, 100)}...`;
      
      setOptimizedPrompt(mockOptimized);
      setTokenCount(mockTokenCount);
      setLatency(calculatedLatency);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        prompt,
        optimizedPrompt: mockOptimized,
        timestamp: new Date(),
        tokenCount: mockTokenCount,
        latency: calculatedLatency,
      };
      
      setHistory([newHistoryItem, ...history]);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setOptimizedPrompt(item.optimizedPrompt);
    setTokenCount(item.tokenCount);
    setLatency(item.latency);
  };

  const handleRate = async (rating: number) => {
    if (!optimizedPrompt || !prompt) {
      console.warn('No prompt or optimized prompt to rate');
      return;
    }

    try {
      const feedbackId = await saveFeedback({
        originalPrompt: prompt,
        optimizedPrompt: optimizedPrompt,
        rating: rating,
        selectedLLM: selectedLLM || undefined,
        scoreWeights: scoreWeights,
        tokenCount: tokenCount,
        latency: latency,
      });

      console.log('Feedback saved successfully with ID:', feedbackId);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback. Please try again.');
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const handleNewPrompt = () => {
    setPrompt('');
    setOptimizedPrompt('');
    setTokenCount(0);
    setLatency(0);
    setSelectedLLM('');
    setScoreWeights({ task: 2, role: 2, style: 2, output: 2, rules: 2 });
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    toast.success('You have been logged out successfully!');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="size-full flex bg-gray-50">
      {/* Sol Kenar Çubuğu - Prompt Geçmişi */}
      <PromptHistory 
        history={history} 
        onSelectItem={handleHistorySelect} 
        onDeleteItem={handleDeleteHistory}
        onNewPrompt={handleNewPrompt}
      />
      
      {/* Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col p-8 overflow-auto relative">
        {/* Logout Button */}
        <button
          className="absolute top-4 right-4 flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm"
          onClick={handleLogOut}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>

        <div className="max-w-4xl mx-auto w-full space-y-6">
          <h1 className="text-base font-bold text-gray-900 mb-8">
            Prompt Optimization Tool
          </h1>
          
          <PromptInput value={prompt} onChange={setPrompt} />
          
          <LLMSelector selectedLLM={selectedLLM} onChange={setSelectedLLM} />
          
          <ScoreSettings weights={scoreWeights} onChange={setScoreWeights} />
          
          <OptimizeButton onClick={handleOptimize} isLoading={isOptimizing} disabled={!prompt.trim()} />
          
          {optimizedPrompt && (
            <ResultDisplay 
              originalPrompt={prompt}
              optimizedPrompt={optimizedPrompt}
              tokenCount={tokenCount}
              latency={latency}
              onRate={handleRate}
            />
          )}
        </div>
      </main>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}