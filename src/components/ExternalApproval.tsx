import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowLeft, MessageSquare, Clock, User, Calendar } from 'lucide-react';

interface ExternalApprovalProps {
  applicationId: string;
  onComplete: (result: 'approved' | 'returned' | 'rejected', comment: string) => void;
}

function ExternalApproval({ applicationId, onComplete }: ExternalApprovalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // サンプルデータ（実際の実装では、applicationIdに基づいてデータを取得）
  const applicationData = {
    id: 'BT-2024-001',
    type: 'business-trip',
    title: '東京出張申請',
    applicant: '田中太郎',
    department: '営業部',
    submittedDate: '2024-07-20',
    purpose: 'クライアント訪問および新規開拓営業',
    startDate: '2024-07-25',
    endDate: '2024-07-27',
    destination: '東京都港区',
    estimatedAmount: 52500,
    details: {
      dailyAllowance: 15000,
      transportation: 22500,
      accommodation: 15000
    }
  };

  const handleAction = async (action: 'approved' | 'returned' | 'rejected') => {
    if (action !== 'approved' && !comment.trim()) {
      alert('コメントを入力してください。');
      return;
    }

    setIsSubmitting(true);
    
    // 実際の実装では、ここでAPIを呼び出す
    setTimeout(() => {
      onComplete(action, comment);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">申請承認</h1>
            <p className="text-slate-600">以下の申請内容をご確認の上、承認・差戻し・否認をお選びください</p>
          </div>

          {/* 申請詳細 */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">{applicationData.title}</h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium text-amber-700 bg-amber-100">
                承認待ち
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">申請者</p>
                    <p className="font-medium text-slate-800">{applicationData.applicant} ({applicationData.department})</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">申請日</p>
                    <p className="font-medium text-slate-800">{applicationData.submittedDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">出張期間</p>
                    <p className="font-medium text-slate-800">
                      {applicationData.startDate} ～ {applicationData.endDate}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">訪問先</p>
                  <p className="font-medium text-slate-800">{applicationData.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">予定金額</p>
                  <p className="text-2xl font-bold text-slate-800">¥{applicationData.estimatedAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-2">出張目的</p>
              <p className="text-slate-800 bg-white/30 rounded-lg p-4">{applicationData.purpose}</p>
            </div>

            {/* 経費内訳 */}
            <div>
              <p className="text-sm text-slate-600 mb-3">経費内訳</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">出張日当</p>
                  <p className="text-lg font-bold text-slate-800">¥{applicationData.details.dailyAllowance.toLocaleString()}</p>
                </div>
                <div className="bg-white/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">交通費</p>
                  <p className="text-lg font-bold text-slate-800">¥{applicationData.details.transportation.toLocaleString()}</p>
                </div>
                <div className="bg-white/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">宿泊費</p>
                  <p className="text-lg font-bold text-slate-800">¥{applicationData.details.accommodation.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* コメント入力 */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">コメント</h3>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
              rows={4}
              placeholder="承認・差戻し・否認の理由やコメントを入力してください（差戻し・否認の場合は必須）"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleAction('approved')}
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isSubmitting ? '処理中...' : '承認'}</span>
            </button>
            
            <button
              onClick={() => handleAction('returned')}
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{isSubmitting ? '処理中...' : '差戻し'}</span>
            </button>
            
            <button
              onClick={() => handleAction('rejected')}
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              <span>{isSubmitting ? '処理中...' : '否認'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExternalApproval;