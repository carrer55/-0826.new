import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationCenterProps {
  onClose: () => void;
}

function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<string>('all');

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
      case 'approval':
        return 'text-red-600 bg-red-100';
      case 'reminder':
        return 'text-amber-600 bg-amber-100';
      case 'system':
        return 'text-slate-600 bg-slate-100';
      case 'update':
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    if (confirm('この通知を削除してもよろしいですか？')) {
      await deleteNotification(notificationId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-800">通知センター</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* フィルター */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-navy-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-navy-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              未読
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'read' 
                  ? 'bg-navy-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              既読
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                すべて既読
              </button>
            )}
          </div>
        </div>

        {/* 通知一覧 */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
              <span className="ml-3 text-slate-600">読み込み中...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">
                {filter === 'unread' ? '未読の通知はありません' : 
                 filter === 'read' ? '既読の通知はありません' : 
                 '通知はありません'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 border-l-4 border-navy-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-800">{notification.title}</h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-navy-600 rounded-full"></span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {getCategoryLabel(notification.type)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-2 ml-11">{notification.message}</p>
                      <p className="text-slate-500 text-xs ml-11">
                        {new Date(notification.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="既読にする"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;