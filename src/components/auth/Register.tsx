import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, Building, User, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterProps {
  onNavigate: (view: string) => void;
}

// Zodスキーマ定義
const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, '氏名は必須です')
    .max(100, '氏名は100文字以内で入力してください'),
  companyName: z
    .string()
    .min(1, '会社名は必須です')
    .max(200, '会社名は200文字以内で入力してください'),
  position: z
    .string()
    .min(1, '役職は必須です'),
  phone: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[0-9\-\+\(\)\s]+$/, '正しい電話番号を入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z
    .string()
    .min(1, 'パスワード再確認は必須です'),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, '利用規約とプライバシーポリシーに同意してください')
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function Register({ onNavigate }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { signUp, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: RegisterFormData) => {
    // ユーザー登録とプロフィール作成を同時に実行
    const result = await signUp(data.email, data.password, {
      full_name: data.fullName,
      company_name: data.companyName,
      position: data.position,
      phone: data.phone
    });
    
    if (result.success) {
      onNavigate('register-success');
    } else if (result.error?.includes('already') || result.error?.includes('registered')) {
      // 既に登録済みの場合も成功画面に遷移
      onNavigate('register-success');
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          氏名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('fullName')}
          className={`w-full px-4 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
            errors.fullName 
              ? 'border-red-400 focus:ring-red-400' 
              : 'border-white/40 focus:ring-emerald-400'
          }`}
          placeholder="山田太郎"
        />
        {errors.fullName && (
          <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Building className="w-4 h-4 inline mr-1" />
          会社名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('companyName')}
          className={`w-full px-4 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
            errors.companyName 
              ? 'border-red-400 focus:ring-red-400' 
              : 'border-white/40 focus:ring-emerald-400'
          }`}
          placeholder="株式会社サンプル"
        />
        {errors.companyName && (
          <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            役職 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('position')}
            className={`w-full px-4 py-3 bg-white/50 border rounded-lg text-slate-700 focus:outline-none focus:ring-2 backdrop-blur-xl ${
              errors.position 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/40 focus:ring-emerald-400'
            }`}
          >
            <option value="">役職を選択</option>
            <option value="代表取締役">代表取締役</option>
            <option value="取締役">取締役</option>
            <option value="部長">部長</option>
            <option value="課長">課長</option>
            <option value="主任">主任</option>
            <option value="一般職">一般職</option>
            <option value="その他">その他</option>
          </select>
          {errors.position && (
            <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register('phone')}
            className={`w-full px-4 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
              errors.phone 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/40 focus:ring-emerald-400'
            }`}
            placeholder="090-1234-5678"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="email"
            {...register('email')}
            className={`w-full pl-10 pr-4 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
              errors.email 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/40 focus:ring-emerald-400'
            }`}
            placeholder="your@email.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          パスワード <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`w-full pl-10 pr-12 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
              errors.password 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/40 focus:ring-emerald-400'
            }`}
            placeholder="8文字以上のパスワード"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          パスワード再確認 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={`w-full pl-10 pr-12 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
              errors.confirmPassword 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/40 focus:ring-emerald-400'
            }`}
            placeholder="パスワードを再入力"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">利用規約とプライバシーポリシー</h3>
        <div className="max-h-40 overflow-y-auto bg-white/50 rounded-lg p-4 text-sm text-slate-700 mb-4">
          <p className="mb-3"><strong>利用規約（抜粋）</strong></p>
          <p className="mb-2">1. 本サービスは出張・経費管理を目的としたシステムです。</p>
          <p className="mb-2">2. ユーザーは正確な情報を入力する責任があります。</p>
          <p className="mb-2">3. データの機密性とセキュリティを保護します。</p>
          <p className="mb-3"><strong>プライバシーポリシー（抜粋）</strong></p>
          <p className="mb-2">• 個人情報は適切に保護され、第三者に提供されません。</p>
          <p className="mb-2">• データは暗号化されて保存されます。</p>
          <p>• ユーザーはいつでもアカウントを削除できます。</p>
        </div>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="w-5 h-5 text-navy-600 bg-white/50 border-white/40 rounded focus:ring-navy-400 focus:ring-2 mt-0.5"
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
        {errors.agreeToTerms && (
          <p className="text-red-600 text-sm mt-2">{errors.agreeToTerms.message}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="w-full h-24 mx-auto mb-6 flex items-center justify-center">
              <img 
                src="/賢者の精算Logo2_Transparent_NoBuffer copy.png" 
                alt="賢者の精算ロゴ" 
                className="h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">新規ユーザー登録</h1>
            <p className="text-slate-600">ステップ {currentStep}/3</p>
            
            {/* 進捗バー */}
            <div className="w-full bg-white/30 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-navy-600 to-navy-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 登録フォーム */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* ステップコンテンツ */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* ナビゲーションボタン */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span>次へ</span>
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>{loading ? '登録中...' : '登録完了'}</span>
                  </button>
                )}
              </div>
            </form>

            {/* ログインリンク */}
            <div className="mt-6 text-center border-t border-white/30 pt-6">
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center justify-center space-x-2 text-navy-600 hover:text-navy-800 text-sm font-medium transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ログイン画面に戻る</span>
              </button>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs mt-2">
              © 2025 賢者の精算. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;