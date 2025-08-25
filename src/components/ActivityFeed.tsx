import React from 'react';
import { FileText, Upload, Users, Clock } from 'lucide-react';

const activities = [
  {
    icon: FileText,
    text: '新しい出張申請が承認されました（営業部：田中太郎）',
    time: '2分前',
    iconColor: 'text-gray-600 bg-gray-100'
  },
  {
    icon: Upload,
    text: '経費請求書の領収書がアップロードされました（総務部：佐藤花子）',
    time: '15分前',
    iconColor: 'text-gray-700 bg-gray-200'
  },
  {
    icon: Users,
    text: '新しいチームメンバーが追加されました（経理部：鈴木次郎）',
    time: '1時間前',
    iconColor: 'text-gray-600 bg-gray-100'
  },
  {
    icon: FileText,
    text: '新しい書類がアップロードされました（税理コンサル、佐藤花子）',
    time: '3日前',
    iconColor: 'text-gray-500 bg-gray-50'
  }
];

function ActivityFeed() {
  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 lg:p-6 border border-white/30 shadow-xl relative overflow-hidden">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-white/20 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-slate-800 relative z-10">活動履歴</h2>
        <Clock className="w-5 h-5 text-slate-500 relative z-10" />
      </div>

      <div className="space-y-4 relative z-10">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-white/20 rounded-lg transition-colors">
              <div className={`p-2 rounded-lg ${activity.iconColor} flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 text-sm leading-relaxed">{activity.text}</p>
                <p className="text-slate-600 text-xs mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors relative z-10">
        すべての活動を表示
      </button>
    </div>
  );
}

export default ActivityFeed;