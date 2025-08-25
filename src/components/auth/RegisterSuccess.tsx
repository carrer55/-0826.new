import React from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

interface RegisterSuccessProps {
  onNavigate: (view: string) => void;
}

function RegisterSuccess({ onNavigate }: RegisterSuccessProps) {
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
                確認メール送信完了
              </h1>
              <p className="text-xl text-slate-700 mb-2">確認メールを送信しました</p>
              <p className="text-slate-600">ご登録いただいたメールアドレスに確認メールを送信いたしました</p>
            </div>

            {/* 手順説明 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">次の手順</h3>
              <div className="text-left space-y-3 text-slate-700">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <p>メールボックスを確認してください</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <p>「賢者の精算」からの確認メールを開いてください</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <p>メール内の「メールアドレスを確認」ボタンをクリックしてください</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                  <p>本登録画面で詳細情報を入力して登録完了です</p>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="backdrop-blur-xl bg-amber-50/50 rounded-lg p-4 border border-amber-200/50 mb-8">
              <h4 className="font-semibold text-amber-800 mb-2">ご注意</h4>
              <ul className="text-amber-700 text-sm space-y-1 text-left">
                <li>• 確認メールが届かない場合は、迷惑メールフォルダをご確認ください</li>
                <li>• 確認リンクの有効期限は24時間です</li>
                <li>• 既に仮登録済みの場合でも、本登録未完了なら確認メールを再送します</li>
                <li>• メールが届かない場合は、再度同じメールアドレスで登録をお試しください</li>
              </ul>
            </div>

            {/* 確認メール再送ボタン */}
            <div className="backdrop-blur-xl bg-blue-50/50 rounded-lg p-4 border border-blue-200/50 mb-8">
              <h4 className="font-semibold text-blue-800 mb-2">確認メールが届かない場合</h4>
              <ul className="text-blue-700 text-sm space-y-1 text-left">
                <li>• 迷惑メールフォルダをご確認ください</li>
                <li>• メールアドレスに間違いがないかご確認ください</li>
                <li>• しばらく時間をおいてから再度お試しください</li>
                <li>• 問題が解決しない場合はサポートにお問い合わせください</li>
              </ul>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                <span>ログイン画面に戻る</span>
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

export default RegisterSuccess;