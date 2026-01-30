import { useState, useEffect } from 'react';

interface ScoreWeights {
  task: number;
  role: number;
  style: number;
  output: number;
  rules: number;
}

interface ScoreSettingsProps {
  weights: ScoreWeights;
  onChange: (weights: ScoreWeights) => void;
}

const scoreLabels = {
  task: 'TASK',
  role: 'ROLE',
  style: 'STYLE',
  output: 'OUTPUT',
  rules: 'RULES',
};

export function ScoreSettings({ weights, onChange }: ScoreSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempWeights, setTempWeights] = useState(weights);

  useEffect(() => {
    setTempWeights(weights);
  }, [weights]);

  const total = Object.values(tempWeights).reduce((sum, val) => sum + val, 0);

  const handleWeightChange = (key: keyof ScoreWeights, valueStr: string) => {
    // Boş string'e izin ver
    if (valueStr === '') {
      setTempWeights({ ...tempWeights, [key]: 0 });
      return;
    }

    const value = parseFloat(valueStr);
    
    // Geçerli sayı değilse güncelleme
    if (isNaN(value)) return;

    const newWeights = { ...tempWeights, [key]: value };
    setTempWeights(newWeights);
    
    const newTotal = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
    
    // Her durumda parent'a bildir
    onChange(newWeights);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Score Weights (Optional)
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {isExpanded && (
        <>
          <p className="text-sm text-gray-600">
            Enter the weight for each criterion. Total must equal exactly 10.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(scoreLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  type="text"
                  value={tempWeights[key as keyof ScoreWeights] === 0 ? '' : tempWeights[key as keyof ScoreWeights]}
                  onChange={(e) => handleWeightChange(key as keyof ScoreWeights, e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total:
              </span>
              <span className={`text-lg font-mono font-bold ${
                Math.abs(total - 10) < 0.001 
                  ? 'text-green-600' 
                  : 'text-gray-900'
              }`}>
                {total.toFixed(1)}
              </span>
            </div>
            
            {Math.abs(total - 10) < 0.001 ? (
              <p className="text-sm text-green-600">
                ✓ Total is valid
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Total must equal 10
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}