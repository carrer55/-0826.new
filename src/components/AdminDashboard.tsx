import React, { useState } from 'react';
import { ArrowLeft, Download, Filter, Search, Calendar, Users, TrendingUp, BarChart3 } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

interface AdminApplication {
  id: string;
  type: 'business-trip' | 'expense';
  title: string;
  applicant: string;
  department: string;
  amount: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  approver: string;
}

function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [applications] = useState<AdminApplication[]>([
    {
      id: 'BT-2024-001',
      type: 'business-trip',
      title: '東京出張申請',
      applicant: '田中太郎',
      department: '営業部',
      amount: 52500,
      submittedDate: '2024-07-20',
      status: 'approved',
      approver: '佐藤部長'
    },
    {
      id: 'EX-2024-001',
      type: 'expense',
      title: '交通費・宿泊費精算',
      applicant: '佐藤花子',
      department: '総務部',
      amount: 12800,
      submittedDate: '2024-07-18',
      status: 'pending',
      approver: '田中部長'
    },
    {
      id: 'BT-2024-002',
      type: 'business-trip',
      title: '大阪出張申請',
      applicant: '鈴木次郎',
      department: '開発部',
      amount: 35000,
      submittedDate: '2024-07-15',
      status: 'returned',
      approver: '山田経理'
    },
    {
      id: 'EX-2024-002',
      type: 'expense',
      title: '会議費精算',
      applicant: '高橋美咲',
      department: '企画部',
      amount: 8500,
      submittedDate: '2024-07-10',
      status: 'approved',
      approver: '鈴木取締役'
    },
    {
      id: 'BT-2024-003',
      type: 'business-trip',
      title: '福岡出張申請',
      applicant: '伊藤健一',
      department: '営業部',
      amount: 45000,
      submittedDate: '2024-07-05',
      status: 'rejected',
      approver: '佐藤部長'
    }
  ]);

  const departments = ['営業部', '総務部', '開発部', '企画部', '経理部'];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': '承認待ち',
      'approved': '承認済み',
      'rejected': '否認',
      'returned': '差戻し'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'text-amber-700 bg-amber-100',
      'approved': 'text-emerald-700 bg-emerald-100',
      'rejected': 'text-red-700 bg-red-100',
      'returned': 'text-orange-700 bg-orange-100'
    };
    return colors[status as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const getTypeLabel = (type: string) => {
    return type === 'business-trip' ? '出張申請' : '経費申請';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || app.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const appDate = new Date(app.submittedDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = appDate >= startDate && appDate <= endDate;
    }
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });

  const handleCSVExport = () => {
    const csvData = filteredApplications.map(app => ({
      '申請ID': app.id,
      '種別': getTypeLabel(app.type),
      'タイトル': app.title,
      '申請者': app.applicant,
      '部署': app.department,
      '金額': app.amount,
      '申請日': app.submittedDate,
      'ステータス': getStatusLabel(app.status),
      '承認者': app.approver
    }));
    
    // 実際の実装では、CSVファイルを生成してダウンロード
    console.log('CSV Export:', csvData);
    alert('CSVファイルをダウンロードしました');
  };

  // 統計データの計算
  const stats = {
    totalApplications: filteredApplications.length,
    totalAmount: filteredApplications.reduce((sum, app) => sum + app.amount, 0),
    pendingCount: filteredApplications.filter(app => app.status === 'pending').length,
    approvedCount: filteredApplications.filter(app => app.status === 'approved').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="admin-dashboard" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="admin-dashboard" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">管理者ダッシュボード</h1>
                </div>
                <button
                  onClick={handleCSVExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV出力</span>
                </button>
              </div>

              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">総申請数</h3>
                    <BarChart3 className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalApplications}件</p>
                </div>
                
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">総金額</h3>
                    <TrendingUp className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">¥{stats.totalAmount.toLocaleString()}</p>
                </div>
                
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">承認待ち</h3>
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}件</p>
                </div>
                
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">承認済み</h3>
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.approvedCount}件</p>
                </div>
              </div>

              {/* フィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="申請者、タイトル、IDで検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                  </div>
                  
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  >
                    <option value="all">すべての部署</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  >
                    <option value="all">すべてのステータス</option>
                    <option value="pending">承認待ち</option>
                    <option value="approved">承認済み</option>
                    <option value="rejected">否認</option>
                    <option value="returned">差戻し</option>
                  </select>
                  
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 px-3 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 px-3 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
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
                        <th className="text-left py-4 px-6 font-medium text-slate-700">申請者</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">部署</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">金額</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">申請日</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">ステータス</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">承認者</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-slate-500">
                            条件に一致する申請が見つかりません
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                            <td className="py-4 px-6 text-slate-800 font-medium">{app.id}</td>
                            <td className="py-4 px-6 text-slate-700">{getTypeLabel(app.type)}</td>
                            <td className="py-4 px-6 text-slate-800">{app.title}</td>
                            <td className="py-4 px-6 text-slate-800">{app.applicant}</td>
                            <td className="py-4 px-6 text-slate-700">{app.department}</td>
                            <td className="py-4 px-6 text-slate-800 font-medium">¥{app.amount.toLocaleString()}</td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              {new Date(app.submittedDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-700">{app.approver}</td>
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

export default AdminDashboard;