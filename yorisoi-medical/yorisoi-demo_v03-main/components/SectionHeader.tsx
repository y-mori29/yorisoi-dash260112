import React from 'react';

interface Props {
  icon?: React.ReactNode;
  title: string;
  colorClass?: string;
}

export const SectionHeader: React.FC<Props> = ({ icon, title, colorClass = "text-teal-700" }) => {
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 ${colorClass}`}>
      {icon}
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
  );
};
