import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef(({ className, label, error, hint, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-transjordano-green-500 focus:border-transjordano-green-500 text-sm disabled:bg-gray-100 disabled:text-gray-500",
          error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
});
Input.displayName = 'Input';
