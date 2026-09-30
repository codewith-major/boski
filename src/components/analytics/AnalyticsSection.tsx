import React from 'react';

export function AnalyticsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
        <h2 className="text-lg font-display font-bold text-stone-900">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
}
