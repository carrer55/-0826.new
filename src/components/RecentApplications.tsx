import React from 'react';
import { MoreHorizontal, Bell } from 'lucide-react';

const applications = [
  {
    date: '2024-07-20',
    type: '出張申請',
    applicant: '田中太郎',
    amount: '¥52,500',
    status: '承認済み',
    statusColor: 'text-emerald-700 bg-emerald-100'
  },
  {
    date: '2024-07-18',
    type: '経費申請',
    applicant: '佐藤花子',
    amount: '¥12,800',
    status: '待機中',
    statusColor: 'text-amber-700 bg-amber-100'
  },
  {
    date: '2024-07-15',
    type: '経費申請',
    applicant: '鈴木次郎',
    amount: '¥85,000',
    status: '承認済み',
    statusColor: 'text-emerald-700 bg-emerald-100'
  }
];

interface RecentApplicationsProps {
  onShowDetail: (type: 'business-trip' | 'expense', id: string) => void;
  onNavigate: (view: string) => void;
  onShowNotifications: () => void;
}

function RecentApplications({ onShowDetail, onNavigate, onShowNotifications }: RecentApplicationsProps) {
  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 lg:p-6 border border-white/30 shadow-xl relative overflow-hidden">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-white/20 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-slate-800 relative z-10">最近の申請</h2>
        <div className="flex items-center space-x-2 relative z-10">
          <button 
            onClick={onShowNotifications}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
            title="通知センター"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onNavigate('application-status')}
            className="text-slate-400 hover:text-slate-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2 lg:gap-4 text-xs font-medium text-slate-600 pb-2 border-b border-white/30 min-w-max">
              <span>日付</span>
              <span>種別</span>
              <span>申請者</span>
              <span>金額</span>
              <span>ステータス</span>
            </div>
            {applications.map((app, index) => (
              <div 
                key={index} 
                className="grid grid-cols-5 gap-2 lg:gap-4 items-center py-3 hover:bg-white/20 rounded-lg px-2 transition-colors min-w-max cursor-pointer"
                onClick={() => onShowDetail(app.type === '出張申請' ? 'business-trip' : 'expense', `${app.type}-${index}`)}
              >
                <span className="text-slate-700 text-sm">{app.date}</span>
                <span className="text-slate-700 text-sm">{app.type}</span>
                <span className="text-slate-700 text-sm">{app.applicant}</span>
                <span className="text-slate-900 font-medium text-sm">{app.amount}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentApplications;