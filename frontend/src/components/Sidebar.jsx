import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  BarChart2,
  Activity,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analysis', label: 'Stock Analysis', icon: TrendingUp },
  { id: 'inspector', label: 'Trade Check', icon: ShieldCheck },
  { id: 'screener', label: 'Screener', icon: BarChart2 },
  { id: 'autonomous', label: '24/7 Engine', icon: Activity, badge: 'AI' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-56 bg-[#0d1224] border-r border-[#1e2a45] flex flex-col shrink-0 hidden md:flex">
      <nav className="flex-1 p-3 space-y-1 pt-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-3">Main Menu</p>
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-[#151c30]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 text-white/60" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1e2a45] space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-2">Support</p>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-[#151c30] transition">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-[#151c30] transition">
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
      </div>

      <div className="p-3">
        <div className="bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-xs font-bold text-white mb-1">55–65% Win Rate</p>
          <p className="text-[10px] text-slate-400">AI-powered edge engine</p>
        </div>
      </div>
    </aside>
  );
}
