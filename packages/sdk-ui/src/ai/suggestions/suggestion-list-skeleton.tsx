import React from 'react';

export default function SuggestionListSkeleton() {
  return (
    <div className="csdk-animate-pulse csdk-flex csdk-flex-col csdk-gap-4">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="csdk-h-[40px] csdk-bg-slate-300 csdk-rounded-[10px] csdk-col-span-2"
        ></div>
      ))}
    </div>
  );
}
