import { useState } from 'react';
import {
  LayoutDashboard, List, CreditCard, ArrowLeftRight, PiggyBank,
  FileText, Target, User, MoreHorizontal, LogOut, ChevronLeft, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PageId } from '@/lib/types';
import { formatRupiah } from '@/lib/format';

const ICON_MAP: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'list': List,
  'credit-card': CreditCard,
  'arrow-left-right': ArrowLeftRight,
  'piggy-bank': PiggyBank,
  'file-text': FileText,
  'target': Target,
  'user': User,
  'sparkles': Sparkles,
};

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  hideMobile?: boolean;
  badge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'transactions', label: 'Transaksi', icon: 'list' },
  { id: 'accounts', label: 'Akun Bank', icon: 'credit-card', hideMobile: true },
  { id: 'transfer', label: 'Transfer', icon: 'arrow-left-right' },
  { id: 'budget', label: 'Budgeting', icon: 'piggy-bank', badge: true },
  { id: 'report', label: 'Laporan', icon: 'file-text', hideMobile: true },
  { id: 'advisor', label: 'Asisten AI', icon: 'sparkles', badge: true },
  { id: 'goals', label: 'Target & Berulang', icon: 'target', hideMobile: true, badge: true },
  { id: 'profile', label: 'Profil', icon: 'user', hideMobile: true },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  totalBalance: number;
  onSignOut: () => void;
  budgetOverCount: number;
  goalsDueCount: number;
}

export function Sidebar({
  currentPage, onNavigate, fullName, email, avatarUrl,
  totalBalance, onSignOut, budgetOverCount, goalsDueCount,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const renderIcon = (icon: string, size = 17) => {
    const Icon = ICON_MAP[icon] ?? LayoutDashboard;
    return <Icon size={size} />;
  };

  const renderBadge = (item: NavItem) => {
    if (!item.badge) return null;
    const count = item.id === 'budget' ? budgetOverCount : item.id === 'goals' ? goalsDueCount : 0;
    if (count === 0) return null;
    return <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B6B]" />;
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex sticky top-0 h-screen flex-shrink-0 z-10 transition-all duration-200
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
      >
        <div
          className={`w-full h-full bg-[#0F1A2E] border-r border-[#223252] flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden p-7 max-md:p-0 transition-all duration-200
            ${collapsed ? 'w-[68px] p-7 max-md:p-0' : 'w-[240px]'}`}
          style={{ paddingLeft: collapsed ? '10px' : '18px', paddingRight: collapsed ? '10px' : '18px' }}
        >
          {/* Brand */}
          <div className={`flex items-center gap-2.5 mb-7 font-display font-extrabold text-xl ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-2.5 h-2.5 rounded bg-gradient-to-br from-[#34D8A6] to-[#F2B84B] flex-shrink-0" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div>Money Tracker</div>
                <small className="text-[#8C9BBE] font-medium text-[10.5px] block mt-0.5 tracking-wide">Pengelola Keuangan</small>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="border border-[#223252] text-[#8C9BBE] w-[26px] h-[26px] rounded-[7px] flex items-center justify-center transition-all hover:text-[#34D8A6] hover:border-[#34D8A6] cursor-pointer flex-shrink-0"
              style={{ display: collapsed ? 'none' : 'flex' }}
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="border border-[#223252] text-[#8C9BBE] w-[26px] h-[26px] rounded-[7px] flex items-center justify-center mx-auto mb-4 transition-all hover:text-[#34D8A6] hover:border-[#34D8A6] cursor-pointer"
            >
              <ChevronLeft size={14} className="rotate-180" />
            </button>
          )}

          {/* Nav items */}
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 p-3 rounded-[10px] font-semibold text-sm transition-all cursor-pointer relative
                  ${collapsed ? 'justify-center' : ''}
                  ${currentPage === item.id
                    ? 'bg-[#182742] text-[#34D8A6] shadow-[inset_2px_0_0_#34D8A6]'
                    : 'text-[#8C9BBE] hover:bg-[#131F36] hover:text-[#EAF0FB]'
                  }`}
              >
                {renderIcon(item.icon)}
                {!collapsed && <span>{item.label}</span>}
                {renderBadge(item)}
              </button>
            ))}
          </div>

          {/* Bottom */}
          {!collapsed && (
            <div className="mt-auto flex flex-col gap-2.5">
              <div className="p-3.5 bg-[#131F36] rounded-[12px]">
                <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D8A6]" />
                  Tersinkron
                </div>
                <div className="text-[#8C9BBE] text-[11px] leading-snug">Supabase real-time · sinkron antar perangkat</div>
              </div>
              <div className="p-3.5 bg-[#131F36] rounded-[12px]">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Avatar fullName={fullName} avatarUrl={avatarUrl} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{fullName || '—'}</div>
                    <div className="text-[#8C9BBE] font-medium text-[11px] truncate">{email}</div>
                  </div>
                </div>
                <button onClick={onSignOut} className="border border-[#223252] text-[#8C9BBE] py-[7px] px-2.5 rounded-[7px] text-xs w-full transition-all hover:text-[#FF6B6B] hover:border-[#FF6B6B] cursor-pointer">
                  Keluar
                </button>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mt-auto flex flex-col items-center gap-2 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D8A6]" />
              <Avatar fullName={fullName} avatarUrl={avatarUrl} size={34} />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[45] bg-[#131F36] border-t border-[#223252]
                      rounded-t-[16px] flex items-center justify-around py-1.5 px-1 gap-0
                      shadow-[0_-4px_24px_rgba(0,0,0,0.3)]"
           style={{ paddingBottom: 'calc(6px + env(safe-area-inset-bottom))' }}>
        {NAV_ITEMS.filter((i) => !i.hideMobile).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded-[10px] min-w-0 transition-all cursor-pointer
              ${currentPage === item.id ? 'bg-[#182742] text-[#34D8A6]' : 'text-[#8C9BBE]'}`}
          >
            {renderIcon(item.icon, 20)}
            <span className="text-[10px] font-semibold truncate max-w-full">{item.label.split(' ')[0]}</span>
            {renderBadge(item)}
          </button>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded-[10px] text-[#8C9BBE] cursor-pointer"
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-semibold">Lainnya</span>
        </button>
      </nav>

      {/* Mobile "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-[rgba(5,9,18,0.7)] backdrop-blur-[3px]" />
          <div className="relative bg-[#182742] rounded-t-[20px] border border-[#223252] p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-9 h-1 rounded bg-[#223252] mx-auto mb-5" />
            <h3 className="font-bold text-[15px] mb-3.5">Menu Lainnya</h3>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.filter((i) => i.hideMobile).map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMoreOpen(false); }}
                  className={`flex items-center gap-3.5 p-3 rounded-[12px] font-semibold text-sm transition-all cursor-pointer relative
                    ${currentPage === item.id ? 'bg-[#182742] text-[#34D8A6]' : 'text-[#EAF0FB]'}`}
                >
                  <span className="text-[#8C9BBE]">{renderIcon(item.icon, 19)}</span>
                  {item.label}
                  {renderBadge(item)}
                </button>
              ))}
              <button
                onClick={onSignOut}
                className="flex items-center gap-3.5 p-3 rounded-[12px] font-semibold text-sm text-[#FF6B6B] cursor-pointer mt-2"
              >
                <LogOut size={19} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Avatar({ fullName, avatarUrl, size = 34 }: { fullName: string; avatarUrl: string | null; size?: number }) {
  const initial = (fullName || '?').charAt(0).toUpperCase();
  if (avatarUrl) {
    return (
      <div
        className="rounded-full bg-cover bg-center flex-shrink-0 border border-[#223252]"
        style={{ width: size, height: size, backgroundImage: `url(${avatarUrl})` }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-[#182742] border border-[#223252] flex items-center justify-center font-extrabold text-[#34D8A6] flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initial}
    </div>
  );
}

interface MobileTopBarProps {
  totalBalance: number;
  fullName: string;
  avatarUrl: string | null;
  onSignOut: () => void;
}

export function MobileTopBar({ totalBalance, fullName, avatarUrl, onSignOut }: MobileTopBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-[200] bg-[#0F1A2E] border-b border-[#223252] px-3.5 py-2.5 backdrop-blur-[10px] grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center gap-2 font-display font-extrabold text-[17px]">
          <div className="w-2 h-2 rounded bg-gradient-to-br from-[#34D8A6] to-[#F2B84B] flex-shrink-0" />
          Money Tracker
        </div>
        <div className="text-center">
          <div className="text-[9px] text-[#8C9BBE] font-bold tracking-wide uppercase">Total Saldo</div>
          <div className="font-display text-[15px] font-extrabold whitespace-nowrap">{formatRupiah(totalBalance)}</div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D8A6] flex-shrink-0" />
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-[#182742] border border-[#223252] px-2.5 py-1 rounded-full cursor-pointer max-w-[150px] overflow-hidden"
          >
            <Avatar fullName={fullName} avatarUrl={avatarUrl} size={28} />
            <span className="text-xs font-semibold truncate max-w-[90px]">{fullName || 'Akun'}</span>
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-[rgba(5,9,18,0.7)] backdrop-blur-[3px]" />
          <div className="relative bg-[#182742] rounded-t-[20px] border border-[#223252] p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-9 h-1 rounded bg-[#223252] mx-auto mb-5" />
            <div className="font-bold text-sm">{fullName || '—'}</div>
            <div className="flex items-center gap-1.5 text-xs text-[#8C9BBE] mt-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D8A6]" />
              Tersinkron
            </div>
            <button onClick={onSignOut} className="btn-danger w-full">Keluar dari Akun</button>
          </div>
        </div>
      )}
    </>
  );
}
