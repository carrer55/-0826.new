import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Mail, Phone } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface SupportProps {
  onNavigate: (view: string) => void;
}

function Support({ onNavigate }: SupportProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('お問い合わせを送信しました。2営業日以内にご返信いたします。');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
  };

  const handleChatStart = () => {
    alert('チャットサポートを開始します...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="support" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="support" />
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
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">サポート</h1>
                </div>
              </div>

              {/* サポート方法選択 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div 
                  onClick={handleChatStart}
                  className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-xl text-center cursor-pointer hover:bg-white/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <MessageCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">チャットサポート</h3>
                  <p className="text-slate-600 mb-4">リアルタイムでサポートスタッフとチャット</p>
                  <div className="text-sm text-slate-500">
                    <p>• 即座に回答</p>
                    <p>• 平日 9:00-18:00</p>
                    <p>• 画面共有可能</p>
                  </div>
                  <button className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200">
                    チャットを開始
                  </button>
                </div>

                <div 
                  onClick={() => setShowContactForm(true)}
                  className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-xl text-center cursor-pointer hover:bg-white/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">お問い合わせフォーム</h3>
                  <p className="text-slate-600 mb-4">詳細な質問や要望をメールで送信</p>
                  <div className="text-sm text-slate-500">
                    <p>• 詳細な回答</p>
                    <p>• 2営業日以内に返信</p>
                    <p>• ファイル添付可能</p>
                  </div>
                  <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-200">
                    フォームを開く
                  </button>
                </div>
              </div>

              {/* その他のサポート */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">その他のサポート</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">電話サポート</p>
                      <p className="text-sm text-slate-600">03-1234-5678（平日 9:00-18:00）</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">メールサポート</p>
                      <p className="text-sm text-slate-600">support@kenjano-seisan.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* お問い合わせフォームモーダル */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">お問い合わせフォーム</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">お名前</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">件名</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">お問い合わせ内容</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400"
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors"
                >
                  送信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Support;