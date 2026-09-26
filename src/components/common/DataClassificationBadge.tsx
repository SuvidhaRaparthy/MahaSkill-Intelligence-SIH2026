// MahaSkill Intelligence - Data Classification Badge Component
import React from 'react';
import type { DataClassification } from '../../types/database';

interface Props {
  classification: DataClassification;
  className?: string;
  showIcon?: boolean;
}

export const DataClassificationBadge: React.FC<Props> = ({ classification, className = '', showIcon = true }) => {
  const config: Record<DataClassification, { label: string; bg: string; text: string; border: string; icon: string }> = {
    REAL_PUBLIC_DATA: {
      label: 'Official / Public Source',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: '🏛️'
    },
    DERIVED_METRIC: {
      label: 'Derived Metric',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: '📊'
    },
    SYNTHETIC_DEMO_DATA: {
      label: 'Prototype / Synthetic',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: '🧪'
    },
    FORECAST: {
      label: 'Prototype Forecast',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: '📈'
    },
    SIMULATION: {
      label: 'Simulation Scenario',
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      icon: '🕹️'
    }
  };

  const item = config[classification] || config.SYNTHETIC_DEMO_DATA;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${item.bg} ${item.text} ${item.border} ${className}`}>
      {showIcon && <span>{item.icon}</span>}
      <span>{item.label}</span>
    </span>
  );
};
