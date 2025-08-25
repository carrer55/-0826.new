import React, { useState } from 'react';
import { ArrowLeft, Download, Printer as Print, ZoomIn, ZoomOut, RotateCw, Share2 } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DocumentPreviewProps {
  onNavigate: (view: string) => void;
  documentId: string;
}

function DocumentPreview({ onNavigate, documentId }: DocumentPreviewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('ダウンロード中...');
  };

  const handleShare = () => {
    alert('共有リンクをクリップボードにコピーしました');
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
          
          {/* プレビューツールバー */}
          <div className="h-16 backdrop-blur-xl bg-white/20 border-b border-white/30 flex items-center justify-between px-4 lg:px-6 shadow-xl relative z-10">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('document-management')}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>戻る</span>
              </button>
              <h1 className="text-lg font-semibold text-slate-800">書類プレビュー</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white/30 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-slate-700 min-w-[60px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleShare}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-medium hover:from-slate-700 hover:to-slate-900 transition-all duration-200"
              >
                <Print className="w-4 h-4" />
                <span>印刷</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>ダウンロード</span>
              </button>
            </div>
          </div>
          
          {/* プレビューエリア */}
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div 
                className="backdrop-blur-xl bg-white/90 rounded-xl border border-white/30 shadow-2xl overflow-hidden"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* PDFプレビューのモックアップ */}
                <div className="aspect-[210/297] bg-white p-8 text-slate-800">
                  <div className="h-full flex flex-col">
                    {/* ヘッダー */}
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-bold mb-2">出張報告書</h1>
                      <div className="text-sm text-slate-600">
                        <p>作成日：2024年7月20日</p>
                        <p>報告者：山田太郎</p>
                      </div>
                    </div>
                    
                    {/* 基本情報 */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div>
                        <strong>出張期間：</strong>2024年7月15日 ～ 2024年7月17日
                      </div>
                      <div>
                        <strong>出張先：</strong>東京都港区
                      </div>
                      <div className="col-span-2">
                        <strong>出張目的：</strong>新規クライアント訪問および契約締結
                      </div>
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 space-y-4 text-sm">
                      <div>
                        <h3 className="font-semibold mb-2">出張内容・概要</h3>
                        <div className="bg-slate-50 p-3 rounded">
                          <p>新規クライアントとの初回面談を実施。事業内容の説明と提案書の提示を行った。</p>
                          <p>先方からは前向きな反応を得られ、次回詳細な契約条件について協議することとなった。</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">成果・結果</h3>
                        <div className="bg-slate-50 p-3 rounded">
                          <p>• 新規契約の可能性が高まった</p>
                          <p>• 次回面談の日程を確定（8月5日）</p>
                          <p>• 追加資料の提出を約束</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">経費概要</h3>
                        <div className="bg-slate-50 p-3 rounded">
                          <p>交通費：¥15,000、宿泊費：¥12,000、日当：¥15,000</p>
                          <p>合計：¥42,000</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* フッター */}
                    <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                      <p>この書類は賢者の精算システムにより自動生成されました。</p>
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

export default DocumentPreview;