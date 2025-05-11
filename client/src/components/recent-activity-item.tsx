import React from 'react';

interface RecentActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
}

export const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  icon,
  title,
  description,
  timestamp
}) => {
  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="text-xs text-gray-400 whitespace-nowrap">{timestamp}</div>
    </div>
  );
};

export default RecentActivityItem;