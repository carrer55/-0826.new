import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, History, Upload, Download, FileText } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface TravelRegulationManagementProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense' | 'tax-simulation' | 'travel-regulation-management' | 'travel-regulation-creation' | 'travel-regulation-history') => void;
}

interface Regulation {
  id: string;
  companyName: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'draft' | 'archived';
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

function TravelRegulationManagement({ onNavigate }: TravelRegulationManagementProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // ローカルストレージから規程データを読み込み
    const savedRegulations = JSON.parse(localStorage.getItem('travelRegulations') || '[]');
    setRegulations(savedRegulations);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredRegulations = regulations.filter(regulation =>
    (regulation.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regulation.version || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('この規程を削除してもよろしいですか？')) {
      const updatedRegulations = regulations.filter(reg => reg.id !== id);
      setRegulations(updatedRegulations);
      localStorage.setItem('travelRegulations', JSON.stringify(updatedRegulations));
    }
  };

  const handleEdit = (id: string) => {
    // 編集機能は規程作成画面で実装
    localStorage.setItem('editingRegulationId', id);
    onNavigate('travel-regulation-creation');
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // PDFアップロード処理（実際の実装では、サーバーサイドでPDF解析を行う）
      const newRegulation: Regulation = {
        id: Date.now().toString(),
        companyName: `アップロード規程_${file.name}`,
        version: 'v1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        domesticAllowance: { executive: 0, manager: 0, general: 0 },
        overseasAllowance: { executive: 0, manager: 0, general: 0 }
      };
      
      const updatedRegulations = [...regulations, newRegulation];
      setRegulations(updatedRegulations);
      localStorage.setItem('travelRegulations', JSON.stringify(updatedRegulations));
      setShowUploadModal(false);
      alert('PDFファイルがアップロードされました。');
    } else {
      alert('PDFファイルを選択してください。');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-700 bg-emerald-100';
      case 'draft':
        return 'text-amber-700 bg-amber-100';
      case 'archived':
        return 'text-slate-700 bg-slate-100';
      default:
        return 'text-slate-700 bg-slate-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '運用中';
      case 'draft':
        return '下書き';
      case 'archived':
        return 'アーカイブ';
      default:
        return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="travel-regulation-management" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="travel-regulation-management" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">出張規定管理</h1>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span>PDFアップロード</span>
                  </button>
                  <button
                    onClick={() => onNavigate('travel-regulation-creation')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-lg font-medium hover:from-navy-800 hover:to-navy-950 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>新規作成</span>
                  </button>
                </div>
              </div>

              {/* 検索バー */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="規程名やバージョンで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  />
                </div>
              </div>

              {/* 規程一覧 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/30 border-b border-white/30">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">会社名</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">バージョン</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">ステータス</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">作成日</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">更新日</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">日当設定</th>
                        <th className="text-center py-4 px-6 font-medium text-slate-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegulations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-500">
                            {searchTerm ? '検索結果が見つかりません' : '規程が登録されていません'}
                          </td>
                        </tr>
                      ) : (
                        filteredRegulations.map((regulation) => (
                          <tr key={regulation.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                            <td className="py-4 px-6 text-slate-800 font-medium">{regulation.companyName}</td>
                            <td className="py-4 px-6 text-slate-700">{regulation.version}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(regulation.status)}`}>
                                {getStatusText(regulation.status)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              {new Date(regulation.createdAt).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              {new Date(regulation.updatedAt).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              <div className="space-y-1">
                                <div>国内: ¥{(regulation.domesticAllowance?.general || 0).toLocaleString()}</div>
                                <div>海外: ¥{(regulation.overseasAllowance?.general || 0).toLocaleString()}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(regulation.id)}
                                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                  title="編集"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onNavigate('travel-regulation-history')}
                                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                  title="履歴"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(regulation.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50/30 rounded-lg transition-colors"
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDFアップロードモーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">PDFファイルをアップロード</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">出張規程のPDFファイルを選択してください</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-block px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                ファイルを選択
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelRegulationManagement;