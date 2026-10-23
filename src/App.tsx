import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { BrowseDonations } from './pages/BrowseDonations';
import { DonorWindow } from './pages/DonorWindow';
import { MyListings } from './pages/MyListings';
import { MyRequests } from './pages/MyRequests';
import { VolunteerDispatch } from './pages/VolunteerDispatch';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { FoodSafetyPage } from './pages/FoodSafetyPage';
import { AuthModal } from './components/AuthModal';
import { CreateDonationModal } from './components/CreateDonationModal';
import { RequestModal } from './components/RequestModal';
import { MessagesModal } from './components/MessagesModal';
import { DonationDetailsModal } from './components/DonationDetailsModal';
import { ReportModal } from './components/ReportModal';
import { Donation, DonationRequest, UserRole } from './types';
import { api } from './services/api';
import { HeartHandshake, ShieldCheck, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

function MainLayout() {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('welcome');

  // Welcome & Custom Login Page Flow for Unauthenticated Visitors
  const [authFlowView, setAuthFlowView] = useState<'welcome' | 'login'>('welcome');
  const [authRoleChoice, setAuthRoleChoice] = useState<UserRole>('donor');

  // Auth Modal State (for in-app popups if needed)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('donor');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [targetDonationForRequest, setTargetDonationForRequest] = useState<Donation | null>(null);

  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [activeRequestForMessages, setActiveRequestForMessages] = useState<DonationRequest | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeDonationForDetails, setActiveDonationForDetails] = useState<Donation | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeDonationForReport, setActiveDonationForReport] = useState<Donation | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin', role: UserRole = 'donor') => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Actions
  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      showToast('Please sign in as a food donor to publish surplus food.');
      handleOpenAuth('signin', 'donor');
      return;
    }
    if (currentUser.role !== 'donor') {
      showToast('Integrity Restriction: Recipient organizations cannot enter surplus food details. Only Food Donors can list surplus.');
      return;
    }
    setEditingDonation(null);
    setCreateModalOpen(true);
  };

  const handleEditDonation = (donation: Donation) => {
    if (!isAuthenticated) {
      showToast('Please sign in to edit listings.');
      handleOpenAuth('signin');
      return;
    }
    setEditingDonation(donation);
    setCreateModalOpen(true);
  };

  const handleSubmitDonation = async (data: Partial<Donation>) => {
    if (editingDonation) {
      await api.updateDonation(editingDonation.id, data, currentUser);
      showToast('Surplus food listing updated successfully!');
    } else {
      await api.createDonation(data, currentUser);
      showToast('Surplus food listing published to community!');
    }
  };

  const handleDeleteDonation = async (donation: Donation) => {
    if (!confirm(`Are you sure you want to delete "${donation.foodName}"?`)) return;
    try {
      await api.deleteDonation(donation.id, currentUser);
      showToast('Donation deleted.');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleRequestDonation = (donation: Donation) => {
    if (!isAuthenticated) {
      showToast('Please sign in to request surplus food.');
      handleOpenAuth('signin');
      return;
    }
    if (currentUser.role !== 'recipient') {
      showToast('Food donation requests are reserved for registered Recipient Organizations (orphanages, shelters).');
      return;
    }
    setTargetDonationForRequest(donation);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (data: {
    donationId: string;
    requestedQuantity: number;
    pickupTime: string;
    notes?: string;
    recipientPhone?: string;
  }) => {
    const newReq = await api.createRequest(data, currentUser);
    showToast(`Request submitted for ${newReq.requestedQuantity} ${newReq.unit}! Donor will review.`);
    setActiveTab('my-requests');
  };

  const handleViewDetails = (donation: Donation) => {
    setActiveDonationForDetails(donation);
    setDetailsModalOpen(true);
  };

  const handleOpenMessages = (request: DonationRequest) => {
    setActiveRequestForMessages(request);
    setMessagesModalOpen(true);
  };

  const handleReportDonation = (donation: Donation) => {
    setActiveDonationForReport(donation);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#373A36] flex flex-col justify-between selection:bg-[#8BAF92]/30 selection:text-[#344E41]">
      <div>
        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#344E41] text-[#FFF8ED] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. UNAUTHENTICATED FLOW: Welcome Page loads first, 'Get started' animates to Custom Login Page */}
        {!isAuthenticated ? (
          <div>
            {/* Top Minimal Welcome Gateway Header */}
            <header className="bg-[#344E41] text-[#FFF8ED] text-xs py-2.5 px-4 sm:px-8 border-b border-[#344E41]/30">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div 
                  onClick={() => setAuthFlowView('welcome')}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#8BAF92] text-[#344E41] flex items-center justify-center font-bold">
                    <HeartHandshake className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-sm text-white tracking-tight">MealMitra</span>
                  <span className="text-[11px] text-[#FFF8ED]/70 hidden sm:inline">— “Share More. Waste Less.”</span>
                </div>

                <div className="flex items-center gap-2">
                  {authFlowView === 'welcome' ? (
                    <button
                      onClick={() => setAuthFlowView('login')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <span>Sign In / Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setAuthFlowView('welcome')}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer border border-white/20"
                    >
                      ← Welcome Home
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* Animated Transition Container between Welcome Page and Login Page */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              {authFlowView === 'welcome' ? (
                <div className="transition-all duration-500 ease-in-out animate-in fade-in zoom-in-95">
                  <WelcomePage
                    onGetStarted={() => {
                      setAuthFlowView('login');
                    }}
                    onOpenSignIn={(role) => {
                      setAuthRoleChoice(role || 'donor');
                      setAuthFlowView('login');
                    }}
                    onOpenSignUp={(role) => {
                      setAuthRoleChoice(role || 'donor');
                      setAuthFlowView('login');
                    }}
                    onExploreSurplus={() => {
                      setAuthRoleChoice('recipient');
                      setAuthFlowView('login');
                    }}
                  />
                </div>
              ) : (
                <div className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-4">
                  <LoginPage
                    onBackToWelcome={() => setAuthFlowView('welcome')}
                    initialRole={authRoleChoice}
                    onSuccess={() => {
                      showToast('Authentication successful! Welcome to MealMitra.');
                      setActiveTab('dashboard');
                    }}
                  />
                </div>
              )}
            </main>
          </div>
        ) : (
          /* 2. AUTHENTICATED FLOW: Full platform features with verified session */
          <div>
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenCreateDonation={handleOpenCreate}
              onOpenAuth={handleOpenAuth}
            />

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              {activeTab === 'welcome' && (
                <WelcomePage
                  onGetStarted={() => setActiveTab(currentUser.role === 'donor' ? 'donor' : 'dashboard')}
                  onOpenSignIn={(role) => handleOpenAuth('signin', role || 'donor')}
                  onOpenSignUp={(role) => handleOpenAuth('signup', role || 'donor')}
                  onExploreSurplus={() => setActiveTab(currentUser.role === 'donor' ? 'donor' : 'browse')}
                />
              )}

              {/* DASHBOARD: Integrated user profile and role-tailored view for all users */}
              {activeTab === 'dashboard' && (
                <Dashboard
                  onNavigate={setActiveTab}
                  onRequestDonation={handleRequestDonation}
                  onViewDonationDetails={handleViewDetails}
                  onOpenCreateDonation={handleOpenCreate}
                  onOpenAuth={handleOpenAuth}
                />
              )}

              {/* DEDICATED DONOR WINDOW:
                  For authenticated food donors: surplus posting form, inbound requests, and live CRUD operations */}
              {activeTab === 'donor' && (
                <DonorWindow
                  onOpenMessages={handleOpenMessages}
                  onEditDonation={handleEditDonation}
                  onNavigate={setActiveTab}
                />
              )}

              {/* AVAILABLE LISTINGS / BROWSE: Recipient organizations and community view donor listings */}
              {activeTab === 'browse' && (
                <BrowseDonations
                  onRequestDonation={handleRequestDonation}
                  onViewDonationDetails={handleViewDetails}
                  onEditDonation={handleEditDonation}
                  onDeleteDonation={handleDeleteDonation}
                  onReportDonation={handleReportDonation}
                  onOpenCreateDonation={handleOpenCreate}
                />
              )}

              {currentUser.role !== 'donor' && activeTab === 'my-listings' && (
                <MyListings
                  onOpenCreateDonation={handleOpenCreate}
                  onEditDonation={handleEditDonation}
                  onOpenMessages={handleOpenMessages}
                />
              )}

              {activeTab === 'my-requests' && (
                <MyRequests
                  onOpenMessages={handleOpenMessages}
                  onExploreDonations={() => setActiveTab(currentUser.role === 'donor' ? 'donor' : 'browse')}
                />
              )}

              {activeTab === 'volunteer' && (
                <VolunteerDispatch onOpenMessages={handleOpenMessages} />
              )}

              {currentUser.role !== 'donor' && activeTab === 'organizations' && <OrganizationsPage />}

              {activeTab === 'safety' && <FoodSafetyPage />}
            </main>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#344E41]/10 mt-12 py-8 text-xs text-[#373A36]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#344E41] text-white flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-[#8BAF92]" />
            </div>
            <div>
              <span className="font-bold text-[#344E41]">MealMitra</span> — <em>“Share More. Waste Less.”</em>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button onClick={() => setActiveTab('welcome')} className="hover:text-[#344E41] transition-colors">
              Welcome
            </button>
            <button onClick={() => setActiveTab('safety')} className="hover:text-[#344E41] transition-colors">
              Food Safety Guidelines
            </button>
            <button onClick={() => setActiveTab('organizations')} className="hover:text-[#344E41] transition-colors">
              Verified Shelters
            </button>
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenAuth('signin', 'donor')} 
                  className="text-[#8BAF92] font-semibold hover:text-[#344E41] transition-colors"
                >
                  Donor Sign In
                </button>
                <span>•</span>
                <button 
                  onClick={() => handleOpenAuth('signin', 'recipient')} 
                  className="text-amber-800 font-semibold hover:text-[#344E41] transition-colors"
                >
                  Recipient Shelter Login
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Auth Modal (Food Donor & Recipient Organization Portals) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onSuccess={() => {
          showToast(`Welcome! Successfully authenticated.`);
          setActiveTab('dashboard');
        }}
      />

      {/* Modals */}
      <CreateDonationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSubmitDonation}
        initialData={editingDonation}
      />

      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        donation={targetDonationForRequest}
        onSubmit={handleSubmitRequest}
      />

      <MessagesModal
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        request={activeRequestForMessages}
      />

      <DonationDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        donation={activeDonationForDetails}
        onRequest={handleRequestDonation}
        onReport={handleReportDonation}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        donation={activeDonationForReport}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
