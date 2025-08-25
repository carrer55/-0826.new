import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface ApplicationStatusListProps {
  onNavigate: (view: string) => void;
  onShowDetail: (type: 'business-trip' | 'expense', id: string) => void;
}

interface Application {
  id: string;
  type: 'business-trip' | 'expense';
  title: string;
  amount: number;
  submittedDate: string;
  status: 'draft' | 'pending' | 'returned' | 'approved' | 'rejected';
  approver: string;
  lastUpdated: string;
}

function ApplicationStatusList({ onNavigate, onShowDetail }: ApplicationStatusListProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [applications] = useState<Application[]>([
    {
      id: 'BT-2024-001',
      type: 'business-trip',
      title: '東京出張申請',
      amount: 52500,
      submittedDate: '2024-07-20',
      status: 'approved',
      approver: '佐藤部長',
      lastUpdated: '2024-07-21T16:00:00Z'
    },
    {
      id: 'EX-2024-001',
      type: 'expense',
      title: '交通費・宿泊費精算',
      amount: 12800,
      submittedDate: '2024-07-18',
      status: 'pending',
      approver: '田中部長',
      lastUpdated: '2024-07-19T09:00:00Z'
    },
    {
      id: 'BT-2024-002',
      type: 'business-trip',
      title: '大阪出張申請',
      amount: 35000,
      submittedDate: '2024-07-15',
      status: 'returned',
      approver: '山田経理',
      lastUpdated: '2024-07-16T14:30:00Z'
    },
    {
      id: 'EX-2024-002',
      type: 'expense',
      title: '会議費精算',
      amount: 8500,
      submittedDate: '2024-07-10',
      status: 'draft',
      approver: '',
      lastUpdated: '2024-07-10T11:00:00Z'
    },
    {
      id: 'BT-2024-003',
      type: 'business-trip',
      title: '福岡出張申請',
      amount: 45000,
      submittedDate: '2024-07-05',
      status: 'rejected',
      approver: '鈴木取締役',
      lastUpdated: '2024-07-06T10:15:00Z'
    }
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      'approved': '承認',
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
    return type === 'business-trip' ? '出張申請' : '経費申請';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusClick = (app: Application) => {
    if (app.status !== 'draft') {
      onShowDetail(app.type, app.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="application-status" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="application-status" />
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
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">申請ステータス一覧</h1>
                </div>
              </div>

              {/* 検索・フィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
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
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    >
                      <option value="all">すべてのステータス</option>
                      <option value="draft">下書き</option>
                      <option value="pending">承認待ち</option>
                      <option value="returned">差戻し</option>
                      <option value="approved">承認</option>
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
                        <th className="text-left py-4 px-6 font-medium text-slate-700">承認者</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">ステータス</th>
                        <th className="text-center py-4 px-6 font-medium text-slate-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-500">
                            {searchTerm || statusFilter !== 'all' ? '条件に一致する申請が見つかりません' : '申請がありません'}
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                            <td className="py-4 px-6 text-slate-800 font-medium">{app.id}</td>
                            <td className="py-4 px-6 text-slate-700">{getTypeLabel(app.type)}</td>
                            <td className="py-4 px-6 text-slate-800">{app.title}</td>
                            <td className="py-4 px-6 text-slate-800 font-medium">¥{app.amount.toLocaleString()}</td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              {new Date(app.submittedDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="py-4 px-6 text-slate-700">{app.approver || '未設定'}</td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleStatusClick(app)}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  app.status === 'draft' 
                                    ? getStatusColor(app.status) + ' cursor-default'
                                    : getStatusColor(app.status) + ' hover:opacity-80 cursor-pointer'
                                }`}
                              >
                                {getStatusIcon(app.status)}
                                <span>{getStatusLabel(app.status)}</span>
                              </button>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => onShowDetail(app.type, app.id)}
                                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                  title="詳細表示"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {app.status === 'draft' && (
                                  <button
                                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                    title="編集"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                {(app.status === 'draft' || app.status === 'returned') && (
                                  <button
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50/30 rounded-lg transition-colors"
                                    title="削除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationStatusList;