export default function StatCard({ title, value, subtitle, icon, color = 'brand', trend }) {
  const colors = {
    brand: 'from-brand-600/20 to-brand-500/5 border-brand-500/20 text-brand-400',
    green: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    red: 'from-red-600/20 to-red-500/5 border-red-500/20 text-red-400',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-display font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`text-2xl opacity-60 ${colors[color].split(' ').find(c => c.startsWith('text-'))}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
