import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCw, MessageCircle, Copy, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AccountingErrorProps {
  onNavigate: (view: string) => void;
}

interface ErrorDetail {
  id: string;
  applicationId: string;
  service: string;
  errorCode: string;
  errorMessage: string;
  technicalDetails: string;
  occurredAt: string;
  retryCount: number;
  lastRetry?: string;
  nextRetryAt?: string;
  resolution?: string;
  affectedUsers: string[];
}

function AccountingError({ onNavigate }: AccountingErrorProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // サンプルエラーデータ
  const errorDetail: ErrorDetail = {
    id: 'ERR-2024-001',
    applicationId: 'EX-2024-001',
    service: 'MoneyForward',
    errorCode: 'AUTH_TOKEN_EXPIRED',
    errorMessage: 'API認証エラー: アクセストークンの有効期限が切れています',
    technicalDetails: `HTTP Status: 401 Unauthorized
Response Body: {
  "error": "invalid_token",
  "error_description": "The access token expired",
  "timestamp": "2024-07-20T14:15:32Z"
}

Request Headers:
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Request URL: https://api.moneyforward.com/v1/transactions`,
    occurredAt: '2024-07-20T14:15:32Z',
    retryCount: 2,
    lastRetry: '2024-07-20T15:45:00Z',
    nextRetryAt: '2024-07-20T17:00:00Z',
    resolution: 'OAuth認証の再実行が必要です。会計連携設定画面から再認証を行ってください。',
    affectedUsers: ['佐藤花子', '田中太郎']
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  const handleRetry = () => {
    if (confirm('この送信を再試行しますか？')) {
      alert('再送信を開始しました');
    }
  };

  const handleContactSupport = () => {
    onNavigate('support');
  };

  const handleReconnect = () => {
    onNavigate('accounting-integration');
  };

  const getServiceLogo = (service: string) => {
    const logos = {
      'freee': '🟢',
      'MoneyForward': '🔵',
      '弥生会計': '🟡'
    };
    return logos[service as keyof typeof logos] || '⚪';
  };

  const getErrorSeverity = (errorCode: string) => {
    const severities = {
      'AUTH_TOKEN_EXPIRED': { level: 'warning', color: 'text-amber-700 bg-amber-100' },
      'NETWORK_ERROR': { level: 'error', color: 'text-red-700 bg-red-100' },
      'DATA_FORMAT_ERROR': { level: 'error', color: 'text-red-700 bg-red-100' },
      'RATE_LIMIT_EXCEEDED': { level: 'warning', color: 'text-amber-700 bg-amber-100' }
    };
    return severities[errorCode as keyof typeof severities] || { level: 'error', color: 'text-red-700 bg-red-100' };
  };

  const severity = getErrorSeverity(errorDetail.errorCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="accounting-error" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="accounting-error" />
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
                    onClick={() => onNavigate('accounting-log')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">エラー詳細</h1>
                </div>
              </div>

              {/* エラー概要 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getServiceLogo(errorDetail.service)}</div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800 mb-1">{errorDetail.service} 連携エラー</h2>
                      <p className="text-slate-600">申請ID: {errorDetail.applicationId}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${severity.color}`}>
                    {errorDetail.errorCode}
                  </span>
                </div>

                <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800 mb-1">エラーメッセージ</h3>
                      <p className="text-red-700">{errorDetail.errorMessage}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">発生日時</p>
                    <p className="font-medium text-slate-800">
                      {new Date(errorDetail.occurredAt).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">再試行回数</p>
                    <p className="font-medium text-slate-800">{errorDetail.retryCount}回</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">最終再試行</p>
                    <p className="font-medium text-slate-800">
                      {errorDetail.lastRetry ? new Date(errorDetail.lastRetry).toLocaleString('ja-JP') : '―'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">次回再試行予定</p>
                    <p className="font-medium text-slate-800">
                      {errorDetail.nextRetryAt ? new Date(errorDetail.nextRetryAt).toLocaleString('ja-JP') : '―'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 解決方法 */}
              {errorDetail.resolution && (
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                    推奨解決方法
                  </h3>
                  <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4 mb-4">
                    <p className="text-emerald-800">{errorDetail.resolution}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleReconnect}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>再認証を実行</span>
                    </button>
                    <button
                      onClick={handleRetry}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>再送信</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 影響を受けたユーザー */}
              {errorDetail.affectedUsers.length > 0 && (
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">影響を受けたユーザー</h3>
                  <div className="flex flex-wrap gap-2">
                    {errorDetail.affectedUsers.map((user, index) => (
                      <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        {user}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 技術詳細 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">技術詳細</h3>
                  <button
                    onClick={() => handleCopyToClipboard(errorDetail.technicalDetails)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/30 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    {copiedText === errorDetail.technicalDetails ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                    <span className="text-sm text-slate-700">
                      {copiedText === errorDetail.technicalDetails ? 'コピー済み' : 'コピー'}
                    </span>
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-slate-100 text-sm whitespace-pre-wrap font-mono">
                    {errorDetail.technicalDetails}
                  </pre>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleContactSupport}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>サポートに問い合わせ</span>
                </button>
                
                <button
                  onClick={() => onNavigate('accounting-log')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                >
                  <Clock className="w-5 h-5" />
                  <span>ログ一覧に戻る</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountingError;