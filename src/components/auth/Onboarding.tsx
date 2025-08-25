import React, { useState } from 'react';
import { User, Building, Phone, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface OnboardingProps {
  onNavigate: (view: string) => void;
  onComplete: () => void;
}

function Onboarding({ onNavigate, onComplete }: OnboardingProps) {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    position: '',
    phone: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeToTerms) {
      setError('利用規約とプライバシーポリシーに同意してください');
      return;
    }

    if (!user) {
      setError('ユーザー情報が見つかりません');
      return;
    }

    const result = await updateProfile({
      email: user.email || '',
      full_name: formData.fullName,
      company_name: formData.companyName,
      position: formData.position,
      phone: formData.phone,
      department: '',
      role: 'user',
      onboarding_completed: true
    });

    if (result.success) {
      onComplete();
    } else {
      setError(result.error || '登録に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center shadow-2xl">
              <User className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">本登録</h1>
            <p className="text-slate-600">詳細情報を入力して登録を完了してください</p>
          </div>

          {/* 本登録フォーム */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="山田太郎"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  法人名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="株式会社サンプル"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  役職 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  required
                >
                  <option value="">役職を選択してください</option>
                  <option value="代表取締役">代表取締役</option>
                  <option value="取締役">取締役</option>
                  <option value="部長">部長</option>
                  <option value="課長">課長</option>
                  <option value="主任">主任</option>
                  <option value="一般職">一般職</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="090-1234-5678"
                  required
                />
              </div>

              {/* 利用規約同意 */}
              <div className="bg-white/30 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    className="w-5 h-5 text-navy-600 bg-white/50 border-white/40 rounded focus:ring-navy-400 focus:ring-2 mt-0.5"
                    required
                  />
                  <div className="text-sm text-slate-700">
                    <span>
                      <a href="#" className="text-navy-600 hover:text-navy-800 underline">利用規約</a>
                      および
                      <a href="#" className="text-navy-600 hover:text-navy-800 underline">プライバシーポリシー</a>
                      に同意します
                    </span>
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.agreeToTerms}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{loading ? '登録中...' : '登録完了'}</span>
              </button>
            </form>

            {/* 自動遷移の案内 */}
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                登録完了後、5秒でダッシュボードに移動します
              </p>
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

export default Onboarding;