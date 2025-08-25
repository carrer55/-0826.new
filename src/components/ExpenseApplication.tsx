import React, { useState } from 'react';
import { Save, Upload, Camera, FileText } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface ExpenseApplicationProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense') => void;
}

interface ExpenseItem {
  id: string;
  category: string;
  date: string;
  amount: number;
  description: string;
  receipt?: File;
  ocrResult?: {
    store: string;
    date: string;
    amount: number;
  };
}

function ExpenseApplication({ onNavigate }: ExpenseApplicationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: '1',
      category: '交通費',
      date: '',
      amount: 0,
      description: ''
    }
  ]);

  const [showOCRModal, setShowOCRModal] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<string>('');
  const [ocrResult, setOcrResult] = useState({
    store: '',
    date: '',
    amount: 0
  });

  const categories = ['交通費', '宿泊費', '日当', '雑費'];

  const addExpenseItem = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      category: '交通費',
      date: '',
      amount: 0,
      description: ''
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const removeExpense = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const handleReceiptUpload = (expenseId: string, file: File) => {
    updateExpense(expenseId, 'receipt', file);
    setCurrentExpenseId(expenseId);
    // OCR処理をシミュレート
    setTimeout(() => {
      setOcrResult({
        store: 'サンプル店舗',
        date: new Date().toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 10000) + 1000
      });
      setShowOCRModal(true);
    }, 1000);
  };

  const confirmOCRResult = () => {
    updateExpense(currentExpenseId, 'ocrResult', ocrResult);
    updateExpense(currentExpenseId, 'date', ocrResult.date);
    updateExpense(currentExpenseId, 'amount', ocrResult.amount);
    setShowOCRModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('経費申請データ:', expenses);
    alert('経費申請が送信されました！');
    onNavigate('dashboard');
  };

  const onBack = () => {
    onNavigate('dashboard');
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="expense" />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="expense" />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-8">経費申請</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 経費項目 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">経費項目</h2>
                    <button
                      type="button"
                      onClick={addExpenseItem}
                      className="px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
                    >
                      項目を追加
                    </button>
                  </div>

                  <div className="space-y-4">
                    {expenses.map((expense, index) => (
                      <div key={expense.id} className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              種別 <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={expense.category}
                              onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                              className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                              required
                            >
                              {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              日付 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={expense.date}
                              onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                              className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              金額（円） <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={expense.amount || ''}
                              onChange={(e) => updateExpense(expense.id, 'amount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                              placeholder="0"
                              required
                            />
                          </div>
                          <div className="flex items-end">
                            {expenses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExpense(expense.id)}
                                className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              >
                                削除
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
                            value={expense.description}
                            onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
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
                                    handleReceiptUpload(expense.id, e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                                id={`receipt-${expense.id}`}
                              />
                              <label
                                htmlFor={`receipt-${expense.id}`}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 hover:bg-white/70 rounded-lg cursor-pointer transition-colors backdrop-blur-sm"
                              >
                                <Camera className="w-4 h-4" />
                                <span>ファイルを選択</span>
                              </label>
                            </div>
                          </div>
                          {expense.receipt && (
                            <div className="mt-3 p-3 bg-white/30 rounded-lg">
                              <p className="text-sm text-slate-700">
                                <FileText className="w-4 h-4 inline mr-1" />
                                {expense.receipt.name}
                              </p>
                              {expense.ocrResult && (
                                <div className="mt-2 text-xs text-slate-600">
                                  OCR結果: {expense.ocrResult.store} - ¥{expense.ocrResult.amount.toLocaleString()}
                                </div>
                              )}
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
                      <span className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Save className="w-5 h-5" />
                    <span>申請を送信</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OCR結果確認モーダル */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">OCR結果確認</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">店舗名</label>
                <input
                  type="text"
                  value={ocrResult.store}
                  onChange={(e) => setOcrResult(prev => ({ ...prev, store: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">日付</label>
                <input
                  type="date"
                  value={ocrResult.date}
                  onChange={(e) => setOcrResult(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">金額</label>
                <input
                  type="number"
                  value={ocrResult.amount}
                  onChange={(e) => setOcrResult(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOCRModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmOCRResult}
                className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseApplication;