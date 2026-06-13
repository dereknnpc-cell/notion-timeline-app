import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>;
}

export function SectionTitle({ icon: Icon, children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
        {Icon ? <Icon className="w-5 h-5 text-blue-500" /> : null}
        {children}
      </h2>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-rose-100 text-rose-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors[color] ?? colors.slate}`}>{children}</span>;
}

export function TextField({ label, value, onChange, type = 'text', placeholder, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="text-xs font-medium text-slate-600">{label}</span> : null}
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="text-xs font-medium text-slate-600">{label}</span> : null}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </label>
  );
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:opacity-50',
    danger: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${styles[variant]}`}>
      {children}
    </button>
  );
}

export function Empty({ children }) {
  return <div className="text-sm italic text-slate-400 py-8 text-center">{children}</div>;
}
