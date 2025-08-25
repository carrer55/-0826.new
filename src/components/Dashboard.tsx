import React, { useState } from 'react';
import ApplicationForm from './ApplicationForm';
import ApplicationList from './ApplicationList';
import ApprovalWorkflow from './ApprovalWorkflow';
import NotificationCenter from './NotificationCenter';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MainContent from './MainContent';
import BusinessTripApplication from './BusinessTripApplication';
import ExpenseApplication from './ExpenseApplication';
import ApplicationDetail from './ApplicationDetail';
import TaxSimulation from './TaxSimulation';
import TravelRegulationManagement from './TravelRegulationManagement';
import TravelRegulationCreation from './TravelRegulationCreation';
import TravelRegulationHistory from './TravelRegulationHistory';
import DocumentManagement from './DocumentManagement';
import DocumentCreation from './DocumentCreation';
import DocumentPreview from './DocumentPreview';
import NotificationHistory from './NotificationHistory';
import LegalGuide from './LegalGuide';
import ApprovalReminderSettings from './ApprovalReminderSettings';
import ApprovalLinkExpired from './ApprovalLinkExpired';
import MyPage from './MyPage';
import Help from './Help';
import Support from './Support';
import ApplicationStatusList from './ApplicationStatusList';
import AdminDashboard from './AdminDashboard';
import AccountingIntegration from './AccountingIntegration';
import AccountingLog from './AccountingLog';
import AccountingError from './AccountingError';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationFormType, setApplicationFormType] = useState<'business_trip' | 'expense'>('business_trip');
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [applicationDetail, setApplicationDetail] = useState<{type: 'business-trip' | 'expense', id: string} | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [documentId, setDocumentId] = useState<string>('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateToView = (view: string, param?: string) => {
    setCurrentView(view);
    setShowApplicationForm(false);
    setShowApprovalWorkflow(false);
    setShowNotificationCenter(false);
    if (view === 'document-creation' && param) {
      setDocumentType(param);
    }
    if (view === 'document-preview' && param) {
      setDocumentId(param);
    }
  };

  const handleCreateApplication = (type: 'business_trip' | 'expense') => {
    setApplicationFormType(type);
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setCurrentView('application-status');
  };

  const handleApprovalRequest = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setShowApprovalWorkflow(true);
  };

  const handleApprovalComplete = () => {
    setShowApprovalWorkflow(false);
    setCurrentView('application-status');
  };

  const showApplicationDetail = (type: 'business-trip' | 'expense', id: string) => {
    setApplicationDetail({ type, id });
    setCurrentView('application-detail');
  };

  const renderCurrentView = () => {
    // アプリケーションフォームの表示
    if (showApplicationForm) {
      return (
        <div className="flex h-screen relative">
          <div className="hidden lg:block">
            <Sidebar isOpen={true} onClose={() => {}} onNavigate={navigateToView} currentView={currentView} />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar onMenuClick={toggleSidebar} onNavigate={navigateToView} />
            <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
              <ApplicationForm 
                type={applicationFormType}
                onSuccess={handleApplicationSuccess}
                onCancel={() => setShowApplicationForm(false)}
              />
            </div>
          </div>
        </div>
      );
    }

    // 承認ワークフローの表示
    if (showApprovalWorkflow) {
      return (
        <div className="flex h-screen relative">
          <div className="hidden lg:block">
            <Sidebar isOpen={true} onClose={() => {}} onNavigate={navigateToView} currentView={currentView} />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar onMenuClick={toggleSidebar} onNavigate={navigateToView} />
            <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
              <ApprovalWorkflow 
                applicationId={selectedApplicationId}
                onComplete={handleApprovalComplete}
                onCancel={() => setShowApprovalWorkflow(false)}
              />
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'business-trip':
        setShowApplicationForm(true);
        setApplicationFormType('business_trip');
        return null;
      case 'expense':
        setShowApplicationForm(true);
        setApplicationFormType('expense');
        return null;
      case 'application-status':
        return (
          <div className="flex h-screen relative">
            <div className="hidden lg:block">
              <Sidebar isOpen={true} onClose={() => {}} onNavigate={navigateToView} currentView="application-status" />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar onMenuClick={toggleSidebar} onNavigate={navigateToView} />
              <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10">
                <ApplicationList 
                  onCreateNew={handleCreateApplication}
                  onViewDetail={(id) => setCurrentView('application-detail')}
                />
              </div>
            </div>
          </div>
        );
      case 'tax-simulation':
        return <TaxSimulation onNavigate={navigateToView} />;
      case 'travel-regulation-management':
        return <TravelRegulationManagement onNavigate={navigateToView} />;
      case 'travel-regulation-creation':
        return <TravelRegulationCreation onNavigate={navigateToView} />;
      case 'travel-regulation-history':
        return <TravelRegulationHistory onNavigate={navigateToView} />;
      case 'document-management':
        return <DocumentManagement onNavigate={navigateToView} />;
      case 'document-creation':
        return <DocumentCreation onNavigate={navigateToView} documentType={documentType} />;
      case 'document-preview':
        return <DocumentPreview onNavigate={navigateToView} documentId={documentId} />;
      case 'notification-history':
        return <NotificationHistory onNavigate={navigateToView} />;
      case 'legal-guide':
        return <LegalGuide onNavigate={navigateToView} />;
      case 'approval-reminder-settings':
        return <ApprovalReminderSettings onNavigate={navigateToView} />;
      case 'approval-link-expired':
        return <ApprovalLinkExpired />;
      case 'my-page':
        return <MyPage onNavigate={navigateToView} />;
      case 'help':
        return <Help onNavigate={navigateToView} />;
      case 'support':
        return <Support onNavigate={navigateToView} />;
      case 'application-status':
        return <ApplicationStatusList onNavigate={navigateToView} onShowDetail={showApplicationDetail} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigateToView} />;
      case 'accounting-integration':
        return <AccountingIntegration onNavigate={navigateToView} />;
      case 'accounting-log':
        return <AccountingLog onNavigate={navigateToView} />;
      case 'accounting-error':
        return <AccountingError onNavigate={navigateToView} />;
      case 'application-detail':
        return applicationDetail ? (
          <ApplicationDetail 
            onBack={() => setCurrentView('dashboard')} 
            type={applicationDetail.type}
            applicationId={applicationDetail.id}
          />
        ) : null;
      default:
        return (
          <div className="flex h-screen relative">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar isOpen={true} onClose={() => {}} onNavigate={navigateToView} currentView="dashboard" />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={toggleSidebar}
                />
                <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
                  <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={navigateToView} currentView="dashboard" />
                </div>
              </>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar onMenuClick={toggleSidebar} onNavigate={navigateToView} />
              <MainContent 
                onNavigate={navigateToView} 
                onShowDetail={showApplicationDetail}
                onCreateApplication={handleCreateApplication}
                onShowNotifications={() => setShowNotificationCenter(true)}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      {renderCurrentView()}

      {/* 通知センター */}
      {showNotificationCenter && (
        <NotificationCenter onClose={() => setShowNotificationCenter(false)} />
      )}
    </div>
  );
}

export default Dashboard;