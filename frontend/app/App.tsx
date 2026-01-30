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
  parsePromptService,
  optimizeExistingService,
  optimizePromptService, 
  getPromptHistoryService, 
  deletePromptService,
  saveFeedbackService 
} from '@/services/api';
import type { PromptDBModel, AuthUser, ParseResponse } from '@/types';

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
  [key: string]: number; // Index signature for compatibility
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
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParseResponse | null>(null);
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

  // Step 1: Parse the prompt
  const handleParse = async () => {
    if (!prompt.trim()) return;

    setIsParsing(true);
    
    try {
      const userID = currentUser?.uid || 'anonymous-user';
      const response = await parsePromptService(prompt, userID);
      
      setParsedData(response);
      setCurrentPromptID(response.promptID);
      setTokenCount(response.completionTokens);
      
      toast.success('Prompt analyzed successfully! Review the results and click Optimize.');
      
    } catch (error: any) {
      console.error('Parse error:', error);
      toast.error(error.response?.data?.detail || 'Failed to analyze prompt. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  // Step 2: Optimize the parsed prompt
  const handleOptimizeAfterParse = async () => {
    if (!currentPromptID) {
      toast.error('Please analyze the prompt first.');
      return;
    }

    setIsOptimizing(true);
    
    try {
      const response = await optimizeExistingService(
        currentPromptID,
        scoreWeights,
        selectedLLM || 'openai/gpt-oss-20b'
      );
      
      setOptimizedPrompt(response.optimizedPrompt);
      setLatency(response.optimizeLatencyMs);
      
      // Add to local history
      const newHistoryItem: HistoryItem = {
        id: currentPromptID,
        prompt,
        optimizedPrompt: response.optimizedPrompt,
        timestamp: new Date(),
        tokenCount: tokenCount,
        latency: response.optimizeLatencyMs,
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

  // Combined: Quick optimize (parse + optimize in one go)
  const handleQuickOptimize = async () => {
    if (!prompt.trim()) return;

    setIsOptimizing(true);
    setIsParsing(true);
    
    try {
      const userID = currentUser?.uid || 'anonymous-user';
      const response = await optimizePromptService(
        prompt,
        userID,
        scoreWeights,
        selectedLLM || 'openai/gpt-oss-20b'
      );
      
      setOptimizedPrompt(response.optimizedPrompt);
      setTokenCount(response.initialTokenSize);
      setLatency(response.totalLatencyMs);
      setCurrentPromptID(response.promptID);
      setParsedData({
        status: response.status,
        promptID: response.promptID,
        parsedData: response.parsedData,
        overallScores: response.overallScores,
        completionTokens: response.initialTokenSize,
        promptTokens: 0,
        parseLatencyMs: response.parseLatencyMs
      });
      
      // Add to local history
      const newHistoryItem: HistoryItem = {
        id: response.promptID,
        prompt,
        optimizedPrompt: response.optimizedPrompt,
        timestamp: new Date(),
        tokenCount: response.initialTokenSize,
        latency: response.totalLatencyMs,
      };
      
      setHistory([newHistoryItem, ...history]);
      toast.success('Prompt optimized successfully!');
      
    } catch (error: any) {
      console.error('Optimization error:', error);
      toast.error(error.response?.data?.detail || 'Failed to optimize prompt. Please try again.');
    } finally {
      setIsOptimizing(false);
      setIsParsing(false);
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
    setParsedData(null);
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
          
          {/* Two-Step Workflow */}
          <div className="flex gap-3">
            <button
              onClick={handleParse}
              disabled={!prompt.trim() || isParsing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition"
            >
              {isParsing ? 'Analyzing...' : '1. Analyze Prompt'}
            </button>
            
            <button
              onClick={handleOptimizeAfterParse}
              disabled={!parsedData || isOptimizing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition"
            >
              {isOptimizing ? 'Optimizing...' : '2. Optimize'}
            </button>
            
            <button
              onClick={handleQuickOptimize}
              disabled={!prompt.trim() || isOptimizing || isParsing}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition"
            >
              {isOptimizing || isParsing ? 'Processing...' : '⚡ Quick Optimize'}
            </button>
          </div>
          
          {/* Show Parsed Data */}
          {parsedData && !optimizedPrompt && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Overall Score: </span>
                  <span className="text-lg font-bold text-blue-600">
                    {parsedData.overallScores?.toFixed(1) || 'N/A'}/10
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {parsedData.parsedData?.task && (
                    <div>
                      <div className="font-medium text-gray-700">Task:</div>
                      <div className="text-gray-600">{parsedData.parsedData.task}</div>
                      <div className="text-xs text-gray-500">Score: {parsedData.parsedData.task_score}/10</div>
                    </div>
                  )}
                  {parsedData.parsedData?.role && (
                    <div>
                      <div className="font-medium text-gray-700">Role:</div>
                      <div className="text-gray-600">{parsedData.parsedData.role}</div>
                      <div className="text-xs text-gray-500">Score: {parsedData.parsedData.role_score}/10</div>
                    </div>
                  )}
                  {parsedData.parsedData?.style && (
                    <div>
                      <div className="font-medium text-gray-700">Style:</div>
                      <div className="text-gray-600">{parsedData.parsedData.style}</div>
                      <div className="text-xs text-gray-500">Score: {parsedData.parsedData.style_score}/10</div>
                    </div>
                  )}
                  {parsedData.parsedData?.output && (
                    <div>
                      <div className="font-medium text-gray-700">Output:</div>
                      <div className="text-gray-600">{parsedData.parsedData.output}</div>
                      <div className="text-xs text-gray-500">Score: {parsedData.parsedData.output_score}/10</div>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    ✓ Prompt analyzed in {parsedData.parseLatencyMs.toFixed(0)}ms
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    → Now click "2. Optimize" to generate an improved version, or adjust weights first.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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