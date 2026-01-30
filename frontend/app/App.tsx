import { useState, useEffect } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { PromptHistory } from '@/app/components/PromptHistory';
import { PromptInput } from '@/app/components/PromptInput';
import { LLMSelector } from '@/app/components/LLMSelector';
import { ScoreSettings } from '@/app/components/ScoreSettings';
import { OptimizeButton } from '@/app/components/OptimizeButton';
import { ResultDisplay } from '@/app/components/ResultDisplay';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { 
  optimizePromptService, 
  getPromptHistoryService, 
  deletePromptService,
  saveFeedbackService 
} from '@/services/api';
import type { PromptDBModel, AuthUser } from '@/types';

// Local UI history item (derived from PromptDBModel)
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentPromptID, setCurrentPromptID] = useState<string | null>(null);

  // Load prompt history when user logs in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadPromptHistory();
    }
  }, [isAuthenticated, currentUser]);

  const loadPromptHistory = async () => {
    if (!currentUser) return;
    
    try {
      const prompts: PromptDBModel[] = await getPromptHistoryService(currentUser.uid);
      // Map PromptDBModel to local HistoryItem format
      const formattedHistory: HistoryItem[] = prompts.map((item: PromptDBModel) => ({
        id: item.promptID,
        prompt: item.inputPrompt,
        optimizedPrompt: item.optimizedPrompts?.default || Object.values(item.optimizedPrompts || {})[0] || '',
        timestamp: new Date(item.createdAt),
        tokenCount: item.initialTokenSize,
        latency: item.latencyMs?.default || Object.values(item.latencyMs || {})[0] || 0,
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      // Don't show error toast for history loading failures
    }
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) return;

    setIsOptimizing(true);
    const startTime = Date.now();
    
    try {
      // Call the real backend API
      const userID = currentUser?.uid || 'anonymous-user';
      const response = await optimizePromptService(prompt, userID);
      
      const endTime = Date.now();
      const calculatedLatency = response.latencyMs?.default || (endTime - startTime);
      
      // Extract data from response
      const optimizedText = response.optimizedPrompts?.default || '';
      const tokens = response.initialTokenSize || Math.ceil(prompt.length / 4);
      
      setOptimizedPrompt(optimizedText);
      setTokenCount(tokens);
      setLatency(calculatedLatency);
      setCurrentPromptID(response.promptID);
      
      // Add to local history
      const newHistoryItem: HistoryItem = {
        id: response.promptID,
        prompt,
        optimizedPrompt: optimizedText,
        timestamp: new Date(),
        tokenCount: tokens,
        latency: calculatedLatency,
      };
      
      setHistory([newHistoryItem, ...history]);
      toast.success('Prompt optimized successfully!');
      
    } catch (error: any) {
      console.error('Optimization error:', error);
      toast.error(error.response?.data?.detail || 'Failed to optimize prompt. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setOptimizedPrompt(item.optimizedPrompt);
    setTokenCount(item.tokenCount);
    setLatency(item.latency);
    setCurrentPromptID(item.id);
  };

  const handleRate = async (rating: number) => {
    if (!currentPromptID) {
      console.warn('No prompt ID to rate');
      toast.error('Please optimize a prompt first before rating.');
      return;
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    try {
      await saveFeedbackService({
        promptID: currentPromptID,
        rating: rating,
      });

      toast.success('Thank you for your rating!');
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Failed to save rating. Please try again.');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deletePromptService(id);
      setHistory(history.filter(item => item.id !== id));
      toast.success('Prompt deleted from history');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  const handleNewPrompt = () => {
    setPrompt('');
    setOptimizedPrompt('');
    setTokenCount(0);
    setLatency(0);
    setSelectedLLM('');
    setCurrentPromptID(null);
    setScoreWeights({ task: 2, role: 2, style: 2, output: 2, rules: 2 });
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setHistory([]);
    handleNewPrompt();
    toast.success('You have been logged out successfully!');
  };

  const handleLoginSuccess = (user: { uid: string; email: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
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
              promptId={currentPromptID}
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