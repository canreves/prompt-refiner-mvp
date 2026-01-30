import { ChevronDown } from 'lucide-react';

interface LLMSelectorProps {
  selectedLLM: string;
  onChange: (llm: string) => void;
}

// Backend'den gelecek - şimdilik mock
const mockLLMs = [
  { id: 'llm-1', name: 'Model 1' },
  { id: 'llm-2', name: 'Model 2' },
  { id: 'llm-3', name: 'Model 3' },
  { id: 'llm-4', name: 'Model 4' },
];

export function LLMSelector({ selectedLLM, onChange }: LLMSelectorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Select LLM Model
      </label>
      <div className="relative">
        <select
          value={selectedLLM}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-gray-900"
        >
          <option value="">Select a model...</option>
          {mockLLMs.map((llm) => (
            <option key={llm.id} value={llm.id}>
              {llm.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}