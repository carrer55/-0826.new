import React, { useState } from 'react';
import { Save, Download, FileText, Calendar, MapPin, Calculator, Plus, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface TravelRegulationCreationProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense' | 'tax-simulation' | 'travel-regulation-management' | 'travel-regulation-creation') => void;
}

interface Position {
  id: string;
  name: string;
  dailyAllowance: number;
  transportationAllowance: number;
  accommodationAllowance: number;
}

interface CompanyInfo {
  name: string;
  address: string;
  representative: string;
  establishedDate: string;
  revision: number;
}

interface RegulationData {
  companyInfo: CompanyInfo;
  
  // 各条文
  article1: string; // 目的
  article2: string; // 適用範囲
  article3: string; // 旅費の種類
  article4: string; // 出張の定義
  article5: string; // 出張の承認
  article6: string; // 旅費の計算方法
  article7: string; // 旅費の支給方法
  article8: string; // 領収書の提出
  article9: string; // 規程の改廃
  article10: string; // 附則
  
  // 設定値
  positions: Position[];
  distanceThreshold: number; // 出張の定義（km）
  isTransportationRealExpense: boolean; // 交通費実費精算かどうか
  isAccommodationRealExpense: boolean; // 宿泊費実費精算かどうか
}

function TravelRegulationCreation({ onNavigate }: TravelRegulationCreationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<RegulationData>({
    companyInfo: {
      name: '株式会社サンプル',
      address: '東京都千代田区丸の内1-1-1',
      representative: '代表取締役 山田太郎',
      establishedDate: new Date().toISOString().split('T')[0],
      revision: 1
    },
    
    article1: '本規程は、従業員の出張に関する旅費の支給基準及び手続きを定め、適正かつ効率的な業務遂行を図ることを目的とする。',
    
    article2: '本規程は、当社の全従業員に適用する。ただし、取締役については別途定める。',
    
    article3: '出張旅費は交通費、日当及び宿泊料の三種とし、その支給基準は別表のとおりとする。ただし、交通費及び宿泊料については実費精算とすることができる。',
    
    article4: '出張とは、業務上の必要により、勤務地を離れて片道50km以上の地域において業務に従事することをいう。',
    
    article5: '従業員が出張を行う場合は、事前に所属長の承認を得なければならない。ただし、緊急の場合は事後承認とすることができる。',
    
    article6: '旅費は、出張期間、出張先、職位等を勘案して算定する。日帰り出張は1日とし、1泊2日は2日と日数を計測する。',
    
    article7: '旅費は、原則として出張終了後に精算により支給する。ただし、必要に応じて概算払いを行うことができる。',
    
    article8: '出張者は、出張終了後速やかに旅費精算書に必要書類を添付して提出しなければならない。',
    
    article9: '本規程の改廃は、取締役会の決議により行う。',
    
    article10: `本規程は、${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}日から施行する。`,
    
    positions: [
      { id: '1', name: '役員', dailyAllowance: 8000, transportationAllowance: 3000, accommodationAllowance: 15000 },
      { id: '2', name: '管理職', dailyAllowance: 6000, transportationAllowance: 2500, accommodationAllowance: 12000 },
      { id: '3', name: '一般職', dailyAllowance: 5000, transportationAllowance: 2000, accommodationAllowance: 10000 }
    ],
    
    distanceThreshold: 50,
    isTransportationRealExpense: false,
    isAccommodationRealExpense: false
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addPosition = () => {
    const newPosition: Position = {
      id: Date.now().toString(),
      name: '新しい役職',
      dailyAllowance: 0,
      transportationAllowance: 0,
      accommodationAllowance: 0
    };
    setData(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition]
    }));
  };

  const updatePosition = (id: string, field: keyof Position, value: any) => {
    setData(prev => ({
      ...prev,
      positions: prev.positions.map(pos => 
        pos.id === id ? { ...pos, [field]: value } : pos
      )
    }));
  };

  const removePosition = (id: string) => {
    if (data.positions.length > 1) {
      setData(prev => ({
        ...prev,
        positions: prev.positions.filter(pos => pos.id !== id)
      }));
    }
  };

  const updateArticle4WithDistance = () => {
    setData(prev => ({
      ...prev,
      article4: `出張とは、業務上の必要により、勤務地を離れて片道${prev.distanceThreshold}km以上の地域において業務に従事することをいう。`
    }));
  };

  const handleSave = () => {
    const savedRegulations = JSON.parse(localStorage.getItem('travelRegulations') || '[]');
    
    // Extract allowances from positions array
    const executivePosition = data.positions.find(p => p.name.includes('役員')) || data.positions[0];
    const managerPosition = data.positions.find(p => p.name.includes('管理職')) || data.positions[1] || data.positions[0];
    const generalPosition = data.positions.find(p => p.name.includes('一般職')) || data.positions[2] || data.positions[0];
    
    const newRegulation = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      version: `v${data.companyInfo.revision}.0`,
      companyName: data.companyInfo.name,
      domesticAllowance: {
        executive: executivePosition.dailyAllowance,
        manager: managerPosition.dailyAllowance,
        general: generalPosition.dailyAllowance
      },
      overseasAllowance: {
        executive: executivePosition.dailyAllowance * 1.5,
        manager: managerPosition.dailyAllowance * 1.5,
        general: generalPosition.dailyAllowance * 1.5
      }
    };
    
    savedRegulations.push(newRegulation);
    localStorage.setItem('travelRegulations', JSON.stringify(savedRegulations));
    
    alert('出張規程が保存されました！');
    onNavigate('travel-regulation-management');
  };

  const generateDocument = (format: 'word' | 'pdf') => {
    alert(`${format.toUpperCase()}ファイルを生成中...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="travel-regulation-creation" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="travel-regulation-creation" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">出張規程作成</h1>
                <div className="flex space-x-3">
                  <button
                    onClick={() => generateDocument('word')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Word生成</span>
                  </button>
                  <button
                    onClick={() => generateDocument('pdf')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-900 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF生成</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* 会社情報 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">会社情報</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">会社名</label>
                      <input
                        type="text"
                        value={data.companyInfo.name}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          companyInfo: { ...prev.companyInfo, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">代表者</label>
                      <input
                        type="text"
                        value={data.companyInfo.representative}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          companyInfo: { ...prev.companyInfo, representative: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">住所</label>
                      <input
                        type="text"
                        value={data.companyInfo.address}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          companyInfo: { ...prev.companyInfo, address: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">制定日</label>
                      <input
                        type="date"
                        value={data.companyInfo.establishedDate}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          companyInfo: { ...prev.companyInfo, establishedDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">改訂版</label>
                      <input
                        type="number"
                        value={data.companyInfo.revision}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          companyInfo: { ...prev.companyInfo, revision: parseInt(e.target.value) || 1 }
                        }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 第1条 目的 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">第1条（目的）</h2>
                  <textarea
                    value={data.article1}
                    onChange={(e) => setData(prev => ({ ...prev, article1: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    rows={3}
                  />
                </div>

                {/* 第2条 適用範囲 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">第2条（適用範囲）</h2>
                  <textarea
                    value={data.article2}
                    onChange={(e) => setData(prev => ({ ...prev, article2: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    rows={2}
                  />
                </div>

                {/* 第3条 旅費の種類 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">第3条（旅費の種類）</h2>
                  <textarea
                    value={data.article3}
                    onChange={(e) => setData(prev => ({ ...prev, article3: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl mb-4"
                    rows={3}
                  />

                {/* 実費精算設定 */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-slate-700 mb-3">実費精算設定</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={data.isTransportationRealExpense}
                          onChange={(e) => setData(prev => ({ ...prev, isTransportationRealExpense: e.target.checked }))}
                          className="w-5 h-5 text-navy-600 bg-white/50 border-white/40 rounded focus:ring-navy-400 focus:ring-2"
                        />
                        <span className="text-slate-700 font-medium">交通費を実費精算とする</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={data.isAccommodationRealExpense}
                          onChange={(e) => setData(prev => ({ ...prev, isAccommodationRealExpense: e.target.checked }))}
                          className="w-5 h-5 text-navy-600 bg-white/50 border-white/40 rounded focus:ring-navy-400 focus:ring-2"
                        />
                        <span className="text-slate-700 font-medium">宿泊料を実費精算とする</span>
                      </label>
                    </div>
                  </div>

                {/* 役職別日当設定 */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-slate-700">役職別日当設定</h3>
                      <button
                        type="button"
                        onClick={addPosition}
                        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span>役職追加</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.positions.map((position) => (
                        <div key={position.id} className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">役職名</label>
                              <input
                                type="text"
                                value={position.name}
                                onChange={(e) => updatePosition(position.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">出張日当（円）</label>
                              <input
                                type="number"
                                value={position.dailyAllowance}
                                onChange={(e) => updatePosition(position.id, 'dailyAllowance', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">交通費日当（円）</label>
                              <input
                                type="number"
                                value={position.transportationAllowance}
                                onChange={(e) => updatePosition(position.id, 'transportationAllowance', parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl ${
                                  data.isTransportationRealExpense 
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' 
                                    : 'bg-white/50 border-white/40 text-slate-700'
                                }`}
                                disabled={data.isTransportationRealExpense}
                                placeholder={data.isTransportationRealExpense ? '実費精算' : '0'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">宿泊日当（円）</label>
                              <input
                                type="number"
                                value={position.accommodationAllowance}
                                onChange={(e) => updatePosition(position.id, 'accommodationAllowance', parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl ${
                                  data.isAccommodationRealExpense 
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' 
                                    : 'bg-white/50 border-white/40 text-slate-700'
                                }`}
                                disabled={data.isAccommodationRealExpense}
                                placeholder={data.isAccommodationRealExpense ? '実費精算' : '0'}
                              />
                            </div>
                            <div>
                              {data.positions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePosition(position.id)}
                                  className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 第4条 出張の定義 */}
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">第4条（出張の定義）</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">出張の距離基準（km）</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={data.distanceThreshold}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setData(prev => ({ ...prev, distanceThreshold: value }));
                        }}
                        onBlur={updateArticle4WithDistance}
                        className="w-32 px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                      <span className="text-slate-700">km以上</span>
                    </div>
                  </div>
                  <textarea
                    value={data.article4}
                    onChange={(e) => setData(prev => ({ ...prev, article4: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    rows={2}
                  />
                </div>

                {/* 第5条〜第10条 */}
                {[
                  { key: 'article5', title: '第5条（出張の承認）' },
                  { key: 'article6', title: '第6条（旅費の計算方法）' },
                  { key: 'article7', title: '第7条（旅費の支給方法）' },
                  { key: 'article8', title: '第8条（領収書の提出）' },
                  { key: 'article9', title: '第9条（規程の改廃）' },
                  { key: 'article10', title: '第10条（附則）' }
                ].map(({ key, title }) => (
                  <div key={key} className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
                    <textarea
                      value={data[key as keyof RegulationData] as string}
                      onChange={(e) => setData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      rows={key === 'article6' ? 3 : 2}
                    />
                  </div>
                ))}

                {/* 保存ボタン */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => onNavigate('travel-regulation-management')}
                    className="px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Save className="w-5 h-5" />
                    <span>規程を保存</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelRegulationCreation;