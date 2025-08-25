import React, { useState } from 'react';
import { ArrowLeft, Bell, Mail, Smartphone, Filter, Search, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface NotificationHistoryProps {
  onNavigate: (view: string) => void;
}

interface Notification {
  id: string;
  type: 'email' | 'push';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'approval' | 'reminder' | 'system' | 'update';
}

function NotificationHistory({ onNavigate }: NotificationHistoryProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'email',
      title: '出張申請が承認されました',
      message: '田中太郎さんの東京出張申請（BT-2024-001）が承認されました。',
      timestamp: '2024-07-20T14:30:00Z',
      read: false,
      category: 'approval'
    },
    {
      id: '2',
      type: 'push',
      title: '経費申請の提出期限が近づいています',
      message: '7月分の経費申請の提出期限は明日です。お忘れなく提出してください。',
      timestamp: '2024-07-20T09:00:00Z',
      read: true,
      category: 'reminder'
    },
    {
      id: '3',
      type: 'email',
      title: '新機能のお知らせ',
      message: '出張規程管理機能がリリースされました。詳細はヘルプページをご確認ください。',
      timestamp: '2024-07-19T16:00:00Z',
      read: true,
      category: 'update'
    },
    {
      id: '4',
      type: 'push',
      title: 'システムメンテナンスのお知らせ',
      message: '7月25日（木）2:00-4:00にシステムメンテナンスを実施します。',
      timestamp: '2024-07-18T10:00:00Z',
      read: true,
      category: 'system'
    },
    {
      id: '5',
      type: 'email',
      title: '出張申請が却下されました',
      message: '佐藤花子さんの大阪出張申請（BT-2024-002）が却下されました。理由：予算超過',
      timestamp: '2024-07-17T11:30:00Z',
      read: true,
      category: 'approval'
    }
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'text-blue-600 bg-blue-100';
      case 'push':
        return 'text-emerald-600 bg-emerald-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'approval': '承認',
      'reminder': 'リマインド',
      'system': 'システム',
      'update': '更新'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'approval': 'text-red-700 bg-red-100',
      'reminder': 'text-amber-700 bg-amber-100',
      'system': 'text-slate-700 bg-slate-100',
      'update': 'text-emerald-700 bg-emerald-100'
    };
    return colors[category as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDeleteAll = () => {
    if (confirm('すべての通知履歴を削除してもよろしいですか？')) {
      alert('通知履歴が削除されました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="notification-history" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="notification-history" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">通知履歴</h1>
                </div>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-900 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>すべて削除</span>
                </button>
              </div>

              {/* 検索・フィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="通知を検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    >
                      <option value="all">すべての種類</option>
                      <option value="email">メール</option>
                      <option value="push">プッシュ</option>
                    </select>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    >
                      <option value="all">すべてのカテゴリ</option>
                      <option value="approval">承認</option>
                      <option value="reminder">リマインド</option>
                      <option value="system">システム</option>
                      <option value="update">更新</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 通知一覧 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl">
                <div className="divide-y divide-white/20">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">
                        {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                          ? '条件に一致する通知が見つかりません' 
                          : '通知履歴がありません'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-6 hover:bg-white/20 transition-colors ${
                          !notification.read ? 'bg-navy-50/30 border-l-4 border-navy-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                                {getTypeIcon(notification.type)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-slate-800">{notification.title}</h3>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-navy-600 rounded-full"></span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                                {getCategoryLabel(notification.category)}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm mb-3 ml-11">{notification.message}</p>
                            <p className="text-slate-500 text-xs ml-11">
                              {new Date(notification.timestamp).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          <button className="text-slate-400 hover:text-red-600 transition-colors ml-4">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationHistory;