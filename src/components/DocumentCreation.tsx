import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, FileText, Calendar, MapPin, Calculator, Upload, Eye } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DocumentCreationProps {
  onNavigate: (view: string) => void;
  documentType: string;
}

interface BusinessReportData {
  title: string;
  period: { start: string; end: string; };
  destination: string;
  purpose: string;
  participants: string;
  summary: string;
  achievements: string;
  expenses: string;
  nextActions: string;
  attachments: File[];
}

interface AllowanceDetailData {
  period: { start: string; end: string; };
  position: string;
  domesticTrips: Array<{
    date: string;
    destination: string;
    days: number;
    allowance: number;
  }>;
  overseasTrips: Array<{
    date: string;
    destination: string;
    days: number;
    allowance: number;
  }>;
}

function DocumentCreation({ onNavigate, documentType }: DocumentCreationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [businessReportData, setBusinessReportData] = useState<BusinessReportData>({
    title: '',
    period: { start: '', end: '' },
    destination: '',
    purpose: '',
    participants: '',
    summary: '',
    achievements: '',
    expenses: '',
    nextActions: '',
    attachments: []
  });

  const [allowanceDetailData, setAllowanceDetailData] = useState<AllowanceDetailData>({
    period: { start: '', end: '' },
    position: '一般職',
    domesticTrips: [],
    overseasTrips: []
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getDocumentTitle = () => {
    const titles = {
      'business-report': '出張報告書作成',
      'allowance-detail': '日当支給明細作成',
      'expense-settlement': '旅費精算書作成',
      'travel-detail': '旅費明細書作成',
      'gps-log': '出張ログ台帳作成',
      'monthly-report': '月次レポート作成',
      'annual-report': '年次レポート作成'
    };
    return titles[documentType as keyof typeof titles] || '書類作成';
  };

  const handleSave = () => {
    alert('書類が保存されました！');
    onNavigate('document-management');
  };

  const handleSubmit = () => {
    alert('書類が提出されました！');
    onNavigate('document-management');
  };

  const handleExport = (format: 'word' | 'pdf') => {
    alert(`${format.toUpperCase()}形式でエクスポート中...`);
  };

  const renderBusinessReportForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">報告書タイトル</label>
          <input
            type="text"
            value={businessReportData.title}
            onChange={(e) => setBusinessReportData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
            placeholder="例：東京出張報告書"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">出張先</label>
          <input
            type="text"
            value={businessReportData.destination}
            onChange={(e) => setBusinessReportData(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
            placeholder="例：東京都港区"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">出張開始日</label>
          <input
            type="date"
            value={businessReportData.period.start}
            onChange={(e) => setBusinessReportData(prev => ({ 
              ...prev, 
              period: { ...prev.period, start: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">出張終了日</label>
          <input
            type="date"
            value={businessReportData.period.end}
            onChange={(e) => setBusinessReportData(prev => ({ 
              ...prev, 
              period: { ...prev.period, end: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">出張目的</label>
        <textarea
          value={businessReportData.purpose}
          onChange={(e) => setBusinessReportData(prev => ({ ...prev, purpose: e.target.value }))}
          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          rows={3}
          placeholder="出張の目的を詳しく記載してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">参加者・同行者</label>
        <input
          type="text"
          value={businessReportData.participants}
          onChange={(e) => setBusinessReportData(prev => ({ ...prev, participants: e.target.value }))}
          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          placeholder="例：田中部長、佐藤課長"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">出張内容・概要</label>
        <textarea
          value={businessReportData.summary}
          onChange={(e) => setBusinessReportData(prev => ({ ...prev, summary: e.target.value }))}
          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          rows={5}
          placeholder="出張で行った業務内容を詳しく記載してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">成果・結果</label>
        <textarea
          value={businessReportData.achievements}
          onChange={(e) => setBusinessReportData(prev => ({ ...prev, achievements: e.target.value }))}
          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          rows={4}
          placeholder="出張で得られた成果や結果を記載してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">経費概要</label>
        <textarea
          value={businessReportData.expenses}
          onChange={(e) => setBusinessReportData(prev => ({ ...prev, expenses: e.target.value }))}
          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          rows={3}
          placeholder="交通費、宿泊費、その他経費の概要を記載してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">今後のアクション・フォローアップ</label>
        <textarea
          value={businessReportData.nextActions}
          onChange={(e) => setBusinessReportData(prev => ({ ...prev, nextActions: e.target.value }))}
          className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          rows={3}
          placeholder="今後必要なアクションやフォローアップ事項を記載してください"
        />
      </div>

      {/* 添付ファイル */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">添付ファイル</label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 mb-2">関連資料をアップロードしてください</p>
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-white/50 hover:bg-white/70 rounded-lg cursor-pointer transition-colors"
          >
            ファイルを選択
          </label>
        </div>
      </div>
    </div>
  );

  const renderAllowanceDetailForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">対象期間（開始）</label>
          <input
            type="date"
            value={allowanceDetailData.period.start}
            onChange={(e) => setAllowanceDetailData(prev => ({ 
              ...prev, 
              period: { ...prev.period, start: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">対象期間（終了）</label>
          <input
            type="date"
            value={allowanceDetailData.period.end}
            onChange={(e) => setAllowanceDetailData(prev => ({ 
              ...prev, 
              period: { ...prev.period, end: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">役職</label>
          <select
            value={allowanceDetailData.position}
            onChange={(e) => setAllowanceDetailData(prev => ({ ...prev, position: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
          >
            <option value="役員">役員</option>
            <option value="管理職">管理職</option>
            <option value="一般職">一般職</option>
          </select>
        </div>
      </div>

      <div className="bg-white/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">自動計算結果</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-600">国内出張日当</p>
            <p className="text-2xl font-bold text-slate-800">¥45,000</p>
            <p className="text-xs text-slate-500">9日間 × ¥5,000</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">海外出張日当</p>
            <p className="text-2xl font-bold text-slate-800">¥30,000</p>
            <p className="text-xs text-slate-500">3日間 × ¥10,000</p>
          </div>
          <div className="text-center bg-gradient-to-r from-navy-600 to-navy-800 rounded-lg p-4 text-white">
            <p className="text-sm text-navy-100">合計支給額</p>
            <p className="text-2xl font-bold">¥75,000</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultForm = () => (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{getDocumentTitle()}</h3>
      <p className="text-slate-600 mb-6">この書類の作成フォームは準備中です。</p>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">以下の機能が利用可能になります：</p>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• 自動データ統合による書類生成</li>
          <li>• Word/PDF形式での出力</li>
          <li>• 承認ワークフロー連携</li>
        </ul>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (documentType) {
      case 'business-report':
        return renderBusinessReportForm();
      case 'allowance-detail':
        return renderAllowanceDetailForm();
      default:
        return renderDefaultForm();
    }
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
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onNavigate('document-management')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">{getDocumentTitle()}</h1>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleExport('word')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Word</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-900 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                {renderForm()}
              </div>

              {(documentType === 'business-report' || documentType === 'allowance-detail') && (
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => onNavigate('document-management')}
                    className="px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    <Save className="w-5 h-5" />
                    <span>下書き保存</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <FileText className="w-5 h-5" />
                    <span>提出</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentCreation;