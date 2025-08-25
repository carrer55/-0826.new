import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calculator, TrendingUp, FileText } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface TaxSimulationProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense' | 'tax-simulation') => void;
}

interface SimulationData {
  age: string;
  domesticAllowance: number;
  overseasAllowance: number;
  annualIncome: number;
  domesticTrips: number;
  overseasTrips: number;
  hasAllowanceSystem: boolean;
}

function TaxSimulation({ onNavigate }: TaxSimulationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [data, setData] = useState<SimulationData>({
    age: '',
    domesticAllowance: 0,
    overseasAllowance: 0,
    annualIncome: 0,
    domesticTrips: 0,
    overseasTrips: 0,
    hasAllowanceSystem: false
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTax = () => {
    // 介護保険料フラグ
    const needsCareInsurance = ['40〜49歳', '50〜59歳', '60〜64歳'].includes(data.age);
    
    // A. 現在の手取り金額計算
    const healthInsurance = data.annualIncome * 0.0494;
    const pension = data.annualIncome * 0.0915;
    const employment = data.annualIncome * 0.003;
    const careInsurance = needsCareInsurance ? data.annualIncome * 0.0159 : 0;
    
    // 所得税計算（累進税率）
    const calculateIncomeTax = (income: number) => {
      if (income <= 1950000) return income * 0.05;
      if (income <= 3300000) return 97500 + (income - 1950000) * 0.1;
      if (income <= 6950000) return 232500 + (income - 3300000) * 0.2;
      if (income <= 9000000) return 962500 + (income - 6950000) * 0.23;
      if (income <= 18000000) return 1434000 + (income - 9000000) * 0.33;
      if (income <= 40000000) return 4404000 + (income - 18000000) * 0.4;
      return 13204000 + (income - 40000000) * 0.45;
    };

    const incomeTaxA = calculateIncomeTax(data.annualIncome);
    const residentTaxA = data.annualIncome * 0.1;
    
    const currentTakeHome = data.annualIncome - healthInsurance - pension - employment - careInsurance - incomeTaxA - residentTaxA;

    // B. 出張日当導入後の計算
    const nonTaxableAllowance = (data.domesticAllowance * data.domesticTrips) + (data.overseasAllowance * data.overseasTrips);
    const newTaxableIncome = data.annualIncome - nonTaxableAllowance;
    
    const newHealthInsurance = newTaxableIncome * 0.0494;
    const newPension = newTaxableIncome * 0.0915;
    const newEmployment = newTaxableIncome * 0.003;
    const newCareInsurance = needsCareInsurance ? newTaxableIncome * 0.0159 : 0;
    const newIncomeTax = calculateIncomeTax(newTaxableIncome);
    const newResidentTax = newTaxableIncome * 0.1;
    
    const newTakeHome = newTaxableIncome - newHealthInsurance - newPension - newEmployment - newCareInsurance - newIncomeTax - newResidentTax + nonTaxableAllowance;

    return {
      currentTakeHome,
      newTakeHome,
      difference: newTakeHome - currentTakeHome,
      details: {
        current: {
          income: data.annualIncome,
          healthInsurance,
          pension,
          employment,
          careInsurance,
          incomeTax: incomeTaxA,
          residentTax: residentTaxA,
          nonTaxableAllowance: 0
        },
        new: {
          income: newTaxableIncome,
          healthInsurance: newHealthInsurance,
          pension: newPension,
          employment: newEmployment,
          careInsurance: newCareInsurance,
          incomeTax: newIncomeTax,
          residentTax: newResidentTax,
          nonTaxableAllowance
        }
      }
    };
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const resetSimulation = () => {
    setCurrentStep(1);
    setShowResult(false);
    setData({
      age: '',
      domesticAllowance: 0,
      overseasAllowance: 0,
      annualIncome: 0,
      domesticTrips: 0,
      overseasTrips: 0,
      hasAllowanceSystem: false
    });
  };

  const result = showResult ? calculateTax() : null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Q1. 年齢区分を選択してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['20〜29歳', '30〜39歳', '40〜49歳', '50〜59歳', '60〜64歳', '65歳以上'].map((age) => (
                <button
                  key={age}
                  onClick={() => setData(prev => ({ ...prev, age }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    data.age === age
                      ? 'border-navy-600 bg-navy-50/50 text-navy-800'
                      : 'border-white/40 bg-white/30 hover:bg-white/50 text-slate-700'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Q2. 出張日当額を入力してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  国内日当（円）
                </label>
                <input
                  type="number"
                  value={data.domesticAllowance || ''}
                  onChange={(e) => setData(prev => ({ ...prev, domesticAllowance: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  海外日当（円）
                </label>
                <input
                  type="number"
                  value={data.overseasAllowance || ''}
                  onChange={(e) => setData(prev => ({ ...prev, overseasAllowance: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Q3. 年間所得を入力してください</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                年間所得（円）
              </label>
              <input
                type="number"
                value={data.annualIncome || ''}
                onChange={(e) => setData(prev => ({ ...prev, annualIncome: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                placeholder="10000000"
              />
              {data.annualIncome > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  ¥{data.annualIncome.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Q4. 年間出張回数を入力してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  国内出張（日数）
                </label>
                <input
                  type="number"
                  value={data.domesticTrips || ''}
                  onChange={(e) => setData(prev => ({ ...prev, domesticTrips: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  海外出張（日数）
                </label>
                <input
                  type="number"
                  value={data.overseasTrips || ''}
                  onChange={(e) => setData(prev => ({ ...prev, overseasTrips: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-400 backdrop-blur-xl"
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Q5. 現在、出張日当制度を導入していますか？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setData(prev => ({ ...prev, hasAllowanceSystem: true }))}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  data.hasAllowanceSystem === true
                    ? 'border-navy-600 bg-navy-50/50 text-navy-800'
                    : 'border-white/40 bg-white/30 hover:bg-white/50 text-slate-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-medium">YES</div>
                  <div className="text-sm text-slate-600 mt-1">導入済み</div>
                </div>
              </button>
              <button
                onClick={() => setData(prev => ({ ...prev, hasAllowanceSystem: false }))}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  data.hasAllowanceSystem === false
                    ? 'border-navy-600 bg-navy-50/50 text-navy-800'
                    : 'border-white/40 bg-white/30 hover:bg-white/50 text-slate-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">❌</div>
                  <div className="font-medium">NO</div>
                  <div className="text-sm text-slate-600 mt-1">未導入</div>
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">シミュレーション結果</h2>
          <p className="text-slate-600">出張日当制度導入による節税効果をご確認ください</p>
        </div>

        {/* 比較表示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/30 rounded-xl p-6 border border-white/30 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">現在の手取り金額</h3>
            <p className="text-2xl font-bold text-slate-800">¥{Math.round(result.currentTakeHome).toLocaleString()}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/30 rounded-xl p-6 border border-white/30 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">出張日当導入後</h3>
            <p className="text-2xl font-bold text-emerald-600">¥{Math.round(result.newTakeHome).toLocaleString()}</p>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-xl p-6 border border-white/30 shadow-xl text-center text-white">
            <h3 className="text-lg font-semibold mb-2">年間節税効果</h3>
            <p className="text-3xl font-bold">+¥{Math.round(result.difference).toLocaleString()}</p>
          </div>
        </div>

        {/* 詳細比較表 */}
        <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">詳細比較表</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">項目</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">導入前手取り</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">導入後手取り</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">年間所得</td>
                  <td className="py-3 px-4 text-right text-slate-800">¥{result.details.current.income.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-800">¥{result.details.new.income.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">健康保険料</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.current.healthInsurance).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.new.healthInsurance).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">厚生年金保険料</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.current.pension).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.new.pension).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">雇用保険料</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.current.employment).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.new.employment).toLocaleString()}</td>
                </tr>
                {result.details.current.careInsurance > 0 && (
                  <tr className="border-b border-white/20">
                    <td className="py-3 px-4 text-slate-700">介護保険料</td>
                    <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.current.careInsurance).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.new.careInsurance).toLocaleString()}</td>
                  </tr>
                )}
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">所得税</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.current.incomeTax).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.new.incomeTax).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">住民税</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.current.residentTax).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">-¥{Math.round(result.details.new.residentTax).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-white/20">
                  <td className="py-3 px-4 text-slate-700">非課税出張日当</td>
                  <td className="py-3 px-4 text-right text-slate-500">―</td>
                  <td className="py-3 px-4 text-right text-emerald-600">+¥{Math.round(result.details.new.nonTaxableAllowance).toLocaleString()}</td>
                </tr>
                <tr className="border-t-2 border-navy-600 bg-navy-50/30">
                  <td className="py-4 px-4 font-bold text-slate-800">手取り金額</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-800">¥{Math.round(result.currentTakeHome).toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-600">¥{Math.round(result.newTakeHome).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* フォローアップ */}
        {!data.hasAllowanceSystem && (
          <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/20 to-emerald-700/20 rounded-xl p-6 border border-emerald-300/30 shadow-xl">
            <div className="text-center mb-4">
              <TrendingUp className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-slate-800">出張旅費規程の導入でこの金額差！</h3>
              <p className="text-slate-600 mt-2">Proプランで今すぐ始めよう！</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200">
                <FileText className="w-5 h-5" />
                <span>出張旅費規程を作成する</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={resetSimulation}
            className="px-6 py-3 bg-white/50 hover:bg-white/70 text-slate-700 rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            再計算する
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white rounded-lg font-medium transition-all duration-200"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return data.age !== '';
      case 2: return data.domesticAllowance > 0 || data.overseasAllowance > 0;
      case 3: return data.annualIncome > 0;
      case 4: return data.domesticTrips > 0 || data.overseasTrips > 0;
      case 5: return data.hasAllowanceSystem !== undefined;
      default: return false;
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

        <div className="flex h-screen relative">
          <div className="hidden lg:block">
            <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="tax-simulation" />
          </div>

          {isSidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={toggleSidebar}
              />
              <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
                <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="tax-simulation" />
              </div>
            </>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <TopBar onMenuClick={toggleSidebar} onNavigate={onNavigate} />
            
            <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
              <div className="max-w-6xl mx-auto">
                {renderResult()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="flex h-screen relative">
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} onNavigate={onNavigate} currentView="tax-simulation" />
        </div>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={onNavigate} currentView="tax-simulation" />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={toggleSidebar} />
          
          <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">節税シミュレーション</h1>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calculator className="w-4 h-4" />
                    <span>ステップ {currentStep}/5</span>
                  </div>
                </div>
                
                {/* 進捗ゲージ */}
                <div className="w-full bg-white/30 rounded-full h-2 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-navy-600 to-navy-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 lg:p-8 border border-white/30 shadow-xl mb-6">
                {renderStep()}
              </div>

              {/* ナビゲーションボタン */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? 'bg-white/30 text-slate-400 cursor-not-allowed'
                      : 'bg-white/50 hover:bg-white/70 text-slate-700 backdrop-blur-sm'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>戻る</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepComplete()}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isStepComplete()
                        ? 'bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                        : 'bg-white/30 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>次へ</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepComplete()}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isStepComplete()
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                        : 'bg-white/30 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Calculator className="w-5 h-5" />
                    <span>結果を見る</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxSimulation;