import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink, Key, Shield } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AccountingIntegrationProps {
  onNavigate: (view: string) => void;
}

interface ConnectionStatus {
  service: string;
  connected: boolean;
  lastSync: string;
  status: 'active' | 'error' | 'disconnected';
  apiVersion: string;
  permissions: string[];
}

function AccountingIntegration({ onNavigate }: AccountingIntegrationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    {
      service: 'freee',
      connected: true,
      lastSync: '2024-07-20T15:30:00Z',
      status: 'active',
      apiVersion: 'v1.0',
      permissions: ['会計帳簿', '取引先', '品目']
    },
    {
      service: 'MoneyForward',
      connected: false,
      lastSync: '',
      status: 'disconnected',
      apiVersion: 'v2.0',
      permissions: []
    },
    {
      service: '弥生会計',
      connected: true,
      lastSync: '2024-07-19T10:15:00Z',
      status: 'error',
      apiVersion: 'v1.2',
      permissions: ['仕訳', '科目']
    }
  ]);

  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getServiceLogo = (service: string) => {
    const logos = {
      'freee': '🟢',
      'MoneyForward': '🔵',
      '弥生会計': '🟡'
    };
    return logos[service as keyof typeof logos] || '⚪';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'text-emerald-700 bg-emerald-100',
      'error': 'text-red-700 bg-red-100',
      'disconnected': 'text-slate-700 bg-slate-100'
    };
    return colors[status as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'disconnected':
        return <AlertTriangle className="w-4 h-4 text-slate-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const texts = {
      'active': '接続中',
      'error': 'エラー',
      'disconnected': '未接続'
    };
    return texts[status as keyof typeof texts] || '不明';
  };

  const handleConnect = (service: string) => {
    setSelectedService(service);
    setShowOAuthModal(true);
  };

  const handleDisconnect = (service: string) => {
    if (confirm(`${service}との接続を解除してもよろしいですか？`)) {
      setConnections(prev => prev.map(conn => 
        conn.service === service 
          ? { ...conn, connected: false, status: 'disconnected', lastSync: '', permissions: [] }
          : conn
      ));
      alert(`${service}との接続を解除しました`);
    }
  };

  const handleOAuthComplete = () => {
    setConnections(prev => prev.map(conn => 
      conn.service === selectedService 
        ? { 
            ...conn, 
            connected: true, 
            status: 'active', 
            lastSync: new Date().toISOString(),
            permissions: ['会計帳簿', '取引先', '品目']
          }
        : conn
    ));
    setShowOAuthModal(false);
    alert(`${selectedService}との接続が完了しました`);
  };

  const handleTestConnection = (service: string) => {
    alert(`${service}との接続テストを実行中...`);
    setTimeout(() => {
      alert('接続テストが完了しました');
    }, 2000);
  };

  const handleSync = (service: string) => {
    setConnections(prev => prev.map(conn => 
      conn.service === service 
        ? { ...conn, lastSync: new Date().toISOString() }
        : conn
    ));
    alert(`${service}との同期を開始しました`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="accounting-integration" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="accounting-integration" />
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
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">会計連携設定</h1>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onNavigate('accounting-log')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>送信ログ</span>
                  </button>
                </div>
              </div>

              {/* 会計ソフト一覧 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl">
                <div className="p-6 border-b border-white/30">
                  <h2 className="text-xl font-semibold text-slate-800">対応会計ソフト</h2>
                </div>
                <div className="divide-y divide-white/20">
                  {connections.map((connection) => (
                    <div key={connection.service} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{getServiceLogo(connection.service)}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{connection.service}</h3>
                            <p className="text-sm text-slate-600">API Version: {connection.apiVersion}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(connection.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(connection.status)}`}>
                            {getStatusText(connection.status)}
                          </span>
                        </div>
                      </div>

                      {connection.connected && (
                        <div className="mb-4 p-4 bg-white/30 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600 mb-1">最終同期</p>
                              <p className="font-medium text-slate-800">
                                {new Date(connection.lastSync).toLocaleString('ja-JP')}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600 mb-1">権限</p>
                              <div className="flex flex-wrap gap-1">
                                {connection.permissions.map((permission, index) => (
                                  <span key={index} className="px-2 py-1 bg-navy-100 text-navy-700 rounded text-xs">
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {!connection.connected ? (
                          <button
                            onClick={() => handleConnect(connection.service)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>接続</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSync(connection.service)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>同期</span>
                            </button>
                            <button
                              onClick={() => handleTestConnection(connection.service)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
                            >
                              <Shield className="w-4 h-4" />
                              <span>接続テスト</span>
                            </button>
                            <button
                              onClick={() => handleDisconnect(connection.service)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-900 transition-all duration-200"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>切断</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OAuth接続モーダル */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {selectedService}との接続
            </h3>
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-navy-600 mx-auto mb-4" />
              <p className="text-slate-600 mb-6">
                {selectedService}の認証画面に移動します。<br />
                アカウント情報を入力して接続を完了してください。
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleOAuthComplete}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                >
                  認証画面へ移動
                </button>
                <button
                  onClick={() => setShowOAuthModal(false)}
                  className="w-full px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountingIntegration;