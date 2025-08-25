import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, MessageSquare, Clock, User, Calendar, FileText } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';

interface ApprovalWorkflowProps {
  applicationId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface ApplicationDetail {
  id: string;
  type: 'business_trip' | 'expense';
  title: string;
  description: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  submitted_at: string | null;
  user_profiles?: {
    full_name: string;
    department: string;
    position: string;
  };
  business_trip_details?: Array<{
    start_date: string;
    end_date: string;
    purpose: string;
    destination: string;
    estimated_daily_allowance: number;
    estimated_transportation: number;
    estimated_accommodation: number;
  }>;
  expense_items?: Array<{
    category: string;
    date: string;
    amount: number;
    description: string;
    receipt_url: string | null;
  }>;
}

function ApprovalWorkflow({ applicationId, onComplete, onCancel }: ApprovalWorkflowProps) {
  const { handleApproval, loading } = useApplications();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      // 実際の実装では、useApplicationsフックまたは直接Supabaseクエリを使用
      // ここではサンプルデータを使用
      const sampleApplication: ApplicationDetail = {
        id: applicationId,
        type: 'business_trip',
        title: '東京出張申請',
        description: 'クライアント訪問および新規開拓営業',
        total_amount: 52500,
        status: 'pending',
        created_at: '2024-07-20T09:00:00Z',
        submitted_at: '2024-07-20T09:30:00Z',
        user_profiles: {
          full_name: '田中太郎',
          department: '営業部',
          position: '課長'
        },
        business_trip_details: [{
          start_date: '2024-07-25',
          end_date: '2024-07-27',
          purpose: 'クライアント訪問および新規開拓営業',
          destination: '東京都港区',
          estimated_daily_allowance: 15000,
          estimated_transportation: 22500,
          estimated_accommodation: 15000
        }]
      };
      
      setApplication(sampleApplication);
    } catch (error) {
      console.error('Failed to fetch application detail:', error);
    }
  };

  const handleAction = async (action: 'approved' | 'returned' | 'rejected') => {
    if (action !== 'approved' && !comment.trim()) {
      alert('コメントを入力してください。');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await handleApproval(applicationId, action, comment);
      
      if (result.success) {
        alert(`申請を${action === 'approved' ? '承認' : action === 'returned' ? '差戻し' : '否認'}しました。`);
        onComplete();
      } else {
        alert('処理に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('Approval action error:', error);
      alert('処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
        <span className="ml-3 text-slate-600">申請詳細を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">申請承認</h2>
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </button>
      </div>

      {/* 申請詳細 */}
      <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">{application.title}</h3>
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
                <p className="font-medium text-slate-800">
                  {application.user_profiles?.full_name} ({application.user_profiles?.department})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">申請日</p>
                <p className="font-medium text-slate-800">
                  {new Date(application.submitted_at || application.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            {application.type === 'business_trip' && application.business_trip_details?.[0] && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">出張期間</p>
                  <p className="font-medium text-slate-800">
                    {application.business_trip_details[0].start_date} ～ {application.business_trip_details[0].end_date}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">申請金額</p>
              <p className="text-2xl font-bold text-slate-800">¥{application.total_amount.toLocaleString()}</p>
            </div>
            {application.type === 'business_trip' && application.business_trip_details?.[0] && (
              <div>
                <p className="text-sm text-slate-600 mb-1">訪問先</p>
                <p className="font-medium text-slate-800">{application.business_trip_details[0].destination}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-2">
            {application.type === 'business_trip' ? '出張目的' : '申請内容'}
          </p>
          <p className="text-slate-800 bg-white/30 rounded-lg p-4">
            {application.type === 'business_trip' 
              ? application.business_trip_details?.[0]?.purpose 
              : application.description}
          </p>
        </div>

        {/* 経費内訳 */}
        {application.type === 'business_trip' && application.business_trip_details?.[0] && (
          <div>
            <p className="text-sm text-slate-600 mb-3">経費内訳</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/30 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">出張日当</p>
                <p className="text-lg font-bold text-slate-800">
                  ¥{application.business_trip_details[0].estimated_daily_allowance.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/30 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">交通費</p>
                <p className="text-lg font-bold text-slate-800">
                  ¥{application.business_trip_details[0].estimated_transportation.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/30 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">宿泊費</p>
                <p className="text-lg font-bold text-slate-800">
                  ¥{application.business_trip_details[0].estimated_accommodation.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 経費項目一覧 */}
        {application.type === 'expense' && application.expense_items && (
          <div>
            <p className="text-sm text-slate-600 mb-3">経費項目</p>
            <div className="space-y-2">
              {application.expense_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white/30 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-slate-800">{item.category}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                  <p className="font-bold text-slate-800">¥{item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* コメント入力 */}
      <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">承認コメント</h3>
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
  );
}

export default ApprovalWorkflow;