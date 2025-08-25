import React, { useState } from 'react';
import { Calendar, MapPin, Upload, Calculator, Save } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface BusinessTripApplicationProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense') => void;
}

function BusinessTripApplication({ onNavigate }: BusinessTripApplicationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    startDate: '',
    endDate: '',
    destination: '',
    estimatedExpenses: {
      dailyAllowance: 0,
      transportation: 0,
      accommodation: 0,
      total: 0
    },
    attachments: [] as File[]
  });

  const [dragActive, setDragActive] = useState(false);

  // 出張日当の自動計算（1日あたり5,000円と仮定）
  const calculateDailyAllowance = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const dailyRate = 5000; // 1日あたりの日当
      const transportationRate = 2000; // 1日あたりの交通費
      const accommodationRate = 8000; // 1日あたりの宿泊費

      const dailyAllowance = days * dailyRate;
      const transportation = days * transportationRate;
      const accommodation = days > 1 ? (days - 1) * accommodationRate : 0;
      const total = dailyAllowance + transportation + accommodation;

      setFormData(prev => ({
        ...prev,
        estimatedExpenses: {
          dailyAllowance,
          transportation,
          accommodation,
          total
        }
      }));
    }
  };

  React.useEffect(() => {
    calculateDailyAllowance();
  }, [formData.startDate, formData.endDate]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここで申請データを送信
    console.log('出張申請データ:', formData);
    alert('出張申請が送信されました！');
    onNavigate('dashboard');
  };

  const onBack = () => {
    onNavigate('dashboard');
  };

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
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="business-trip" />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="business-trip" />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-8">出張申請</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本情報 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">基本情報</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        出張目的 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.purpose}
                        onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent backdrop-blur-xl"
                        placeholder="出張の目的を入力してください"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          出発日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent backdrop-blur-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          帰着日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent backdrop-blur-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        訪問先 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent backdrop-blur-xl"
                        placeholder="訪問先を入力してください"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 予定経費 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    <Calculator className="w-5 h-5 inline mr-2" />
                    予定経費（自動計算）
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-slate-600 mb-1">出張日当</p>
                      <p className="text-2xl font-bold text-slate-800">¥{formData.estimatedExpenses.dailyAllowance.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-slate-600 mb-1">交通費</p>
                      <p className="text-2xl font-bold text-slate-800">¥{formData.estimatedExpenses.transportation.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-slate-600 mb-1">宿泊費</p>
                      <p className="text-2xl font-bold text-slate-800">¥{formData.estimatedExpenses.accommodation.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-r from-navy-600 to-navy-800 rounded-lg p-4 text-white">
                      <p className="text-sm text-navy-100 mb-1">合計</p>
                      <p className="text-2xl font-bold">¥{formData.estimatedExpenses.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* 写真添付 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    <Upload className="w-5 h-5 inline mr-2" />
                    写真添付
                  </h2>
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-navy-400 bg-navy-50/50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">ファイルをドラッグ&ドロップするか、クリックして選択</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-white/50 hover:bg-white/70 rounded-lg cursor-pointer transition-colors backdrop-blur-sm"
                    >
                      ファイルを選択
                    </label>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-700">添付ファイル:</p>
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/30 rounded-lg p-3 backdrop-blur-sm">
                          <span className="text-sm text-slate-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
    </div>
  );
}

export default BusinessTripApplication;