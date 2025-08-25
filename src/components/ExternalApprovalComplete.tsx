import React from 'react';
import { CheckCircle, XCircle, ArrowLeft, Calendar, User } from 'lucide-react';

interface ExternalApprovalCompleteProps {
  result: 'approved' | 'returned' | 'rejected';
  applicationId: string;
  comment: string;
}

function ExternalApprovalComplete({ result, applicationId, comment }: ExternalApprovalCompleteProps) {
  const getResultConfig = () => {
    switch (result) {
      case 'approved':
        return {
          icon: CheckCircle,
          title: '承認完了',
          message: '申請が承認されました',
          description: '申請者に承認通知が送信されました。',
          bgColor: 'from-emerald-500/20 to-emerald-700/20',
          borderColor: 'border-emerald-300/30',
          iconColor: 'text-emerald-600',
          titleColor: 'text-emerald-800'
        };
      case 'returned':
        return {
          icon: ArrowLeft,
          title: '差戻し完了',
          message: '申請が差戻されました',
          description: '申請者に差戻し通知とコメントが送信されました。',
          bgColor: 'from-amber-500/20 to-amber-700/20',
          borderColor: 'border-amber-300/30',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-800'
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: '否認完了',
          message: '申請が否認されました',
          description: '申請者に否認通知とコメントが送信されました。',
          bgColor: 'from-red-500/20 to-red-700/20',
          borderColor: 'border-red-300/30',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800'
        };
      default:
        return {
          icon: CheckCircle,
          title: '処理完了',
          message: '処理が完了しました',
          description: '',
          bgColor: 'from-slate-500/20 to-slate-700/20',
          borderColor: 'border-slate-300/30',
          iconColor: 'text-slate-600',
          titleColor: 'text-slate-800'
        };
    }
  };

  const config = getResultConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* メインカード */}
          <div className={`backdrop-blur-xl bg-gradient-to-br ${config.bgColor} rounded-xl p-8 lg:p-12 border ${config.borderColor} shadow-2xl`}>
            <div className="mb-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-white/30 flex items-center justify-center`}>
                <Icon className={`w-10 h-10 ${config.iconColor}`} />
              </div>
              <h1 className={`text-3xl lg:text-4xl font-bold ${config.titleColor} mb-4`}>
                {config.title}
              </h1>
              <p className="text-xl text-slate-700 mb-2">{config.message}</p>
              <p className="text-slate-600">{config.description}</p>
            </div>

            {/* 申請情報 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">申請ID</p>
                    <p className="font-medium text-slate-800">{applicationId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">処理日時</p>
                    <p className="font-medium text-slate-800">
                      {new Date().toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
              
              {comment && (
                <div className="mt-6 pt-6 border-t border-white/30">
                  <p className="text-sm text-slate-600 mb-2">コメント</p>
                  <div className="bg-white/30 rounded-lg p-4">
                    <p className="text-slate-800">{comment}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 次のステップ */}
            <div className="text-slate-600 text-sm">
              <p className="mb-4">
                {result === 'approved' 
                  ? '申請者は承認された申請を確認し、出張の準備を進めることができます。'
                  : result === 'returned'
                  ? '申請者は差戻しされた申請を修正して再提出することができます。'
                  : '申請者に否認の通知が送信されました。'
                }
              </p>
              <p className="text-xs text-slate-500">
                このページは一度のみ表示されます。必要に応じてスクリーンショットを保存してください。
              </p>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              賢者の精算システム - 外部承認機能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExternalApprovalComplete;