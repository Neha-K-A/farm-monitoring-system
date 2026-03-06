import { Loader2 } from 'lucide-react';

const Loader = ({ size = 32, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2
        size={size}
        className="animate-spin text-green-500"
      />
    </div>
  );
};

export const SkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="h-10 bg-gray-200 rounded-lg mb-4 animate-pulse"
        />
      ))}
    </div>
  );
};

export default Loader;
