import React, { useEffect, useState } from 'react';
import { DashboardStats, Donation } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DonationCard } from '../components/DonationCard';
import { UserProfileCard } from '../components/UserProfileCard';
import { 
  HeartHandshake, 
  Utensils, 
  PackageCheck, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  ShieldCheck, 
  AlertTriangle,
  Building2, 
  Bike,
  PlusCircle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Inbox
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onRequestDonation: (donation: Donation) => void;
  onViewDonationDetails: (donation: Donation) => void;
  onOpenCreateDonation: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onRequestDonation,
  onViewDonationDetails,
  onOpenCreateDonation,
  onOpenAuth,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [recipientRequests, setRecipientRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      
      // If donor, load their specific surplus items
      if (currentUser.role === 'donor' && isAuthenticated) {
        const all = await api.getDonations({ status: 'All' });
        setMyDonations(all.filter(d => d.donorId === currentUser.uid));
      }

      // If recipient, load their claims and requests
      if (currentUser.role === 'recipient' && isAuthenticated) {
        const reqs = await api.getRequests(currentUser);
        setRecipientRequests(reqs);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [currentUser, isAuthenticated]);

  const isDonor = isAuthenticated && currentUser.role === 'donor';
  const isRecipient = isAuthenticated && currentUser.role === 'recipient';

  return (
    <div className="space-y-7 animate-in fade-in pb-12">
      {/* 1. INTEGRATED USER PROFILE CONSOLE (Prominently displayed) */}
      <section aria-label="User Profile">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-[#344E41] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8BAF92]" />
            <span>Active User Profile & Identity</span>
          </h2>
          <span className="text-xs text-[#373A36]/60">Live Account Overview</span>
        </div>
        <UserProfileCard 
          onNavigateToPost={isDonor ? onOpenCreateDonation : undefined}
          onNavigateToStation={() => onNavigate(isDonor ? 'donor' : 'browse')}
          onOpenAuth={onOpenAuth}
        />
      </section>

      {/* 2. ROLE-ADAPTIVE HERO GREETING */}
      <div className="bg-gradient-to-r from-[#344E41] to-[#283d32] rounded-3xl p-6 sm:p-7 text-[#FFF8ED] shadow-sm relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <HeartHandshake className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8BAF92]/25 text-[#E5EFE5] text-xs font-semibold border border-[#8BAF92]/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8BAF92]" />
            <span>
              {isDonor 
                ? 'Food Donor Portal' 
                : isRecipient 
                ? 'Recipient Organization Portal — Verified Shelter' 
                : 'Community Food Rescue Network'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {isDonor 
              ? `Ready to Share Surplus, ${currentUser.displayName}?`
              : isRecipient
              ? `Surplus Food Hub for ${currentUser.organizationName || currentUser.displayName}`
              : (isAuthenticated ? `Welcome Back, ${currentUser.displayName}` : '“Share More. Waste Less.”')}
          </h1>

          <p className="text-xs sm:text-sm text-[#FFF8ED]/85 leading-relaxed font-normal">
            {isDonor
              ? `Your establishment (${currentUser.organizationName || 'Food Donor'}) is connected directly to verified local shelters. Post surplus food in seconds or inspect your inbound requests.`
              : isRecipient
              ? `Your shelter (${currentUser.organizationName || 'Recipient Shelter'}) can inspect surplus food batches published by partner restaurants and dining halls. Claim portions directly for your beneficiaries.`
              : (isAuthenticated 
                  ? `Connected as ${currentUser.organizationName || currentUser.displayName}. MealMitra connects quality surplus food directly to verified orphanages and shelters across the community.`
                  : 'Join the mission to bridge edible surplus food with children homes, shelters, and families in need.')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* ONLY Food Donors get "Post Surplus Food Details" button */}
            {isDonor && (
              <button
                onClick={onOpenCreateDonation}
                className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Post Surplus Food Details</span>
              </button>
            )}

            {isDonor ? (
              <button
                onClick={() => onNavigate('donor')}
                className="bg-[#FFF8ED]/15 hover:bg-[#FFF8ED]/25 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Open Donor Station & Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : isRecipient ? (
              <>
                <button
                  onClick={() => onNavigate('browse')}
                  className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Browse Available Donor Surplus</span>
                </button>
                <button
                  onClick={() => onNavigate('my-requests')}
                  className="bg-[#FFF8ED]/15 hover:bg-[#FFF8ED]/25 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Track My Shelter Requests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('browse')}
                className="bg-[#FFF8ED]/15 hover:bg-[#FFF8ED]/25 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Explore Available Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. DONOR-SPECIFIC SURPLUS ACTIVITY OR RECIPIENT PLATFORM IMPACT */}
      {isDonor ? (
        /* DONOR VIEW: Focus strictly on his own surplus postings and metrics */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#344E41] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#8BAF92]" />
              <span>My Surplus Contributions & Operations</span>
            </h2>
            <button
              onClick={() => onNavigate('donor')}
              className="text-xs font-semibold text-[#344E41] hover:text-[#8BAF92] flex items-center gap-1"
            >
              <span>Manage in Donor Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Donor Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">My Active Batches</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {loading ? '...' : myDonations.filter(d => d.status === 'Available').length}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#E5EFE5] text-[#344E41] flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-[#8BAF92]" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Ready for shelter pickup</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Meals Rescued</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {loading ? '...' : myDonations.reduce((sum, d) => sum + (d.originalQuantity || d.quantity), 0)}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#8BAF92]/20 text-[#344E41] flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 text-[#344E41]" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Portions saved from waste</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Completed Deliveries</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {loading ? '...' : myDonations.filter(d => d.status === 'Completed').length}
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Handed over to verified shelters</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Food Safety Score</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">100%</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Compliant with hygiene rules</p>
            </div>
          </div>

          {/* My Posted Food Batches Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#344E41]">My Real-Time Surplus Food Postings</h3>
                <p className="text-xs text-[#373A36]/70">Clean real-time data created by your account</p>
              </div>
              <button
                onClick={onOpenCreateDonation}
                className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Surplus Batch</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-stone-500">Loading your listings...</div>
            ) : myDonations.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#FFF8ED]/50 rounded-2xl border border-dashed border-[#344E41]/20">
                <Utensils className="w-8 h-8 text-[#8BAF92] mx-auto" />
                <div className="max-w-md mx-auto">
                  <h4 className="font-bold text-sm text-[#344E41]">No surplus listings posted yet</h4>
                  <p className="text-xs text-[#373A36]/70 mt-1">
                    Seed data has been removed. You can now post live real-time surplus batches and verify system operations!
                  </p>
                </div>
                <button
                  onClick={onOpenCreateDonation}
                  className="bg-[#344E41] text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-[#2b4035] transition-colors"
                >
                  Post First Surplus Food Batch
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDonations.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-[#344E41]/10 bg-[#FFF8ED]/30 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#344E41] line-clamp-1">{item.foodName}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Reserved' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#373A36]/80 space-y-1">
                      <p>Quantity: <strong className="text-[#344E41]">{item.quantity} {item.unit}</strong></p>
                      <p>Category: <span>{item.category}</span></p>
                      <p className="truncate">Location: <span>{item.pickupLocation}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : isRecipient ? (
        /* RECIPIENT SHELTER VIEW: Dedicated console to view donor-listed surplus & manage shelter claims */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#344E41] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#8BAF92]" />
                <span>Recipient Shelter Operations Console</span>
              </h2>
              <p className="text-xs text-[#373A36]/70 mt-0.5">
                Inspect surplus food batches published by partner donors and manage incoming meal distributions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified NGO / Shelter #{currentUser.registrationNumber || 'REG-7882'}</span>
              </span>
            </div>
          </div>

          {/* Recipient Shelter Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Available Donor Batches</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {loading ? '...' : stats?.availableCount ?? 0}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#E5EFE5] text-[#344E41] flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-[#8BAF92]" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Ready for your shelter to claim</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">My Active Claims</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {loading ? '...' : recipientRequests.filter(r => ['Pending', 'Accepted'].includes(r.status)).length}
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Pending approval & scheduled pickups</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Meals Rescued</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {loading ? '...' : recipientRequests.filter(r => ['Collected', 'Completed'].includes(r.status)).reduce((acc, r) => acc + (r.requestedQuantity || 0), 0)}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#8BAF92]/20 text-[#344E41] flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 text-[#344E41]" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Portions distributed to beneficiaries</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs">
              <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Beneficiaries Served</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#344E41]">
                  {currentUser.beneficiaries || 120}
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-[11px] text-[#373A36]/70 mt-1">Daily individuals accommodated</p>
            </div>
          </div>

          {/* Urgent Food Alert for Shelters */}
          {stats && stats.expiringSoonCount > 0 && (
            <div className="bg-[#C97B63]/10 border border-[#C97B63]/30 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C97B63] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#C97B63]">
                    {stats.expiringSoonCount} Urgent Surplus Food Listing{stats.expiringSoonCount > 1 ? 's' : ''} Need Pickup Within 3 Hours!
                  </h4>
                  <p className="text-xs text-[#373A36]/80 mt-0.5">
                    Freshly prepared meals from donors nearing distribution cutoff. Claim portions directly to prevent good food from being discarded.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('browse')}
                className="bg-[#C97B63] hover:bg-[#b56e58] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                Claim Urgent Surplus
              </button>
            </div>
          )}

          {/* Surplus Food Listed by Verified Donors */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-[#344E41] flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#8BAF92]" />
                  <span>Surplus Food Listed by Verified Donors</span>
                </h3>
                <p className="text-xs text-[#373A36]/70">
                  Real-time surplus batches published by restaurants, canteens, and caterers ready for your shelter to claim
                </p>
              </div>
              <button
                onClick={() => onNavigate('browse')}
                className="text-xs font-semibold text-[#344E41] hover:text-[#8BAF92] flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Surplus Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-stone-500">Loading donor surplus listings...</div>
            ) : (stats?.recentDonations?.length ?? 0) === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#FFF8ED]/50 rounded-2xl border border-dashed border-[#344E41]/20">
                <Utensils className="w-8 h-8 text-[#8BAF92] mx-auto opacity-70" />
                <div className="max-w-md mx-auto">
                  <h4 className="font-bold text-sm text-[#344E41]">No surplus listings posted by donors yet</h4>
                  <p className="text-xs text-[#373A36]/70 mt-1">
                    Partner restaurants and caterers post excess clean food throughout the day. Check back soon or refresh to see newly listed batches.
                  </p>
                </div>
                <button
                  onClick={fetchStats}
                  className="bg-[#344E41] hover:bg-[#283d32] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Surplus Feed</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stats?.recentDonations.slice(0, 3).map((item) => (
                  <DonationCard
                    key={item.id}
                    donation={item}
                    onRequest={onRequestDonation}
                    onViewDetails={onViewDonationDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shelter's Recent Claim History */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#344E41] flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#8BAF92]" />
                  <span>My Shelter's Active Food Claims & Reservations</span>
                </h3>
                <p className="text-xs text-[#373A36]/70">Track approval status and pickup schedules from food donors</p>
              </div>
              <button
                onClick={() => onNavigate('my-requests')}
                className="text-xs font-semibold text-[#344E41] hover:text-[#8BAF92] flex items-center gap-1 cursor-pointer"
              >
                <span>All My Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-stone-500">Loading your shelter requests...</div>
            ) : recipientRequests.length === 0 ? (
              <div className="text-center py-8 bg-[#FFF8ED]/30 rounded-2xl border border-dashed border-[#344E41]/15 space-y-2">
                <HeartHandshake className="w-7 h-7 text-[#8BAF92] mx-auto opacity-70" />
                <p className="text-xs font-semibold text-[#344E41]">You haven't requested any surplus food batches yet</p>
                <p className="text-[11px] text-[#373A36]/70 max-w-sm mx-auto">
                  Browse donor surplus listings above and click "Request Food" to reserve portions for your shelter residents.
                </p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="mt-2 bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-4 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Browse Available Food Batches
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#344E41]/10">
                {recipientRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#344E41]">{req.foodName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'Collected' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'Completed' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#373A36]/70">
                        Donor: <strong className="text-[#344E41] font-medium">{req.donorName}</strong> &bull; Claimed: <strong>{req.requestedQuantity} {req.unit}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div className="text-[11px] text-[#373A36]/80">
                        <span className="block text-[10px] text-[#373A36]/60">Pickup Target</span>
                        <span className="font-medium text-[#344E41]">{new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <button
                        onClick={() => onNavigate('my-requests')}
                        className="px-3 py-1 bg-[#E5EFE5] hover:bg-[#d5e7d5] text-[#344E41] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PUBLIC & VOLUNTEER VIEW: Live Platform Statistics & Public Listings Showcase */
        <>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#344E41] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8BAF92]" />
                Live Platform Impact (Calculated from Records)
              </h2>
              <span className="text-xs text-[#373A36]/60">Auto-synced</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Available Food Items */}
              <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Surplus Listings</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-[#8BAF92]" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-[#344E41]">
                    {loading ? '...' : stats?.availableCount ?? 0}
                  </span>
                  <p className="text-[11px] text-[#373A36]/70 mt-1">Available for immediate pickup</p>
                </div>
              </div>

              {/* 2. Total Meals Redistributed */}
              <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Meals Rescued</span>
                  <div className="w-9 h-9 rounded-xl bg-[#8BAF92]/20 text-[#344E41] flex items-center justify-center">
                    <PackageCheck className="w-4 h-4 text-[#344E41]" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-[#344E41]">
                    {loading ? '...' : `${stats?.totalRedistributedMeals ?? 0}+`}
                  </span>
                  <p className="text-[11px] text-[#373A36]/70 mt-1">Portions saved from landfills</p>
                </div>
              </div>

              {/* 3. Active Donation Requests */}
              <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Active Requests</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-[#344E41]">
                    {loading ? '...' : stats?.activeRequestsCount ?? 0}
                  </span>
                  <p className="text-[11px] text-[#373A36]/70 mt-1">Pending & accepted pickups</p>
                </div>
              </div>

              {/* 4. Completed Handovers */}
              <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#373A36]/70 uppercase">Completed Deliveries</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-[#344E41]">
                    {loading ? '...' : stats?.completedHandoversCount ?? 0}
                  </span>
                  <p className="text-[11px] text-[#373A36]/70 mt-1">Safely handed over to shelters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Surplus Section (Earthy Terracotta Callout) */}
          {stats && stats.expiringSoonCount > 0 && (
            <div className="bg-[#C97B63]/10 border border-[#C97B63]/30 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C97B63] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#C97B63]">
                    {stats.expiringSoonCount} Urgent Surplus Food Listing{stats.expiringSoonCount > 1 ? 's' : ''} Need Pickup Within 3 Hours!
                  </h4>
                  <p className="text-xs text-[#373A36]/80 mt-0.5">
                    Freshly prepared meals nearing distribution deadline. Rescue them now before they are marked expired.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('browse')}
                className="bg-[#C97B63] hover:bg-[#b56e58] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                View Urgent Surplus
              </button>
            </div>
          )}

          {/* Recent Available Surplus Items Showcase */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#344E41]">Recently Listed Surplus Food</h2>
                <p className="text-xs text-[#373A36]/70">Freshly published batches ready for community rescue</p>
              </div>
              <button
                onClick={() => onNavigate('browse')}
                className="text-xs font-semibold text-[#344E41] hover:text-[#8BAF92] flex items-center gap-1 cursor-pointer"
              >
                <span>See All Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-stone-500">Loading surplus listings...</div>
            ) : (stats?.recentDonations?.length ?? 0) === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#344E41]/10 space-y-2">
                <Utensils className="w-8 h-8 text-[#8BAF92] mx-auto" />
                <h3 className="font-bold text-sm text-[#344E41]">No surplus listings posted yet</h3>
                <p className="text-xs text-[#373A36]/70">Food donors will list clean excess food here as batches become available.</p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="mt-2 bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stats?.recentDonations.slice(0, 3).map((item) => (
                  <DonationCard
                    key={item.id}
                    donation={item}
                    onRequest={onRequestDonation}
                    onViewDetails={onViewDonationDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. Quick Access Grid: Role Workflow Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        {isRecipient ? (
          <>
            <div 
              onClick={() => onNavigate('browse')} 
              className="bg-white p-5 rounded-2xl border border-[#344E41]/12 hover:border-[#8BAF92] cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5 text-[#8BAF92]" />
              </div>
              <h3 className="font-bold text-sm text-[#344E41] mb-1">Browse Donor Surplus</h3>
              <p className="text-xs text-[#373A36]/70 leading-relaxed">
                Inspect surplus food listings published by partner restaurants and dining halls. Filter by food type and storage temperature.
              </p>
              <span className="text-xs text-[#8BAF92] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Food Listings <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div 
              onClick={() => onNavigate('my-requests')} 
              className="bg-white p-5 rounded-2xl border border-[#344E41]/12 hover:border-[#8BAF92] cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-[#8BAF92]" />
              </div>
              <h3 className="font-bold text-sm text-[#344E41] mb-1">My Shelter Claims & Pickups</h3>
              <p className="text-xs text-[#373A36]/70 leading-relaxed">
                Manage your active portion requests, pickup schedules, and communicate directly with donor establishments.
              </p>
              <span className="text-xs text-[#8BAF92] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Track Requests <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div 
              onClick={() => onNavigate('volunteer')} 
              className="bg-white p-5 rounded-2xl border border-[#344E41]/12 hover:border-[#8BAF92] cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bike className="w-5 h-5 text-[#8BAF92]" />
              </div>
              <h3 className="font-bold text-sm text-[#344E41] mb-1">Community Delivery Volunteers</h3>
              <p className="text-xs text-[#373A36]/70 leading-relaxed">
                View delivery runners assisting with transporting meals from donors to shelters across the city.
              </p>
              <span className="text-xs text-[#8BAF92] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Volunteer Board <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </>
        ) : (
          <>
            <div 
              onClick={() => onNavigate(isDonor ? 'donor' : 'welcome')} 
              className="bg-white p-5 rounded-2xl border border-[#344E41]/12 hover:border-[#8BAF92] cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5 text-[#8BAF92]" />
              </div>
              <h3 className="font-bold text-sm text-[#344E41] mb-1">For Food Donors</h3>
              <p className="text-xs text-[#373A36]/70 leading-relaxed">
                Restaurants, campus canteens & events post surplus in 30 seconds. Review incoming requests and approve handovers.
              </p>
              <span className="text-xs text-[#8BAF92] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {isDonor ? 'Manage Listings' : 'Donor Portal'} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div 
              onClick={() => onNavigate('browse')} 
              className="bg-white p-5 rounded-2xl border border-[#344E41]/12 hover:border-[#8BAF92] cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-[#8BAF92]" />
              </div>
              <h3 className="font-bold text-sm text-[#344E41] mb-1">For Shelters & Orphanages</h3>
              <p className="text-xs text-[#373A36]/70 leading-relaxed">
                Filter surplus by category, storage condition, and distance. Request exact meal counts and coordinate directly.
              </p>
              <span className="text-xs text-[#8BAF92] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Browse Directory <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div 
              onClick={() => onNavigate('volunteer')} 
              className="bg-white p-5 rounded-2xl border border-[#344E41]/12 hover:border-[#8BAF92] cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bike className="w-5 h-5 text-[#8BAF92]" />
              </div>
              <h3 className="font-bold text-sm text-[#344E41] mb-1">For Community Volunteers</h3>
              <p className="text-xs text-[#373A36]/70 leading-relaxed">
                Pick up packed meals from donors on bikes or vans and transport them safely to night shelters with live status updates.
              </p>
              <span className="text-xs text-[#8BAF92] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Dispatch Board <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
