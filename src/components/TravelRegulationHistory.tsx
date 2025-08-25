import React, { useState } from 'react';
import { ArrowLeft, Clock, GitBranch, RotateCcw, Eye, Download } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface TravelRegulationHistoryProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense' | 'tax-simulation' | 'travel-regulation-management' | 'travel-regulation-creation' | 'travel-regulation-history') => void;
}

interface HistoryItem {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changes: string[];
  status: 'current' | 'archived';
  domesticAllowance: {
    executive: number;
    manager: number;
    general: number;
  };
  overseasAllowance: {
    executive: number;
    manager: number;
    general: number;
  };
}

function TravelRegulationHistory({ onNavigate }: TravelRegulationHistoryProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // サンプルデータ
  const historyData: HistoryItem[] = [
    {
      id: '1',
      version: 'v3.0',
      createdAt: '2024-07-20T10:00:00Z',
      createdBy: '山田太郎',
      changes: ['海外日当を増額', '宿泊費上限を変更'],
      status: 'current',
      domesticAllowance: { executive: 8000, manager: 6000, general: 5000 },
      overseasAllowance: { executive: 15000, manager: 12000, general: 10000 }
    },
    {
      id: '2',
      version: 'v2.1',
      createdAt: '2024-06-15T14:30:00Z',
      createdBy: '佐藤花子',
      changes: ['交通費規定を明確化', '領収書提出期限を変更'],
      status: 'archived',
      domesticAllowance: { executive: 8000, manager: 6000, general: 5000 },
      overseasAllowance: { executive: 12000, manager: 10000, general: 8000 }
    },
    {
      id: '3',
      version: 'v2.0',
      createdAt: '2024-05-10T09:15:00Z',
      createdBy: '田中次郎',
      changes: ['国内日当を増額', '新しい職位区分を追加'],
      status: 'archived',
      domesticAllowance: { executive: 7000, manager: 5000, general: 4000 },
      overseasAllowance: { executive: 12000, manager: 10000, general: 8000 }
    },
    {
      id: '4',
      version: 'v1.0',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: '鈴木一郎',
      changes: ['初版作成'],
      status: 'archived',
      domesticAllowance: { executive: 7000, manager: 5000, general: 4000 },
      overseasAllowance: { executive: 10000, manager: 8000, general: 6000 }
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleRestore = (versionId: string) => {
    if (confirm('このバージョンを復元してもよろしいですか？新しいバージョンとして保存されます。')) {
      alert('バージョンが復元されました。');
    }
  };

  const getDifferences = () => {
    if (selectedVersions.length !== 2) return null;
    
    const version1 = historyData.find(h => h.id === selectedVersions[0]);
    const version2 = historyData.find(h => h.id === selectedVersions[1]);
    
    if (!version1 || !version2) return null;

    const differences = [];
    
    // 国内日当の差分
    if (version1.domesticAllowance.general !== version2.domesticAllowance.general) {
      differences.push({
        field: '国内日当（一般職）',
        old: version2.domesticAllowance.general,
        new: version1.domesticAllowance.general
      });
    }
    
    // 海外日当の差分
    if (version1.overseasAllowance.general !== version2.overseasAllowance.general) {
      differences.push({
        field: '海外日当（一般職）',
        old: version2.overseasAllowance.general,
        new: version1.overseasAllowance.general
      });
    }

    return { version1, version2, differences };
  };

  const diffData = getDifferences();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="travel-regulation-history" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="travel-regulation-history" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onNavigate('travel-regulation-management')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">出張規程履歴</h1>
                </div>
                {selectedVersions.length === 2 && (
                  <button
                    onClick={() => setSelectedVersions([])}
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
                  >
                    比較をクリア
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* バージョン履歴 */}
                <div className="xl:col-span-2">
                  <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl">
                    <div className="p-6 border-b border-white/30">
                      <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        バージョン履歴
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {selectedVersions.length < 2 ? '2つのバージョンを選択して比較できます' : '選択したバージョンの差分を表示中'}
                      </p>
                    </div>
                    <div className="divide-y divide-white/20">
                      {historyData.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-6 hover:bg-white/20 transition-colors cursor-pointer ${
                            selectedVersions.includes(item.id) ? 'bg-navy-50/30 border-l-4 border-navy-600' : ''
                          }`}
                          onClick={() => handleVersionSelect(item.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  item.status === 'current' 
                                    ? 'text-emerald-700 bg-emerald-100' 
                                    : 'text-slate-700 bg-slate-100'
                                }`}>
                                  {item.version}
                                </span>
                                {item.status === 'current' && (
                                  <span className="text-xs text-emerald-600 font-medium">現在のバージョン</span>
                                )}
                              </div>
                              <p className="text-slate-700 font-medium mb-1">{item.createdBy}</p>
                              <p className="text-slate-600 text-sm mb-3">
                                {new Date(item.createdAt).toLocaleString('ja-JP')}
                              </p>
                              <div className="space-y-1">
                                {item.changes.map((change, index) => (
                                  <div key={index} className="flex items-center text-sm text-slate-600">
                                    <GitBranch className="w-3 h-3 mr-2" />
                                    {change}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-slate-500">
                                <div>
                                  <span className="font-medium">国内日当: </span>
                                  ¥{item.domesticAllowance.general.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">海外日当: </span>
                                  ¥{item.overseasAllowance.general.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                title="プレビュー"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                title="ダウンロード"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {item.status !== 'current' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(item.id);
                                  }}
                                  className="p-2 text-navy-600 hover:text-navy-800 hover:bg-navy-50/30 rounded-lg transition-colors"
                                  title="復元"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 差分表示 */}
                <div>
                  <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl">
                    <div className="p-6 border-b border-white/30">
                      <h2 className="text-xl font-semibold text-slate-800">差分比較</h2>
                    </div>
                    <div className="p-6">
                      {!diffData ? (
                        <div className="text-center text-slate-500 py-8">
                          <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>2つのバージョンを選択してください</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-sm text-slate-600 mb-4">
                            <div className="font-medium">{diffData.version1.version} vs {diffData.version2.version}</div>
                          </div>
                          
                          {diffData.differences.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">変更はありません</p>
                          ) : (
                            <div className="space-y-3">
                              {diffData.differences.map((diff, index) => (
                                <div key={index} className="bg-white/30 rounded-lg p-3">
                                  <div className="font-medium text-slate-700 mb-2">{diff.field}</div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center">
                                      <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-2">-</span>
                                      <span className="text-red-600">¥{diff.old.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs mr-2">+</span>
                                      <span className="text-emerald-600">¥{diff.new.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelRegulationHistory;