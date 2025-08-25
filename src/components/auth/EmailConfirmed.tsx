import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, User } from 'lucide-react';

interface EmailConfirmedProps {
  onNavigate: (view: string) => void;
}

function EmailConfirmed({ onNavigate }: EmailConfirmedProps) {
  useEffect(() => {
    // 5秒後に自動で本登録画面に遷移
    const timer = setTimeout(() => {
      onNavigate('onboarding');
    }, 5000);

    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* メインカード */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 rounded-xl p-8 lg:p-12 border border-emerald-300/30 shadow-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100/50 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-800 mb-4">
                メール認証完了
              </h1>
              <p className="text-xl text-slate-700 mb-2">メールアドレスの確認が完了しました</p>
              <p className="text-slate-600">続いて、詳細情報を入力して本登録を完了してください</p>
            </div>

            {/* 次のステップ */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <div className="flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">本登録について</h3>
              <div className="text-left space-y-3 text-slate-700">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-navy-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <p>法人名・役職・氏名・電話番号を入力</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-navy-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <p>利用規約とプライバシーポリシーに同意</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-navy-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <p>登録完了後、すぐにサービスをご利用いただけます</p>
                </div>
              </div>
            </div>

            {/* 自動遷移カウントダウン */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-4 border border-white/30 mb-8">
              <p className="text-slate-600 text-sm">
                5秒後に自動的に本登録画面に移動します...
              </p>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('onboarding')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                <span>本登録に進む</span>
              </button>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2024 賢者の精算. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmed;