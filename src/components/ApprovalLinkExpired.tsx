import React from 'react';
import { AlertTriangle, RefreshCw, MessageCircle, Clock, ExternalLink } from 'lucide-react';

interface ApprovalLinkExpiredProps {
  applicationId?: string;
  expiredAt?: string;
}

function ApprovalLinkExpired({ applicationId = 'BT-2024-001', expiredAt = '2024-07-20T18:00:00Z' }: ApprovalLinkExpiredProps) {
  const handleRequestNewLink = () => {
    alert('新しい承認リンクの発行を申請者に依頼しました。');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@kenjano-seisan.com?subject=承認リンク期限切れについて&body=申請ID: ' + applicationId, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* メインカード */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-xl p-8 lg:p-12 border border-red-300/30 shadow-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100/50 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-red-800 mb-4">
                承認リンクの有効期限が切れています
              </h1>
              <p className="text-xl text-slate-700 mb-2">このリンクは既に使用できません</p>
              <p className="text-slate-600">セキュリティのため、承認リンクには有効期限が設定されています</p>
            </div>

            {/* 詳細情報 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">申請ID</p>
                    <p className="font-medium text-slate-800">{applicationId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">期限切れ日時</p>
                    <p className="font-medium text-slate-800">
                      {new Date(expiredAt).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 対処方法 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">対処方法</h3>
              <div className="text-left space-y-3 text-slate-700">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-navy-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <p>申請者に新しい承認リンクの発行を依頼してください</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-navy-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <p>システム内から直接承認処理を行ってください</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-navy-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <p>問題が解決しない場合は、サポートにお問い合わせください</p>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRequestNewLink}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>新しいリンクを依頼</span>
              </button>
              
              <button
                onClick={handleContactSupport}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span>サポートに問い合わせ</span>
              </button>
            </div>

            {/* セキュリティ情報 */}
            <div className="mt-8 text-slate-600 text-sm">
              <p className="mb-2">
                <strong>セキュリティについて：</strong>
                承認リンクは発行から24時間で自動的に無効になります。
              </p>
              <p>
                これは不正アクセスを防ぎ、お客様の情報を保護するための仕組みです。
              </p>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              賢者の精算システム - セキュリティ保護機能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalLinkExpired;