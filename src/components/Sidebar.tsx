import React from 'react';
import { 
  Home, 
  Plane, 
  Receipt, 
  FolderOpen, 
  Calculator, 
  Settings, 
  LogOut,
  User,
  X
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'ホーム', active: true },
  { icon: Plane, label: '出張申請', active: false },
  { icon: Receipt, label: '経費申請', active: false },
  { icon: FolderOpen, label: '書類管理', active: false },
  { icon: Calculator, label: '節税シミュレーション', active: false },
  { icon: Settings, label: '出張規定管理', active: false },
  { icon: User, label: 'マイページ（設定）', active: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  currentView?: string;
}

function Sidebar({ isOpen, onClose, onNavigate, currentView = 'dashboard' }: SidebarProps) {
  const handleMenuClick = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className={`
      fixed lg:relative z-50 lg:z-auto
      w-64 h-full 
    `}>
    <div className="w-64 h-screen backdrop-blur-xl bg-white/20 border-r border-white/30 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-white/5 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20"></div>
      
      <div className="p-4 lg:p-6 flex-shrink-0">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <img 
              src="/賢者の精算Logo2_Transparent_NoBuffer copy.png" 
              alt="賢者の精算ロゴ" 
              className="w-32 h-12 lg:w-48 lg:h-20 object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 relative z-10 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            let clickHandler = () => handleMenuClick('dashboard');
            let isActive = false;
            
            if (item.label === '出張申請') {
              clickHandler = () => handleMenuClick('business-trip');
              isActive = currentView === 'business-trip';
            } else if (item.label === '経費申請') {
              clickHandler = () => handleMenuClick('expense');
              isActive = currentView === 'expense';
            } else if (item.label === '書類管理') {
              clickHandler = () => handleMenuClick('document-management');
              isActive = currentView === 'document-management';
            } else if (item.label === '節税シミュレーション') {
              clickHandler = () => handleMenuClick('tax-simulation');
              isActive = currentView === 'tax-simulation';
            } else if (item.label === '出張規定管理') {
              clickHandler = () => handleMenuClick('travel-regulation-management');
              isActive = currentView === 'travel-regulation-management' || currentView === 'travel-regulation-creation' || currentView === 'travel-regulation-history';
            } else if (item.label === 'マイページ（設定）') {
              clickHandler = () => handleMenuClick('my-page');
              isActive = currentView === 'my-page';
            } else if (item.label === 'ホーム') {
              isActive = currentView === 'dashboard';
            }
            
            return (
              <li key={index}>
                <button
                  onClick={clickHandler}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-navy-700 to-navy-900 text-white shadow-xl backdrop-blur-sm border border-navy-600/50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-lg'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Card */}
      <div className="p-4 relative z-10 flex-shrink-0">
        <div className="backdrop-blur-xl bg-white/20 rounded-lg p-4 border border-white/30 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-800 text-sm font-medium" id="sidebar-user-name">
                山田太郎
              </p>
              <p className="text-slate-600 text-xs" id="sidebar-user-position">
                代表取締役
              </p>
            </div>
          </div>
          <button 
            onClick={async () => {
              // デモモードの場合はローカルストレージをクリア
              if (localStorage.getItem('demoMode') === 'true') {
                localStorage.removeItem('demoMode');
                localStorage.removeItem('demoSession');
                localStorage.removeItem('userProfile');
                window.location.reload();
              } else {
                // 通常のログアウト処理
                try {
                  const { signOut } = await import('../hooks/useAuth');
                  // ログアウト処理は AuthWrapper で useAuth フックを通じて処理される
                  window.location.reload();
                } catch (error) {
                  console.error('Logout error:', error);
                  window.location.reload();
                }
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/30 hover:bg-white/50 rounded-lg border border-white/40 transition-all duration-200 backdrop-blur-sm hover:shadow-lg"
          >
            <LogOut className="w-4 h-4 text-slate-700" />
            <span className="text-slate-700 text-sm">ログアウト</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Sidebar;