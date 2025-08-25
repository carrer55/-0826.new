import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, BookOpen, AlertTriangle, FileText, Scale } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LegalGuideProps {
  onNavigate: (view: string) => void;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'law' | 'regulation' | 'tax' | 'guide';
  importance: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

function LegalGuide({ onNavigate }: LegalGuideProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const guideItems: GuideItem[] = [
    {
      id: '1',
      title: '所得税法（出張旅費関連）',
      description: '出張旅費の非課税限度額や適正な支給基準について定めた法令',
      url: 'https://elaws.e-gov.go.jp/document?lawid=340AC0000000033',
      category: 'law',
      importance: 'high',
      lastUpdated: '2024-04-01'
    },
    {
      id: '2',
      title: '法人税法基本通達（旅費交通費）',
      description: '法人の旅費交通費の損金算入要件と適正な支給基準',
      url: 'https://www.nta.go.jp/law/tsutatsu/kihon/hojin/09/09_02_01.htm',
      category: 'tax',
      importance: 'high',
      lastUpdated: '2024-04-01'
    },
    {
      id: '3',
      title: '出張旅費規程作成ガイドライン',
      description: '適正な出張旅費規程の作成方法と注意点',
      url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2508.htm',
      category: 'guide',
      importance: 'high',
      lastUpdated: '2024-03-15'
    },
    {
      id: '4',
      title: '労働基準法（出張時の労働時間）',
      description: '出張時の労働時間の取り扱いと休憩時間の規定',
      url: 'https://elaws.e-gov.go.jp/document?lawid=322AC0000000049',
      category: 'law',
      importance: 'medium',
      lastUpdated: '2024-04-01'
    },
    {
      id: '5',
      title: '消費税法（仕入税額控除）',
      description: '出張費用の消費税仕入税額控除の適用要件',
      url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6451.htm',
      category: 'tax',
      importance: 'medium',
      lastUpdated: '2024-04-01'
    },
    {
      id: '6',
      title: '電子帳簿保存法',
      description: '出張費用の領収書等の電子保存要件',
      url: 'https://www.nta.go.jp/law/joho-zeikaishaku/sonota/jirei/0021006-031.htm',
      category: 'regulation',
      importance: 'high',
      lastUpdated: '2024-01-01'
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'law': '法令',
      'regulation': '規則',
      'tax': '税務',
      'guide': 'ガイド'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'law': 'text-red-700 bg-red-100',
      'regulation': 'text-blue-700 bg-blue-100',
      'tax': 'text-emerald-700 bg-emerald-100',
      'guide': 'text-amber-700 bg-amber-100'
    };
    return colors[category as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  };

  const getImportanceColor = (importance: string) => {
    const colors = {
      'high': 'text-red-600',
      'medium': 'text-amber-600',
      'low': 'text-slate-600'
    };
    return colors[importance as keyof typeof colors] || 'text-slate-600';
  };

  const getImportanceLabel = (importance: string) => {
    const labels = {
      'high': '重要',
      'medium': '中',
      'low': '低'
    };
    return labels[importance as keyof typeof labels] || importance;
  };

  const filteredItems = guideItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="legal-guide" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="legal-guide" />
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
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">法令・規程ガイド</h1>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="backdrop-blur-xl bg-amber-50/50 rounded-xl p-6 border border-amber-200/50 shadow-xl mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">重要な注意事項</h3>
                    <ul className="text-amber-700 text-sm space-y-1">
                      <li>• 法令は随時改正される可能性があります。最新の情報は各リンク先でご確認ください。</li>
                      <li>• 具体的な適用については、税理士等の専門家にご相談することをお勧めします。</li>
                      <li>• 当システムは情報提供を目的としており、法的助言を行うものではありません。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* カテゴリフィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30 shadow-xl mb-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-navy-600 text-white'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    すべて
                  </button>
                  {['law', 'regulation', 'tax', 'guide'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-navy-600 text-white'
                          : 'bg-white/50 text-slate-700 hover:bg-white/70'
                      }`}
                    >
                      {getCategoryLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

              {/* ガイド一覧 */}
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl hover:bg-white/30 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {getCategoryLabel(item.category)}
                          </span>
                          <span className={`text-xs font-medium ${getImportanceColor(item.importance)}`}>
                            {getImportanceLabel(item.importance)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{item.description}</p>
                        <p className="text-slate-500 text-xs">
                          最終更新: {new Date(item.lastUpdated).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200 ml-4"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>開く</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* フッター情報 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mt-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Scale className="w-6 h-6 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">免責事項</h3>
                </div>
                <div className="text-slate-600 text-sm space-y-2">
                  <p>本ガイドで提供される情報は、一般的な参考情報として提供されており、個別の法的助言を構成するものではありません。</p>
                  <p>具体的な法的問題については、必ず専門家（税理士、弁護士等）にご相談ください。</p>
                  <p>当社は、本情報の正確性、完全性、適時性について保証するものではなく、本情報の利用により生じた損害について責任を負いません。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalGuide;