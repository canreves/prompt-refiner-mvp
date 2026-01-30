import { History, X, Plus } from 'lucide-react';
import { useState } from 'react';

interface HistoryItem {
  id: string;
  prompt: string;
  optimizedPrompt: string;
  timestamp: Date;
  tokenCount: number;
  latency: number;
}

interface PromptHistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onNewPrompt: () => void;
}

export function PromptHistory({ history, onSelectItem, onDeleteItem, onNewPrompt }: PromptHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (item: HistoryItem) => {
    setSelectedId(item.id);
    onSelectItem(item);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteItem(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleNewPrompt = () => {
    setSelectedId(null);
    onNewPrompt();
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Prompt History</h2>
        </div>
        <button
          onClick={handleNewPrompt}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="New Prompt"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No history yet
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full text-left p-4 rounded-lg border transition-colors relative group cursor-pointer ${
                selectedId === item.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <button
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-700 line-clamp-2 mb-2 pr-6">
                {item.prompt}
              </p>
              <p className="text-xs text-gray-500">
                {item.timestamp.toLocaleDateString('en-US')} {item.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}