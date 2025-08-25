import React, { useState } from 'react';
import { Search, Filter, Save, Trash2, Calendar, User, FileText, Tag } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
}

interface SearchFilters {
  keyword: string;
  dateRange: { start: string; end: string; };
  applicant: string;
  department: string;
  status: string;
  type: string;
  amountRange: { min: number; max: number; };
  tags: string[];
}

interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    dateRange: { start: '', end: '' },
    applicant: '',
    department: '',
    status: 'all',
    type: 'all',
    amountRange: { min: 0, max: 0 },
    tags: []
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: '今月の出張申請',
      filters: {
        keyword: '',
        dateRange: { start: '2024-07-01', end: '2024-07-31' },
        applicant: '',
        department: '',
        status: 'all',
        type: 'business-trip',
        amountRange: { min: 0, max: 0 },
        tags: []
      },
      createdAt: '2024-07-15T10:00:00Z'
    },
    {
      id: '2',
      name: '承認待ち申請',
      filters: {
        keyword: '',
        dateRange: { start: '', end: '' },
        applicant: '',
        department: '',
        status: 'pending',
        type: 'all',
        amountRange: { min: 0, max: 0 },
        tags: []
      },
      createdAt: '2024-07-10T14:30:00Z'
    }
  ]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      alert('フィルター名を入力してください');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setFilterName('');
    setShowSaveModal(false);
    alert('検索条件を保存しました');
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
  };

  const handleDeleteFilter = (filterId: string) => {
    if (confirm('この検索条件を削除してもよろしいですか？')) {
      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    }
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      dateRange: { start: '', end: '' },
      applicant: '',
      department: '',
      status: 'all',
      type: 'all',
      amountRange: { min: 0, max: 0 },
      tags: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              高度検索
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 検索条件 */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">検索条件</h3>
                
                {/* キーワード検索 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">キーワード</label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                    placeholder="タイトル、説明、申請者名で検索"
                  />
                </div>

                {/* 期間 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">開始日</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">終了日</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                    />
                  </div>
                </div>

                {/* 申請者・部署 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">申請者</label>
                    <input
                      type="text"
                      value={filters.applicant}
                      onChange={(e) => setFilters(prev => ({ ...prev, applicant: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                      placeholder="申請者名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">部署</label>
                    <select
                      value={filters.department}
                      onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                    >
                      <option value="">すべての部署</option>
                      <option value="営業部">営業部</option>
                      <option value="総務部">総務部</option>
                      <option value="開発部">開発部</option>
                      <option value="企画部">企画部</option>
                      <option value="経理部">経理部</option>
                    </select>
                  </div>
                </div>

                {/* ステータス・種別 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ステータス</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                    >
                      <option value="all">すべてのステータス</option>
                      <option value="draft">下書き</option>
                      <option value="pending">承認待ち</option>
                      <option value="approved">承認済み</option>
                      <option value="rejected">否認</option>
                      <option value="returned">差戻し</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">種別</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                    >
                      <option value="all">すべての種別</option>
                      <option value="business-trip">出張申請</option>
                      <option value="expense">経費申請</option>
                    </select>
                  </div>
                </div>

                {/* 金額範囲 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">最小金額</label>
                    <input
                      type="number"
                      value={filters.amountRange.min || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        amountRange: { ...prev.amountRange, min: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">最大金額</label>
                    <input
                      type="number"
                      value={filters.amountRange.max || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        amountRange: { ...prev.amountRange, max: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                      placeholder="上限なし"
                    />
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSearch}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
                >
                  <Search className="w-4 h-4" />
                  <span>検索実行</span>
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>条件保存</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>リセット</span>
                </button>
              </div>
            </div>

            {/* 保存済み条件 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">保存済み検索条件</h3>
              <div className="space-y-3">
                {savedFilters.map((savedFilter) => (
                  <div key={savedFilter.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800">{savedFilter.name}</h4>
                      <button
                        onClick={() => handleDeleteFilter(savedFilter.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      作成日: {new Date(savedFilter.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                    <button
                      onClick={() => handleLoadFilter(savedFilter)}
                      className="w-full px-3 py-2 bg-navy-600 text-white rounded-lg text-sm hover:bg-navy-700 transition-colors"
                    >
                      この条件を読み込み
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 条件保存モーダル */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">検索条件を保存</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">条件名</label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                  placeholder="例：今月の出張申請"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveFilter}
                  className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedSearch;