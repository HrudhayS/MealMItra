import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  HeartHandshake, 
  PlusCircle, 
  Utensils, 
  Inbox, 
  Bike, 
  Building2, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck,
  Home,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateDonation: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup', role?: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenCreateDonation,
  onOpenAuth
}) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      setActiveTab('welcome');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isDonor = currentUser.role === 'donor';
  const isRecipient = currentUser.role === 'recipient';

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'donor':
        return 'Food Donor';
      case 'recipient':
        return 'Recipient Shelter';
      case 'volunteer':
        return 'Volunteer';
      default:
        return 'Member';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8ED]/95 backdrop-blur-md border-b border-[#344E41]/10">
      {/* Slim Top Bar with Community Status */}
      <div className="bg-[#344E41] text-[#FFF8ED] text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BAF92] animate-pulse"></span>
            <span>MealMitra — <strong className="font-semibold text-white">“Share More. Waste Less.”</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-white/80 font-normal">
            <span>Verified Non-Profit Food Recovery</span>
            <span className="text-white/30">•</span>
            <span>Good Samaritan Protected</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('welcome')} 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4 text-[#8BAF92]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#344E41]">MealMitra</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E5EFE5] text-[#344E41]">
                  Rescue
                </span>
              </div>
              <span className="text-[10px] text-[#373A36]/60 font-medium hidden md:block leading-none">
                Surplus Food Network
              </span>
            </div>
          </div>

          {/* Navigation Links (Balanced Spacing & Proportions) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'welcome'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#8BAF92]" />
              <span>Welcome</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
              }`}
            >
              <span>Dashboard</span>
            </button>

            {/* Donor Dedicated Console Navigation */}
            {isDonor && (
              <button
                onClick={() => setActiveTab('donor')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'donor'
                    ? 'bg-[#344E41] text-white shadow-xs'
                    : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#8BAF92]" />
                <span>Donor Console</span>
              </button>
            )}

            {/* Recipient / Community Browse Surplus */}
            {currentUser.role !== 'donor' && (
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'browse'
                    ? 'bg-[#344E41] text-white shadow-xs'
                    : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-[#8BAF92]" />
                <span>Browse Surplus</span>
              </button>
            )}

            {currentUser.role === 'recipient' && (
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'my-requests'
                    ? 'bg-[#344E41] text-white shadow-xs'
                    : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-[#8BAF92]" />
                <span>My Requests</span>
              </button>
            )}

            {currentUser.role === 'volunteer' && (
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'volunteer'
                    ? 'bg-[#344E41] text-white shadow-xs'
                    : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-[#8BAF92]" />
                <span>Dispatch</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('safety')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#373A36]/80 hover:bg-[#E5EFE5]/80 hover:text-[#344E41]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#8BAF92]" />
              <span>Food Safety</span>
            </button>
          </nav>

          {/* Right Action & Profile Area */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin', 'donor')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#344E41] border border-[#344E41]/20 hover:bg-[#E5EFE5] transition-colors cursor-pointer"
                >
                  Donor Login
                </button>
                <button
                  onClick={() => onOpenAuth('signin', 'recipient')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#344E41] text-[#FFF8ED] hover:bg-[#283d32] transition-colors cursor-pointer shadow-xs"
                >
                  Shelter Login
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Compact User Chip */}
                <div
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/70 hover:bg-white border border-[#344E41]/12 transition-all cursor-pointer shadow-2xs group"
                  title="Open Dashboard & Profile"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#344E41] text-[#FFF8ED] text-[10px] font-bold flex items-center justify-center">
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'MM'}
                  </div>
                  <span className="text-xs font-semibold text-[#344E41] max-w-[100px] truncate">
                    {currentUser.displayName || 'User'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#E5EFE5] text-[#344E41]">
                    {getRoleLabel()}
                  </span>
                </div>

                {/* Primary Action Button */}
                {isDonor && (
                  <button
                    onClick={onOpenCreateDonation}
                    className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="List surplus food"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Post Food</span>
                  </button>
                )}

                {isRecipient && (
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="bg-[#344E41] hover:bg-[#2b4035] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Utensils className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>Browse Surplus</span>
                  </button>
                )}

                {/* Unobtrusive Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            {isDonor && (
              <button
                onClick={onOpenCreateDonation}
                className="bg-[#8BAF92] text-[#344E41] p-1.5 rounded-lg text-xs font-bold sm:hidden"
                title="Post Food"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#344E41] hover:bg-[#E5EFE5] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#344E41]/10 bg-[#FFF8ED] px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2">
          {isAuthenticated && (
            <div className="flex items-center justify-between pb-2 border-b border-[#344E41]/10 mb-2">
              <span className="text-xs font-semibold text-[#344E41]">
                {currentUser.displayName || 'User'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#E5EFE5] text-[#344E41]">
                {getRoleLabel()}
              </span>
            </div>
          )}

          <button
            onClick={() => { setActiveTab('welcome'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'welcome' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
          >
            Welcome & Mission
          </button>

          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'dashboard' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
          >
            Dashboard
          </button>

          {isDonor && (
            <button
              onClick={() => { setActiveTab('donor'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'donor' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              Food Donor Console
            </button>
          )}

          {currentUser.role !== 'donor' && (
            <button
              onClick={() => { setActiveTab('browse'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'browse' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              Browse Surplus Food
            </button>
          )}

          {currentUser.role === 'recipient' && (
            <button
              onClick={() => { setActiveTab('my-requests'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'my-requests' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              My Requests & Pickups
            </button>
          )}

          <button
            onClick={() => { setActiveTab('safety'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'safety' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
          >
            Food Safety Guidelines
          </button>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#344E41]/10">
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenAuth('signin', 'donor'); setMobileMenuOpen(false); }}
                className="w-full bg-[#E5EFE5] text-[#344E41] font-bold py-2 rounded-lg text-xs text-center"
              >
                Donor Login
              </button>
              <button
                onClick={() => { onOpenAuth('signin', 'recipient'); setMobileMenuOpen(false); }}
                className="w-full bg-[#344E41] text-white font-bold py-2 rounded-lg text-xs text-center"
              >
                Shelter Login
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
