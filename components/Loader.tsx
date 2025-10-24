import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-slate-800 dark:border-white ${sizeClasses[size]}`}></div>
  );
};

export default Loader;