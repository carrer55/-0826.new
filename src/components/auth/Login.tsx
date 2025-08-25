import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, RotateCcw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginProps {
  onNavigate: (view: string) => void;
  onLoginSuccess: () => void;
}

function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // デモアカウントの処理
    if (email === 'demo' && password === 'pass9981') {
      try {
        // デモユーザーのプロフィール情報をローカルストレージに設定
        const demoProfile = {
          id: 'demo-user-id',
          email: 'demo',
          full_name: 'デモユーザー',
          company_name: '株式会社デモ',
          position: '代表取締役',
          phone: '090-0000-0000',
          department: '経営企画部',
          role: 'admin',
          default_organization_id: null,
          avatar_url: null,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('userProfile', JSON.stringify(demoProfile));
        localStorage.setItem('demoMode', 'true');
        
        // 認証状態をシミュレート
        const demoSession = {
          user: {
            id: 'demo-user-id',
            email: 'demo',
            email_confirmed_at: new Date().toISOString()
          }
        };
        
        localStorage.setItem('demoSession', JSON.stringify(demoSession));
        
        // ログイン成功
        onLoginSuccess();
        window.location.reload(); // デモモードの場合はリロードして状態を更新
        return;
      } catch (err) {
        console.error('Demo login error:', err);
        return;
      }
    }

    // 通常のログイン処理
    const result = await signIn(email, password);
    
    if (result.success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* ロゴ */}
          <div className="text-center mb-8">
            <div className="w-full h-24 mx-auto mb-6 flex items-center justify-center">
              <img 
                src="/賢者の精算Logo2_Transparent_NoBuffer copy.png" 
                alt="賢者の精算ロゴ" 
                className="h-full object-contain"
              />
            </div>
            <p className="text-slate-600">アカウントにログインしてください</p>
          </div>

          {/* ログインフォーム */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    placeholder="パスワードを入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'ログイン中...' : 'ログイン'}</span>
              </button>
            </form>

            {/* リンク */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <button
                  onClick={() => onNavigate('password-reset')}
                  className="text-navy-600 hover:text-navy-800 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  パスワードを忘れた方
                </button>
              </div>
              
              <div className="border-t border-white/30 pt-4 text-center">
                <p className="text-slate-600 text-sm mb-3">アカウントをお持ちでない方</p>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>新規登録</span>
                </button>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              © 2024 賢者の精算. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;