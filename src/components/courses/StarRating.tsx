
import { Star, StarHalf } from 'lucide-react';

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: number;
};

export function StarRating({ rating, max = 5, size = 16 }: StarRatingProps) {
  // Calculate full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {Array(fullStars)
        .fill(null)
        .map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
      
      {hasHalfStar && (
        <StarHalf
          size={size}
          className="fill-yellow-400 text-yellow-400"
        />
      )}
      
      {Array(emptyStars)
        .fill(null)
        .map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-gray-300"
          />
        ))}
    </div>
  );
}
