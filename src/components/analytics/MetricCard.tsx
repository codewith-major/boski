import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <div className={`p-5 rounded-lg border flex flex-col ${highlight ? 'bg-stone-900 border-stone-900 text-white' : 'bg-stone-50 border-stone-200'}`}>
      <span className={`text-sm font-medium mb-1 ${highlight ? 'text-stone-300' : 'text-stone-500'}`}>{label}</span>
      <span className={`text-3xl font-display font-bold ${highlight ? 'text-lime-400' : 'text-stone-900'}`}>{value}</span>
    </div>
  );
}
