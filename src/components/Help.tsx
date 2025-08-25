import React, { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronRight, Book, MessageCircle, Mail, Phone } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface HelpProps {
  onNavigate: (view: string) => void;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

function Help({ onNavigate }: HelpProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: '基本操作',
      question: '出張申請はどのように行いますか？',
      answer: '1. ダッシュボードの「出張申請」ボタンをクリック\n2. 出張目的、期間、訪問先を入力\n3. 必要に応じて添付ファイルをアップロード\n4. 「申請を送信」ボタンで提出完了\n\n申請後は承認者に自動で通知が送信されます。'
    },
    {
      id: '2',
      category: '基本操作',
      question: '経費申請の方法を教えてください',
      answer: '1. ダッシュボードの「経費申請」ボタンをクリック\n2. 経費項目（交通費、宿泊費、日当、雑費）を選択\n3. 日付、金額、説明を入力\n4. 領収書をアップロード（OCR機能で自動読み取り）\n5. 「申請を送信」で提出\n\n複数の経費項目をまとめて申請することも可能です。'
    },
    {
      id: '3',
      category: '承認・ワークフロー',
      question: '承認の流れはどうなっていますか？',
      answer: '承認フローは以下の順序で進行します：\n\n1. 申請者が提出\n2. 直属の上司が承認\n3. 部長が承認\n4. 経理部が確認\n5. 最終承認者が承認\n\n各段階で承認者に自動通知が送信され、承認・却下の理由もコメントできます。'
    },
    {
      id: '4',
      category: '出張規程',
      question: '出張規程はどのように設定しますか？',
      answer: '1. サイドバーの「出張規定管理」をクリック\n2. 「新規作成」ボタンで規程作成画面へ\n3. 会社情報、各条文、役職別日当を設定\n4. プレビューで内容を確認\n5. 「規程を保存」で完了\n\nWord/PDF形式での出力も可能です。'
    },
    {
      id: '5',
      category: '出張規程',
      question: '日当の計算方法を教えてください',
      answer: '日当は以下のルールで計算されます：\n\n• 日帰り出張：1日分の日当\n• 1泊2日：2日分の日当 + 1泊分の宿泊日当\n• 2泊3日：3日分の日当 + 2泊分の宿泊日当\n\n役職別に異なる日当額が設定でき、海外出張は国内の1.5倍で自動計算されます。'
    },
    {
      id: '6',
      category: '書類・帳票',
      question: '出張報告書の作成方法は？',
      answer: '1. 書類管理画面で「出張報告書」の作成ボタンをクリック\n2. 出張期間、訪問先、目的を入力\n3. 出張内容・概要を詳しく記載\n4. 成果・結果、経費概要を入力\n5. 必要に応じて関連資料を添付\n6. プレビューで確認後、提出\n\nWord/PDF形式での出力も可能です。'
    },
    {
      id: '7',
      category: '書類・帳票',
      question: '月次・年次レポートの見方を教えてください',
      answer: '月次・年次レポートでは以下の情報を確認できます：\n\n• 期間別の出張回数・金額集計\n• 役職別・部門別の出張傾向\n• 目的別出張分析\n• 予算との比較\n• グラフによる視覚的な分析\n\nCSV形式でのエクスポートも可能です。'
    },
    {
      id: '8',
      category: '設定・管理',
      question: 'ユーザーの招待方法は？',
      answer: '1. マイページ（設定）の「ユーザー管理」タブを選択\n2. 「ユーザー招待」ボタンをクリック\n3. 招待するユーザーのメールアドレスを入力\n4. 役割（管理者/承認者/一般）を選択\n5. 招待メールを送信\n\n招待されたユーザーはメール内のリンクから登録を完了できます。'
    },
    {
      id: '9',
      category: '設定・管理',
      question: '通知設定の変更方法は？',
      answer: 'マイページ（設定）の「通知設定」タブで以下を設定できます：\n\n• メール通知のON/OFF\n• プッシュ通知のON/OFF\n• リマインド時間の設定\n• 承認通知のみ受信する設定\n\n設定変更後は「保存」ボタンを忘れずにクリックしてください。'
    },
    {
      id: '10',
      category: 'トラブルシューティング',
      question: 'ログインできない場合の対処法は？',
      answer: '以下の手順をお試しください：\n\n1. メールアドレス・パスワードの再確認\n2. ブラウザのキャッシュをクリア\n3. 別のブラウザで試行\n4. パスワードリセット機能を使用\n5. それでも解決しない場合はサポートにお問い合わせください\n\n多要素認証を有効にしている場合は、認証コードも必要です。'
    }
  ];

  const categories = ['all', '基本操作', '承認・ワークフロー', '出張規程', '書類・帳票', '設定・管理', 'トラブルシューティング'];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('お問い合わせを送信しました。2営業日以内にご返信いたします。');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="help" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="help" />
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
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">ヘルプ</h1>
                </div>
              </div>

              {/* クイックアクセス */}
              <div className="mb-8">
                <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                  <Book className="w-8 h-8 text-navy-600 mx-auto mb-3" />
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">ユーザーマニュアル</h3>
                        <p className="text-slate-600">基本的な操作方法や機能の使い方を詳しく解説</p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200">
                      <Book className="w-5 h-5" />
                      <span>マニュアルを見る</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 検索・フィルター */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  FAQ検索
                </h2>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="キーワードを入力してFAQを検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'すべてのカテゴリ' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FAQ一覧 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl">
                <div className="p-6 border-b border-white/30">
                  <h2 className="text-xl font-semibold text-slate-800">よくある質問（FAQ）</h2>
                </div>
                <div className="divide-y divide-white/20">
                  {filteredFAQ.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">
                        {searchTerm || selectedCategory !== 'all' 
                          ? '条件に一致するFAQが見つかりません' 
                          : 'FAQがありません'}
                      </p>
                    </div>
                  ) : (
                    filteredFAQ.map((item) => (
                      <div key={item.id} className="p-6">
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="w-full flex items-center justify-between text-left hover:bg-white/10 rounded-lg p-2 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-navy-700 bg-navy-100">
                                {item.category}
                              </span>
                            </div>
                            <h3 className="font-medium text-slate-800">{item.question}</h3>
                          </div>
                          {expandedItems.includes(item.id) ? (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                        {expandedItems.includes(item.id) && (
                          <div className="mt-4 pl-2">
                            <div className="bg-white/30 rounded-lg p-4">
                              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                                {item.answer}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;