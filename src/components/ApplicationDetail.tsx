import React from 'react';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApplicationDetailProps {
  onBack: () => void;
  type: 'business-trip' | 'expense';
  applicationId: string;
}

function ApplicationDetail({ onBack, type, applicationId }: ApplicationDetailProps) {
  // サンプルデータ
  const applicationData = {
    'business-trip': {
      id: 'BT-2024-001',
      title: '東京出張',
      status: '承認済み',
      statusColor: 'text-emerald-700 bg-emerald-100',
      applicant: '田中太郎',
      department: '営業部',
      submittedDate: '2024-07-20',
      purpose: 'クライアント訪問および新規開拓営業',
      startDate: '2024-07-25',
      endDate: '2024-07-27',
      destination: '東京都港区',
      estimatedAmount: 52500,
      timeline: [
        { date: '2024-07-20 09:00', action: '申請提出', status: 'completed', user: '田中太郎' },
        { date: '2024-07-20 14:30', action: '部長承認', status: 'completed', user: '佐藤部長' },
        { date: '2024-07-21 10:15', action: '経理承認', status: 'completed', user: '山田経理' },
        { date: '2024-07-21 16:00', action: '最終承認', status: 'completed', user: '鈴木取締役' }
      ]
    },
    'expense': {
      id: 'EX-2024-001',
      title: '交通費・宿泊費精算',
      status: '待機中',
      statusColor: 'text-amber-700 bg-amber-100',
      applicant: '佐藤花子',
      department: '総務部',
      submittedDate: '2024-07-18',
      totalAmount: 12800,
      items: [
        { category: '交通費', amount: 5800, description: '新幹線代（往復）' },
        { category: '宿泊費', amount: 7000, description: 'ホテル宿泊費' }
      ],
      timeline: [
        { date: '2024-07-18 11:30', action: '申請提出', status: 'completed', user: '佐藤花子' },
        { date: '2024-07-18 15:45', action: '部長承認', status: 'completed', user: '田中部長' },
        { date: '2024-07-19 09:00', action: '経理確認中', status: 'pending', user: '山田経理' }
      ]
    }
  };

  const data = applicationData[type];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>戻る</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>PDF出力</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 基本情報 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-slate-800">{data.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.statusColor}`}>
                    {data.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">申請ID</p>
                    <p className="font-medium text-slate-800">{data.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">申請者</p>
                    <p className="font-medium text-slate-800">{data.applicant} ({data.department})</p>
                  </div>
                  <div>
                    <p className="text-slate-600">申請日</p>
                    <p className="font-medium text-slate-800">{data.submittedDate}</p>
                  </div>
                  {type === 'business-trip' && (
                    <>
                      <div>
                        <p className="text-slate-600">出張期間</p>
                        <p className="font-medium text-slate-800">
                          {(data as any).startDate} ～ {(data as any).endDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">訪問先</p>
                        <p className="font-medium text-slate-800">{(data as any).destination}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">予定金額</p>
                        <p className="font-medium text-slate-800">¥{(data as any).estimatedAmount.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {type === 'expense' && (
                    <div>
                      <p className="text-slate-600">合計金額</p>
                      <p className="font-medium text-slate-800">¥{(data as any).totalAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {type === 'business-trip' && (
                  <div className="mt-4">
                    <p className="text-slate-600 text-sm mb-2">出張目的</p>
                    <p className="text-slate-800">{(data as any).purpose}</p>
                  </div>
                )}

                {type === 'expense' && (
                  <div className="mt-4">
                    <p className="text-slate-600 text-sm mb-3">経費詳細</p>
                    <div className="space-y-2">
                      {(data as any).items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-white/30 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-slate-800">{item.category}</p>
                            <p className="text-sm text-slate-600">{item.description}</p>
                          </div>
                          <p className="font-bold text-slate-800">¥{item.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 承認状況・履歴 */}
            <div className="space-y-6">
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">承認状況</h2>
                <div className="space-y-4">
                  {data.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {getStatusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{item.action}</p>
                        <p className="text-xs text-slate-600">{item.user}</p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {type === 'expense' && (
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">領収書プレビュー</h2>
                  <div className="space-y-3">
                    <div className="bg-white/30 rounded-lg p-3 text-center">
                      <div className="w-full h-32 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-slate-500 text-sm">領収書画像</span>
                      </div>
                      <p className="text-xs text-slate-600">receipt_001.jpg</p>
                    </div>
                    <div className="bg-white/30 rounded-lg p-3 text-center">
                      <div className="w-full h-32 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-slate-500 text-sm">領収書画像</span>
                      </div>
                      <p className="text-xs text-slate-600">receipt_002.jpg</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;