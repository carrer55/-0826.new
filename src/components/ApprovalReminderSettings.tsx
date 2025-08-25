import React, { useState } from 'react';
import { ArrowLeft, Clock, Bell, Settings, Save, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface ApprovalReminderSettingsProps {
  onNavigate: (view: string) => void;
}

interface ReminderRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerDays: number;
  repeatInterval: number; // 0 = no repeat, 1 = daily, 7 = weekly
  targetRoles: string[];
  notificationMethods: ('email' | 'push')[];
  customMessage: string;
}

function ApprovalReminderSettings({ onNavigate }: ApprovalReminderSettingsProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([
    {
      id: '1',
      name: '承認待ち1週間リマインド',
      enabled: true,
      triggerDays: 7,
      repeatInterval: 0,
      targetRoles: ['部長', '取締役'],
      notificationMethods: ['email', 'push'],
      customMessage: '承認待ちの申請があります。ご確認をお願いいたします。'
    },
    {
      id: '2',
      name: '承認待ち2週間エスカレーション',
      enabled: true,
      triggerDays: 14,
      repeatInterval: 0,
      targetRoles: ['取締役', '管理者'],
      notificationMethods: ['email'],
      customMessage: '長期間承認待ちの申請があります。至急ご対応をお願いいたします。'
    },
    {
      id: '3',
      name: '毎日の承認待ちサマリー',
      enabled: false,
      triggerDays: 1,
      repeatInterval: 1,
      targetRoles: ['部長'],
      notificationMethods: ['email'],
      customMessage: '本日の承認待ち申請の一覧をお送りします。'
    }
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    enabled: true,
    businessHoursOnly: true,
    startTime: '09:00',
    endTime: '18:00',
    excludeWeekends: true,
    excludeHolidays: true
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateReminderRule = (id: string, updates: Partial<ReminderRule>) => {
    setReminderRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const addReminderRule = () => {
    const newRule: ReminderRule = {
      id: Date.now().toString(),
      name: '新しいリマインドルール',
      enabled: false,
      triggerDays: 7,
      repeatInterval: 0,
      targetRoles: ['部長'],
      notificationMethods: ['email'],
      customMessage: ''
    };
    setReminderRules(prev => [...prev, newRule]);
  };

  const deleteReminderRule = (id: string) => {
    if (confirm('このリマインドルールを削除してもよろしいですか？')) {
      setReminderRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  const handleSave = () => {
    // 設定を保存
    localStorage.setItem('approvalReminderRules', JSON.stringify(reminderRules));
    localStorage.setItem('approvalReminderGlobalSettings', JSON.stringify(globalSettings));
    alert('リマインド設定を保存しました');
  };

  const getRepeatIntervalLabel = (interval: number) => {
    switch (interval) {
      case 0: return 'なし';
      case 1: return '毎日';
      case 7: return '毎週';
      default: return `${interval}日ごと`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="approval-reminder-settings" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="approval-reminder-settings" />
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
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">承認リマインド設定</h1>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>設定を保存</span>
                </button>
              </div>

              {/* 全体設定 */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  全体設定
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-800">リマインド機能</h3>
                      <p className="text-sm text-slate-600">自動リマインドの有効/無効</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.enabled}
                        onChange={(e) => setGlobalSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-800">営業時間のみ</h3>
                      <p className="text-sm text-slate-600">営業時間内のみ通知送信</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.businessHoursOnly}
                        onChange={(e) => setGlobalSettings(prev => ({ ...prev, businessHoursOnly: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-800">土日祝日除外</h3>
                      <p className="text-sm text-slate-600">休日は通知を送信しない</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.excludeWeekends}
                        onChange={(e) => setGlobalSettings(prev => ({ ...prev, excludeWeekends: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                </div>

                {globalSettings.businessHoursOnly && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">営業開始時間</label>
                      <input
                        type="time"
                        value={globalSettings.startTime}
                        onChange={(e) => setGlobalSettings(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">営業終了時間</label>
                      <input
                        type="time"
                        value={globalSettings.endTime}
                        onChange={(e) => setGlobalSettings(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* リマインドルール */}
              <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl">
                <div className="p-6 border-b border-white/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      リマインドルール
                    </h2>
                    <button
                      onClick={addReminderRule}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
                    >
                      <Bell className="w-4 h-4" />
                      <span>ルール追加</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-white/20">
                  {reminderRules.map((rule) => (
                    <div key={rule.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateReminderRule(rule.id, { enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                          </label>
                          <input
                            type="text"
                            value={rule.name}
                            onChange={(e) => updateReminderRule(rule.id, { name: e.target.value })}
                            className="text-lg font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-navy-400 rounded px-2"
                          />
                        </div>
                        <button
                          onClick={() => deleteReminderRule(rule.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">トリガー日数</label>
                          <select
                            value={rule.triggerDays}
                            onChange={(e) => updateReminderRule(rule.id, { triggerDays: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                          >
                            <option value={1}>1日後</option>
                            <option value={3}>3日後</option>
                            <option value={7}>1週間後</option>
                            <option value={14}>2週間後</option>
                            <option value={30}>1ヶ月後</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">繰り返し</label>
                          <select
                            value={rule.repeatInterval}
                            onChange={(e) => updateReminderRule(rule.id, { repeatInterval: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                          >
                            <option value={0}>なし</option>
                            <option value={1}>毎日</option>
                            <option value={7}>毎週</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">対象役職</label>
                          <select
                            multiple
                            value={rule.targetRoles}
                            onChange={(e) => updateReminderRule(rule.id, { 
                              targetRoles: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                            className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                          >
                            <option value="部長">部長</option>
                            <option value="取締役">取締役</option>
                            <option value="管理者">管理者</option>
                            <option value="経理">経理</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">通知方法</label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={rule.notificationMethods.includes('email')}
                                onChange={(e) => {
                                  const methods = e.target.checked 
                                    ? [...rule.notificationMethods, 'email']
                                    : rule.notificationMethods.filter(m => m !== 'email');
                                  updateReminderRule(rule.id, { notificationMethods: methods as ('email' | 'push')[] });
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm">メール</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={rule.notificationMethods.includes('push')}
                                onChange={(e) => {
                                  const methods = e.target.checked 
                                    ? [...rule.notificationMethods, 'push']
                                    : rule.notificationMethods.filter(m => m !== 'push');
                                  updateReminderRule(rule.id, { notificationMethods: methods as ('email' | 'push')[] });
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm">プッシュ</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">カスタムメッセージ</label>
                        <textarea
                          value={rule.customMessage}
                          onChange={(e) => updateReminderRule(rule.id, { customMessage: e.target.value })}
                          className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                          rows={2}
                          placeholder="リマインド通知に含めるメッセージ"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalReminderSettings;