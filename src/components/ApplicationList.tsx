import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';

interface ApplicationListProps {
  onCreateNew: (type: 'business_trip' | 'expense') => void;
  onViewDetail: (applicationId: string) => void;
}

function ApplicationList({ onCreateNew, onViewDetail }: ApplicationListProps) {
  const { applications, loading, error, deleteApplication } = useApplications();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'returned':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'draft': '下書き',
      'pending': '承認待ち',
      'returned': '差戻し',
      'approved': '承認済み',
      'rejected': '否認'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'text-slate-700 bg-slate-100',
      'pending': 'text-amber-700 bg-amber-100',
      'returned': 'text-orange-700 bg-orange-100',
      'approved': 'text-emerald-700 bg-emerald-100',
      'rejected': 'text-red-700 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const getTypeLabel = (type: string) => {
    return type === 'business_trip' ? '出張申請' : '経費申請';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (applicationId: string) => {
    if (confirm('この申請を削除してもよろしいですか？')) {
      const result = await deleteApplication(applicationId);
      if (!result.success) {
        alert('削除に失敗しました: ' + result.error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
        <span className="ml-3 text-slate-600">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
        <p className="text-red-700">エラー: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">申請一覧</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => onCreateNew('business_trip')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>出張申請</span>
          </button>
          <button
            onClick={() => onCreateNew('expense')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>経費申請</span>
          </button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="申請タイトルやIDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
            >
              <option value="all">すべての種別</option>
              <option value="business_trip">出張申請</option>
              <option value="expense">経費申請</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
            >
              <option value="all">すべてのステータス</option>
              <option value="draft">下書き</option>
              <option value="pending">承認待ち</option>
              <option value="returned">差戻し</option>
              <option value="approved">承認済み</option>
              <option value="rejected">否認</option>
            </select>
          </div>
        </div>
      </div>

      {/* 申請一覧 */}
      <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/30 border-b border-white/30">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-slate-700">申請ID</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700">種別</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700">タイトル</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700">金額</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700">申請日</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700">ステータス</th>
                <th className="text-center py-4 px-6 font-medium text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? '条件に一致する申請が見つかりません' 
                      : '申請がありません'}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                    <td className="py-4 px-6 text-slate-800 font-medium">{app.id.slice(0, 8)}...</td>
                    <td className="py-4 px-6 text-slate-700">{getTypeLabel(app.type)}</td>
                    <td className="py-4 px-6 text-slate-800">{app.title}</td>
                    <td className="py-4 px-6 text-slate-800 font-medium">¥{app.total_amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">
                      {new Date(app.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(app.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onViewDetail(app.id)}
                          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                          title="詳細表示"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(app.status === 'draft' || app.status === 'returned') && (
                          <>
                            <button
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                              title="編集"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50/30 rounded-lg transition-colors"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
  );
}

export default ApplicationList;