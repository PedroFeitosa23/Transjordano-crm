import React from 'react';

export function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}