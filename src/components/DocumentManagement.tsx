import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, FileText, Calendar, MapPin, BarChart3, TrendingUp, Plus, Eye, Edit } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AdvancedSearch from './AdvancedSearch';

interface DocumentManagementProps {
  onNavigate: (view: string, documentType?: string) => void;
}

interface Document {
  id: string;
  title: string;
  type: 'business-report' | 'allowance-detail' | 'expense-settlement' | 'travel-detail' | 'gps-log' | 'monthly-report' | 'annual-report';
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  createdAt: string;
  updatedAt: string;
  size: string;
  thumbnail: string;
  description: string;
}

function DocumentManagement({ onNavigate }: DocumentManagementProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    // サンプルデータの初期化
    const sampleDocuments: Document[] = [
      {
        id: '1',
        title: '東京出張報告書_2024年7月',
        type: 'business-report',
        status: 'submitted',
        createdAt: '2024-07-20T10:00:00Z',
        updatedAt: '2024-07-20T15:30:00Z',
        size: '2.3MB',
        thumbnail: '📋',
        description: '東京クライアント訪問の出張報告書'
      },
      {
        id: '2',
        title: '7月度日当支給明細',
        type: 'allowance-detail',
        status: 'completed',
        createdAt: '2024-07-31T09:00:00Z',
        updatedAt: '2024-07-31T09:00:00Z',
        size: '1.8MB',
        thumbnail: '💰',
        description: '7月度の出張日当支給明細書'
      },
      {
        id: '3',
        title: '7月度旅費精算書',
        type: 'expense-settlement',
        status: 'approved',
        createdAt: '2024-07-31T14:00:00Z',
        updatedAt: '2024-08-01T10:00:00Z',
        size: '3.1MB',
        thumbnail: '🧾',
        description: '7月度の旅費精算書'
      },
      {
        id: '4',
        title: '7月度旅費明細書',
        type: 'travel-detail',
        status: 'completed',
        createdAt: '2024-07-31T16:00:00Z',
        updatedAt: '2024-07-31T16:00:00Z',
        size: '2.7MB',
        thumbnail: '✈️',
        description: '7月度の旅費明細書'
      },
      {
        id: '5',
        title: '出張ログ台帳_2024年7月',
        type: 'gps-log',
        status: 'completed',
        createdAt: '2024-07-31T18:00:00Z',
        updatedAt: '2024-07-31T18:00:00Z',
        size: '5.2MB',
        thumbnail: '📍',
        description: 'GPS位置情報と領収書ハッシュ記録'
      },
      {
        id: '6',
        title: '7月度月次レポート',
        type: 'monthly-report',
        status: 'completed',
        createdAt: '2024-08-01T09:00:00Z',
        updatedAt: '2024-08-01T09:00:00Z',
        size: '4.5MB',
        thumbnail: '📊',
        description: '7月度の出張・経費月次集計レポート'
      },
      {
        id: '7',
        title: '2024年度年次レポート',
        type: 'annual-report',
        status: 'draft',
        createdAt: '2024-08-01T11:00:00Z',
        updatedAt: '2024-08-01T11:00:00Z',
        size: '8.9MB',
        thumbnail: '📈',
        description: '2024年度の年次集計レポート'
      }
    ];
    setDocuments(sampleDocuments);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'business-report': '出張報告書',
      'allowance-detail': '日当支給明細',
      'expense-settlement': '旅費精算書',
      'travel-detail': '旅費明細書',
      'gps-log': '出張ログ台帳',
      'monthly-report': '月次レポート',
      'annual-report': '年次レポート'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'draft': '下書き',
      'submitted': '提出済み',
      'approved': '承認済み',
      'completed': '完了'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'text-slate-700 bg-slate-100',
      'submitted': 'text-amber-700 bg-amber-100',
      'approved': 'text-blue-700 bg-blue-100',
      'completed': 'text-emerald-700 bg-emerald-100'
    };
    return colors[status as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateDocument = (type: string) => {
    onNavigate('document-creation', type);
  };

  const handlePreviewDocument = (documentId: string) => {
    onNavigate('document-preview', documentId);
  };

  const handleDownloadDocument = (documentId: string) => {
    alert(`ダウンロード中: ${documents.find(d => d.id === documentId)?.title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="document-management" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="document-management" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">書類管理</h1>
                <div className="flex space-x-3">
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    >
                      <option value="all">すべての種類</option>
                      <option value="business-report">出張報告書</option>
                      <option value="allowance-detail">日当支給明細</option>
                      <option value="expense-settlement">旅費精算書</option>
                      <option value="travel-detail">旅費明細書</option>
                      <option value="gps-log">出張ログ台帳</option>
                      <option value="monthly-report">月次レポート</option>
                      <option value="annual-report">年次レポート</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 検索・フィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="書類名や説明で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAdvancedSearch(true)}
                      className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
                    >
                      <Filter className="w-4 h-4" />
                      <span>高度検索</span>
                    </button>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    >
                      <option value="all">すべてのステータス</option>
                      <option value="draft">下書き</option>
                      <option value="submitted">提出済み</option>
                      <option value="approved">承認済み</option>
                      <option value="completed">完了</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 新規作成ボタン */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                {[
                  { type: 'business-report', label: '出張報告書', icon: '📋' },
                  { type: 'allowance-detail', label: '日当支給明細', icon: '💰' },
                  { type: 'expense-settlement', label: '旅費精算書', icon: '🧾' },
                  { type: 'travel-detail', label: '旅費明細書', icon: '✈️' },
                  { type: 'gps-log', label: '出張ログ台帳', icon: '📍' },
                  { type: 'monthly-report', label: '月次レポート', icon: '📊' },
                  { type: 'annual-report', label: '年次レポート', icon: '📈' }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleCreateDocument(item.type)}
                    className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-6 h-6 mb-2 text-slate-300" />
                    <span className="text-xs text-center text-slate-100">{item.label}</span>
                    <Plus className="w-4 h-4 mt-1" />
                  </button>
                ))}
              </div>

              {/* 書類一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="backdrop-blur-xl bg-white/10 rounded-lg border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/15 transition-all duration-300 overflow-hidden">
                    {/* サムネイル */}
                    <div className="h-24 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-b border-white/10">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    
                    {/* 書類情報 */}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-800 text-sm leading-tight line-clamp-2">{document.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(document.status)} ml-2 flex-shrink-0`}>
                          {getStatusLabel(document.status)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-2 line-clamp-1">{getTypeLabel(document.type)}</p>
                      
                      <div className="space-y-1 text-xs text-slate-500 mb-3">
                        <div className="flex justify-between">
                          <span>作成日:</span>
                          <span className="text-slate-600">{new Date(document.createdAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>サイズ:</span>
                          <span className="text-slate-600">{document.size}</span>
                        </div>
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="flex justify-between pt-2 border-t border-white/20">
                        <button
                          onClick={() => handlePreviewDocument(document.id)}
                          className="flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-slate-800 hover:bg-white/20 rounded transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">表示</span>
                        </button>
                        <button
                          onClick={() => handleCreateDocument(document.type)}
                          className="flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-slate-800 hover:bg-white/20 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span className="text-xs">編集</span>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(document.id)}
                          className="flex items-center space-x-1 px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100/20 rounded transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span className="text-xs">DL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 text-base font-medium">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                      ? '条件に一致する書類が見つかりません' 
                      : '書類がまだ作成されていません'}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">上部のボタンから新しい書類を作成してください</p>
                </div>
              )}
            </div>

            {/* 高度検索モーダル */}
            {showAdvancedSearch && (
              <AdvancedSearch
                onSearch={(filters) => {
                  console.log('Advanced search filters:', filters);
                  // ここで高度検索の結果を処理
                }}
                onClose={() => setShowAdvancedSearch(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentManagement;