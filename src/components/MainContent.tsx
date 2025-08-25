import React from 'react';
import StatsCards from './StatsCards';
import QuickActions from './QuickActions';
import RecentApplications from './RecentApplications';
import ActivityFeed from './ActivityFeed';

interface MainContentProps {
  onNavigate: (view: string) => void;
  onShowDetail: (type: 'business-trip' | 'expense', id: string) => void;
  onCreateApplication: (type: 'business_trip' | 'expense') => void;
  onShowNotifications: () => void;
}

function MainContent({ onNavigate, onShowDetail, onCreateApplication, onShowNotifications }: MainContentProps) {
  // ユーザーの役割を取得（実際の実装では、ユーザー情報から取得）
  const getUserRole = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return userProfile.role || 'user'; // デフォルトは一般ユーザー
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 'admin' || userRole === '管理者';

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">ダッシュボード</h1>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-200"
            >
              <span>管理者ダッシュボード</span>
            </button>
          )}
        </div>
        
        <StatsCards />
        <QuickActions onNavigate={onNavigate} onCreateApplication={onCreateApplication} />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <RecentApplications 
            onShowDetail={onShowDetail} 
            onNavigate={onNavigate}
            onShowNotifications={onShowNotifications}
          />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

export default MainContent;