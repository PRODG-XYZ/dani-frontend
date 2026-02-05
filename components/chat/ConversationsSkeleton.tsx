'use client';

export default function ConversationsSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div
          key={i}
          className="w-full h-10 rounded-lg bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}
