import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  HeartHandshake, 
  PlusCircle, 
  UserCheck, 
  ShieldCheck, 
  Utensils, 
  Inbox, 
  Bike, 
  Building2, 
  BookOpen, 
  Menu, 
  X, 
  LogOut, 
  Sparkles,
  LogIn,
  UserPlus,
  Home
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

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'donor':
        return { label: 'Food Donor Partner', bg: 'bg-[#8BAF92]/20 text-[#344E41] border-[#8BAF92]' };
      case 'recipient':
        return { label: 'Recipient Organization', bg: 'bg-[#E5EFE5] text-[#344E41] border-[#8BAF92]/40' };
      case 'volunteer':
        return { label: 'Community Volunteer', bg: 'bg-[#C97B63]/15 text-[#C97B63] border-[#C97B63]/40' };
      default:
        return { label: 'Partner', bg: 'bg-stone-200 text-stone-800 border-stone-300' };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8ED]/95 backdrop-blur-md border-b border-[#344E41]/10">
      {/* Top Banner with Tagline & Authentication Status */}
      <div className="bg-[#344E41] text-[#FFF8ED] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8BAF92] animate-pulse"></span>
            <span>MealMitra Community Platform — <strong className="font-semibold text-white">“Share More. Waste Less.”</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/60">Donor:</span>
                  <button
                    onClick={() => onOpenAuth('signin', 'donor')}
                    className="font-semibold text-white hover:text-[#8BAF92] cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                  <span className="text-white/30">•</span>
                  <button
                    onClick={() => onOpenAuth('signup', 'donor')}
                    className="font-semibold text-[#8BAF92] hover:text-white cursor-pointer transition-colors"
                  >
                    Register
                  </button>
                </div>

                <span className="text-white/30">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-amber-200/80">Recipient Shelter:</span>
                  <button
                    onClick={() => onOpenAuth('signin', 'recipient')}
                    className="font-bold text-amber-200 hover:text-white cursor-pointer transition-colors"
                  >
                    Shelter Login
                  </button>
                  <span className="text-white/30">•</span>
                  <button
                    onClick={() => onOpenAuth('signup', 'recipient')}
                    className="font-semibold text-amber-300 hover:text-white cursor-pointer transition-colors"
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-[11px] hidden sm:inline">
                  Signed in as: <strong className="text-white font-medium">{currentUser.displayName || currentUser.organizationName || 'User'}</strong> ({badge.label})
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs bg-white/10 hover:bg-rose-600/90 hover:text-white text-white/90 px-2.5 py-0.5 rounded-full border border-white/20 transition-all flex items-center gap-1 cursor-pointer font-medium"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('welcome')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#344E41]">MealMitra</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E5EFE5] text-[#344E41]">Rescue</span>
              </div>
              <p className="text-[11px] text-[#373A36]/70 font-medium">Surplus Food & Community Network</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'welcome'
                  ? 'bg-[#344E41] text-white shadow-sm'
                  : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
              }`}
            >
              <Home className="w-4 h-4 text-[#8BAF92]" />
              Welcome
            </button>

            {/* Show Dashboard to all users so user profile is visible */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#344E41] text-white shadow-sm'
                  : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
              }`}
            >
              Dashboard
            </button>

            {/* Restrict Food Donors: Do not show Browse Surplus / Available Listings to donors */}
            {currentUser.role !== 'donor' && (
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'browse'
                    ? 'bg-[#344E41] text-white shadow-sm'
                    : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
                }`}
              >
                <Utensils className="w-4 h-4 text-[#8BAF92]" />
                Browse Surplus
              </button>
            )}

            {/* Donor Dedicated Console Navigation */}
            {currentUser.role === 'donor' && (
              <button
                onClick={() => setActiveTab('donor')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'donor' || activeTab === 'my-listings'
                    ? 'bg-[#344E41] text-white shadow-sm'
                    : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-[#8BAF92]" />
                Donor Console
              </button>
            )}

            {currentUser.role === 'recipient' && (
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'my-requests'
                    ? 'bg-[#344E41] text-white shadow-sm'
                    : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
                }`}
              >
                <Inbox className="w-4 h-4 text-[#8BAF92]" />
                My Requests & Pickups
              </button>
            )}

            {currentUser.role === 'volunteer' && (
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'volunteer'
                    ? 'bg-[#344E41] text-white shadow-sm'
                    : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
                }`}
              >
                <Bike className="w-4 h-4 text-[#8BAF92]" />
                Volunteer Dispatch
              </button>
            )}

            <button
              onClick={() => setActiveTab('organizations')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'organizations'
                  ? 'bg-[#344E41] text-white shadow-sm'
                  : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#8BAF92]" />
              Organizations
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'safety'
                  ? 'bg-[#344E41] text-white shadow-sm'
                  : 'text-[#373A36] hover:bg-[#E5EFE5]/70 hover:text-[#344E41]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#8BAF92]" />
              Food Safety
            </button>
          </nav>

          {/* Action Button & Auth Trigger */}
          <div className="hidden sm:flex items-center gap-2.5">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin', 'donor')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#344E41] border border-[#344E41]/20 hover:bg-[#E5EFE5] transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Sign in as a restaurant or food donor"
                >
                  <Utensils className="w-3.5 h-3.5 text-[#8BAF92]" />
                  <span>Donor Login</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signin', 'recipient')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#344E41] text-[#FFF8ED] hover:bg-[#283d32] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Sign in as an orphanage, night shelter, or NGO"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-[#8BAF92]" />
                  <span>Recipient Shelter Login</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#344E41]/15 hover:bg-[#E5EFE5]/70 transition-colors cursor-pointer text-left"
                  title="View your Profile & Dashboard"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#344E41] text-[#FFF8ED] text-xs font-bold flex items-center justify-center">
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'MM'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#344E41] max-w-[120px] truncate leading-tight">
                      {currentUser.displayName || 'User'}
                    </span>
                    <span className="text-[10px] text-[#373A36]/70 leading-tight">
                      {badge.label}
                    </span>
                  </div>
                </button>

                {/* Only Food Donors have Post Food button */}
                {isDonor && (
                  <button
                    onClick={onOpenCreateDonation}
                    className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Post Food</span>
                  </button>
                )}

                {/* Recipient has direct Browse Surplus button */}
                {isRecipient && (
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="bg-[#344E41] hover:bg-[#2b4035] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Utensils className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>Browse Surplus</span>
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Sign out of MealMitra"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {isDonor && (
              <button
                onClick={onOpenCreateDonation}
                className="bg-[#8BAF92] text-[#344E41] p-2 rounded-lg text-sm font-medium sm:hidden"
                title="Post Food"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#344E41] hover:bg-[#E5EFE5] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#344E41]/10 bg-[#FFF8ED] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#344E41]/10 mb-2">
            <span className="text-xs text-[#373A36]/70">
              {isAuthenticated ? `Signed in as ${currentUser.displayName}` : 'Guest Visitor'}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <button
            onClick={() => { setActiveTab('welcome'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'welcome' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
          >
            Welcome & Mission
          </button>

          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
          >
            Dashboard & Profile
          </button>

          {/* Browse Surplus for non-donors */}
          {currentUser.role !== 'donor' && (
            <button
              onClick={() => { setActiveTab('browse'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'browse' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              Browse Surplus
            </button>
          )}

          {currentUser.role === 'donor' && (
            <button
              onClick={() => { setActiveTab('donor'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'donor' || activeTab === 'my-listings' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              Food Donor Console
            </button>
          )}

          {currentUser.role === 'recipient' && (
            <button
              onClick={() => { setActiveTab('my-requests'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'my-requests' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              My Requests & Pickups
            </button>
          )}

          {currentUser.role === 'volunteer' && (
            <button
              onClick={() => { setActiveTab('volunteer'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'volunteer' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              Volunteer Dispatch
            </button>
          )}

          {currentUser.role !== 'donor' && (
            <button
              onClick={() => { setActiveTab('organizations'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'organizations' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
            >
              Organizations Directory
            </button>
          )}

          <button
            onClick={() => { setActiveTab('safety'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'safety' ? 'bg-[#344E41] text-white' : 'text-[#373A36]'}`}
          >
            Food Safety & Community Rules
          </button>

          {!isAuthenticated ? (
            <div className="pt-2 space-y-2">
              <div className="p-2 rounded-xl bg-white border border-[#344E41]/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#344E41]">Food Donors:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { onOpenAuth('signin', 'donor'); setMobileMenuOpen(false); }}
                    className="w-full bg-[#E5EFE5] text-[#344E41] font-semibold py-1.5 rounded-lg text-xs"
                  >
                    Donor Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuth('signup', 'donor'); setMobileMenuOpen(false); }}
                    className="w-full bg-[#344E41] text-white font-semibold py-1.5 rounded-lg text-xs"
                  >
                    Donor Register
                  </button>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Recipient Shelters & Orphanages:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { onOpenAuth('signin', 'recipient'); setMobileMenuOpen(false); }}
                    className="w-full bg-white text-amber-900 border border-amber-300 font-semibold py-1.5 rounded-lg text-xs"
                  >
                    Shelter Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuth('signup', 'recipient'); setMobileMenuOpen(false); }}
                    className="w-full bg-amber-900 text-white font-semibold py-1.5 rounded-lg text-xs"
                  >
                    Shelter Register
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}

          {/* Action button in mobile: ONLY donors can post surplus food! */}
          {isDonor && (
            <div className="pt-1">
              <button
                onClick={() => { onOpenCreateDonation(); setMobileMenuOpen(false); }}
                className="w-full bg-[#8BAF92] text-[#344E41] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Post Surplus Food</span>
              </button>
            </div>
          )}

          {/* For recipients, direct Browse Surplus button */}
          {isRecipient && (
            <div className="pt-1">
              <button
                onClick={() => { setActiveTab('browse'); setMobileMenuOpen(false); }}
                className="w-full bg-[#344E41] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-[#8BAF92]" />
                <span>Browse Available Surplus</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
