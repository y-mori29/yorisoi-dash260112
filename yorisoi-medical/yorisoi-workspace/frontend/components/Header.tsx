import React from 'react';
import { ChevronLeft, Plus } from './Icons';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showAdd?: boolean;
  onAdd?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack, 
  onBack, 
  showAdd, 
  onAdd,
  className = ""
}) => {
  return (
    <header className={`bg-surface h-14 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm border-b border-gray-100 ${className}`}>
      <div className="flex items-center w-10">
        {showBack && (
          <button onClick={onBack} className="p-1 text-text-main hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
      
      <h1 className="text-lg font-bold text-text-main flex-1 text-center truncate">
        {title}
      </h1>

      <div className="flex items-center justify-end w-10">
        {showAdd && (
          <button onClick={onAdd} className="text-primary hover:opacity-80 transition-opacity">
            <Plus size={28} className="fill-current" />
          </button>
        )}
      </div>
    </header>
  );
};