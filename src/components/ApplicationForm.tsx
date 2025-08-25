import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload, Calendar, MapPin, Calculator, FileText, Plus, Trash2 } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';

interface ApplicationFormProps {
  type: 'business_trip' | 'expense';
  onSuccess: () => void;
  onCancel: () => void;
}

// 出張申請のスキーマ
const businessTripSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  purpose: z.string().min(1, '出張目的は必須です'),
  startDate: z.string().min(1, '出発日は必須です'),
  endDate: z.string().min(1, '帰着日は必須です'),
  destination: z.string().min(1, '訪問先は必須です'),
  participants: z.string().optional(),
  estimatedDailyAllowance: z.number().min(0),
  estimatedTransportation: z.number().min(0),
  estimatedAccommodation: z.number().min(0)
});

// 経費申請のスキーマ
const expenseSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  items: z.array(z.object({
    category: z.string().min(1, 'カテゴリは必須です'),
    date: z.string().min(1, '日付は必須です'),
    amount: z.number().min(1, '金額は必須です'),
    description: z.string().optional(),
    receipt: z.any().optional()
  })).min(1, '最低1つの経費項目が必要です')
});

type BusinessTripFormData = z.infer<typeof businessTripSchema>;
type ExpenseFormData = z.infer<typeof expenseSchema>;

function ApplicationForm({ type, onSuccess, onCancel }: ApplicationFormProps) {
  const { createApplication, loading } = useApplications();
  const [expenseItems, setExpenseItems] = useState([
    { id: '1', category: '交通費', date: '', amount: 0, description: '', receipt: null }
  ]);

  const businessTripForm = useForm<BusinessTripFormData>({
    resolver: zodResolver(businessTripSchema),
    defaultValues: {
      estimatedDailyAllowance: 0,
      estimatedTransportation: 0,
      estimatedAccommodation: 0
    }
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      items: expenseItems
    }
  });

  // 出張日当の自動計算
  const calculateEstimates = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return { days: 0, dailyAllowance: 0, transportation: 0, accommodation: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dailyRate = 5000; // 1日あたりの日当
    const transportationRate = 2000; // 1日あたりの交通費
    const accommodationRate = 8000; // 1泊あたりの宿泊費
    
    return {
      days,
      dailyAllowance: days * dailyRate,
      transportation: days * transportationRate,
      accommodation: days > 1 ? (days - 1) * accommodationRate : 0
    };
  };

  const onSubmitBusinessTrip = async (data: BusinessTripFormData) => {
    const estimates = calculateEstimates(data.startDate, data.endDate);
    
    const result = await createApplication('business_trip', data.title, {
      description: data.purpose,
      tripDetails: {
        startDate: data.startDate,
        endDate: data.endDate,
        purpose: data.purpose,
        destination: data.destination,
        participants: data.participants,
        estimatedDailyAllowance: estimates.dailyAllowance,
        estimatedTransportation: estimates.transportation,
        estimatedAccommodation: estimates.accommodation
      }
    });

    if (result.success) {
      onSuccess();
    }
  };

  const onSubmitExpense = async (data: ExpenseFormData) => {
    const result = await createApplication('expense', data.title, {
      description: data.description,
      expenseItems: expenseItems.map(item => ({
        category: item.category,
        date: item.date,
        amount: item.amount,
        description: item.description
      }))
    });

    if (result.success) {
      onSuccess();
    }
  };

  const addExpenseItem = () => {
    const newItem = {
      id: Date.now().toString(),
      category: '交通費',
      date: '',
      amount: 0,
      description: '',
      receipt: null
    };
    setExpenseItems([...expenseItems, newItem]);
  };

  const updateExpenseItem = (id: string, field: string, value: any) => {
    setExpenseItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length > 1) {
      setExpenseItems(items => items.filter(item => item.id !== id));
    }
  };

  const totalExpenseAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  if (type === 'business_trip') {
    const watchedStartDate = businessTripForm.watch('startDate');
    const watchedEndDate = businessTripForm.watch('endDate');
    const estimates = calculateEstimates(watchedStartDate, watchedEndDate);

    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">出張申請</h2>
        
        <form onSubmit={businessTripForm.handleSubmit(onSubmitBusinessTrip)} className="space-y-6">
          {/* 基本情報 */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">基本情報</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  申請タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...businessTripForm.register('title')}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="例：東京出張"
                />
                {businessTripForm.formState.errors.title && (
                  <p className="text-red-600 text-sm mt-1">{businessTripForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  出張目的 <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...businessTripForm.register('purpose')}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="出張の目的を詳しく入力してください"
                  rows={3}
                />
                {businessTripForm.formState.errors.purpose && (
                  <p className="text-red-600 text-sm mt-1">{businessTripForm.formState.errors.purpose.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    出発日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...businessTripForm.register('startDate')}
                    className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  />
                  {businessTripForm.formState.errors.startDate && (
                    <p className="text-red-600 text-sm mt-1">{businessTripForm.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    帰着日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...businessTripForm.register('endDate')}
                    className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  />
                  {businessTripForm.formState.errors.endDate && (
                    <p className="text-red-600 text-sm mt-1">{businessTripForm.formState.errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  訪問先 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...businessTripForm.register('destination')}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="訪問先を入力してください"
                />
                {businessTripForm.formState.errors.destination && (
                  <p className="text-red-600 text-sm mt-1">{businessTripForm.formState.errors.destination.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  参加者・同行者
                </label>
                <input
                  type="text"
                  {...businessTripForm.register('participants')}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="例：田中部長、佐藤課長"
                />
              </div>
            </div>
          </div>

          {/* 予定経費（自動計算） */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              <Calculator className="w-5 h-5 inline mr-2" />
              予定経費（自動計算）
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/30 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">出張日数</p>
                <p className="text-2xl font-bold text-slate-800">{estimates.days}日</p>
              </div>
              <div className="bg-white/30 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">出張日当</p>
                <p className="text-2xl font-bold text-slate-800">¥{estimates.dailyAllowance.toLocaleString()}</p>
              </div>
              <div className="bg-white/30 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">交通費</p>
                <p className="text-2xl font-bold text-slate-800">¥{estimates.transportation.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-r from-navy-600 to-navy-800 rounded-lg p-4 text-white">
                <p className="text-sm text-navy-100 mb-1">合計</p>
                <p className="text-2xl font-bold">¥{(estimates.dailyAllowance + estimates.transportation + estimates.accommodation).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? '送信中...' : '申請を送信'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 経費申請フォーム
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">経費申請</h2>
      
      <form onSubmit={expenseForm.handleSubmit(async (data) => {
        const result = await createApplication('expense', data.title, {
          description: data.description,
          expenseItems: expenseItems
        });
        if (result.success) onSuccess();
      })} className="space-y-6">
        {/* 基本情報 */}
        <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">基本情報</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                申請タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...expenseForm.register('title')}
                className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                placeholder="例：7月度交通費精算"
              />
              {expenseForm.formState.errors.title && (
                <p className="text-red-600 text-sm mt-1">{expenseForm.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                説明
              </label>
              <textarea
                {...expenseForm.register('description')}
                className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                placeholder="経費の詳細説明（任意）"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 経費項目 */}
        <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">経費項目</h3>
            <button
              type="button"
              onClick={addExpenseItem}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>項目を追加</span>
            </button>
          </div>

          <div className="space-y-4">
            {expenseItems.map((item, index) => (
              <div key={item.id} className="bg-white/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      カテゴリ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateExpenseItem(item.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    >
                      <option value="交通費">交通費</option>
                      <option value="宿泊費">宿泊費</option>
                      <option value="日当">日当</option>
                      <option value="会議費">会議費</option>
                      <option value="通信費">通信費</option>
                      <option value="雑費">雑費</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      日付 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateExpenseItem(item.id, 'date', e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      金額（円） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) => updateExpenseItem(item.id, 'amount', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    {expenseItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpenseItem(item.id)}
                        className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    説明
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateExpenseItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    placeholder="経費の詳細を入力してください"
                  />
                </div>

                {/* 領収書アップロード */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600 mb-2">領収書をアップロード</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            updateExpenseItem(item.id, 'receipt', e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id={`receipt-${item.id}`}
                      />
                      <label
                        htmlFor={`receipt-${item.id}`}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 hover:bg-white/70 rounded-lg cursor-pointer transition-colors backdrop-blur-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>ファイルを選択</span>
                      </label>
                    </div>
                  </div>
                  {item.receipt && (
                    <div className="mt-3 p-3 bg-white/30 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {item.receipt.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 合計金額 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-navy-600 to-navy-800 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">合計金額</span>
              <span className="text-2xl font-bold">¥{totalExpenseAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? '送信中...' : '申請を送信'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplicationForm;