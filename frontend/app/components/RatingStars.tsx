import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  onRate?: (rating: number) => void;
}

export function RatingStars({ onRate }: RatingStarsProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (value: number) => {
    setRating(value);
    onRate?.(value);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-700 font-medium">
        Rate this optimized prompt
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                value <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-sm text-green-600 font-medium">
          ✓ Your rating has been saved: {rating}/5
        </p>
      )}
    </div>
  );
}