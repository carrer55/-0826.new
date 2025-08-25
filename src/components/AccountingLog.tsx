import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, RefreshCw, CheckCircle, XCircle, AlertTriangle, Download, Eye } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AccountingLogProps {
  onNavigate: (view: string) => void;
}

interface LogEntry {
  id: string;
  applicationId: string;
  service: string;
  type: 'expense' | 'business-trip';
  amount: number;
  status: 'success' | 'failed' | 'pending';
  sentAt: string;
  errorMessage?: string;
  retryCount: number;
  lastRetry?: string;
}

function AccountingLog({ onNavigate }: AccountingLogProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [logs] = useState<LogEntry[]>([
    {
      id: 'LOG-001',
      applicationId: 'BT-2024-001',
      service: 'freee',
      type: 'business-trip',
      amount: 52500,
      status: 'success',
      sentAt: '2024-07-20T16:30:00Z',
      retryCount: 0
    },
    {
      id: 'LOG-002',
      applicationId: 'EX-2024-001',
      service: 'MoneyForward',
      type: 'expense',
      amount: 12800,
      status: 'failed',
      sentAt: '2024-07-20T14:15:00Z',
      errorMessage: 'API認証エラー: トークンの有効期限が切れています',
      retryCount: 2,
      lastRetry: '2024-07-20T15:45:00Z'
    },
    {
      id: 'LOG-003',
      applicationId: 'BT-2024-002',
      service: '弥生会計',
      type: 'business-trip',
      amount: 35000,
      status: 'pending',
      sentAt: '2024-07-20T13:00:00Z',
      retryCount: 1,
      lastRetry: '2024-07-20T13:30:00Z'
    },
    {
      id: 'LOG-004',
      applicationId: 'EX-2024-002',
      service: 'freee',
      type: 'expense',
      amount: 8500,
      status: 'success',
      sentAt: '2024-07-19T11:20:00Z',
      retryCount: 0
    },
    {
      id: 'LOG-005',
      applicationId: 'BT-2024-003',
      service: 'MoneyForward',
      type: 'business-trip',
      amount: 45000,
      status: 'failed',
      sentAt: '2024-07-18T09:45:00Z',
      errorMessage: 'データ形式エラー: 必須フィールドが不足しています',
      retryCount: 3,
      lastRetry: '2024-07-18T16:20:00Z'
    }
  ]);

  const services = ['freee', 'MoneyForward', '弥生会計'];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'success': '成功',
      'failed': '失敗',
      'pending': '処理中'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'success': 'text-emerald-700 bg-emerald-100',
      'failed': 'text-red-700 bg-red-100',
      'pending': 'text-amber-700 bg-amber-100'
    };
    return colors[status as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const getTypeLabel = (type: string) => {
    return type === 'business-trip' ? '出張申請' : '経費申請';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'all' || log.service === serviceFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.sentAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesService && matchesStatus && matchesDate;
  });

  const handleRetry = (logId: string) => {
    if (confirm('この送信を再試行しますか？')) {
      alert('再送信を開始しました');
    }
  };

  const handleViewError = (log: LogEntry) => {
    onNavigate('accounting-error');
  };

  const handleExportCSV = () => {
    const csvData = filteredLogs.map(log => ({
      'ログID': log.id,
      '申請ID': log.applicationId,
      'サービス': log.service,
      '種別': getTypeLabel(log.type),
      '金額': log.amount,
      'ステータス': getStatusLabel(log.status),
      '送信日時': log.sentAt,
      'エラーメッセージ': log.errorMessage || '',
      '再試行回数': log.retryCount
    }));
    
    console.log('CSV Export:', csvData);
    alert('CSVファイルをダウンロードしました');
  };

  // 統計データの計算
  const stats = {
    total: filteredLogs.length,
    success: filteredLogs.filter(log => log.status === 'success').length,
    failed: filteredLogs.filter(log => log.status === 'failed').length,
    pending: filteredLogs.filter(log => log.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="accounting-log" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="accounting-log" />
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
                    onClick={() => onNavigate('accounting-integration')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">会計送信ログ</h1>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV出力</span>
                </button>
              </div>

              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl text-center">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">総送信数</h3>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}件</p>
                </div>
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl text-center">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">成功</h3>
                  <p className="text-2xl font-bold text-emerald-600">{stats.success}件</p>
                </div>
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl text-center">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">失敗</h3>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}件</p>
                </div>
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl text-center">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">処理中</h3>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}件</p>
                </div>
              </div>

              {/* フィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ログID、申請IDで検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                  </div>
                  
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  >
                    <option value="all">すべてのサービス</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  >
                    <option value="all">すべてのステータス</option>
                    <option value="success">成功</option>
                    <option value="failed">失敗</option>
                    <option value="pending">処理中</option>
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

              {/* ログ一覧 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/30 border-b border-white/30">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">ログID</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">申請ID</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">サービス</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">種別</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">金額</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">ステータス</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">送信日時</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">再試行</th>
                        <th className="text-center py-4 px-6 font-medium text-slate-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-slate-500">
                            条件に一致するログが見つかりません
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                            <td className="py-4 px-6 text-slate-800 font-medium">{log.id}</td>
                            <td className="py-4 px-6 text-slate-800">{log.applicationId}</td>
                            <td className="py-4 px-6 text-slate-700">{log.service}</td>
                            <td className="py-4 px-6 text-slate-700">{getTypeLabel(log.type)}</td>
                            <td className="py-4 px-6 text-slate-800 font-medium">¥{log.amount.toLocaleString()}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(log.status)}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                  {getStatusLabel(log.status)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              {new Date(log.sentAt).toLocaleString('ja-JP')}
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                              {log.retryCount > 0 ? `${log.retryCount}回` : '―'}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center space-x-2">
                                {log.status === 'failed' && (
                                  <>
                                    <button
                                      onClick={() => handleViewError(log)}
                                      className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                                      title="エラー詳細"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRetry(log.id)}
                                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50/30 rounded-lg transition-colors"
                                      title="再送信"
                                    >
                                      <RefreshCw className="w-4 h-4" />
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountingLog;