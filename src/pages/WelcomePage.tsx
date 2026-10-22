import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Utensils, 
  Building2, 
  Bike, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Phone, 
  Users,
  LogIn,
  UserPlus,
  PlusCircle
} from 'lucide-react';

interface WelcomePageProps {
  onOpenSignIn: (role?: 'donor' | 'recipient') => void;
  onOpenSignUp: (role?: 'donor' | 'recipient') => void;
  onExploreSurplus: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onOpenSignIn,
  onOpenSignUp,
  onExploreSurplus,
}) => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 pb-16 animate-in fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#344E41] via-[#2d4237] to-[#1e2d25] text-[#FFF8ED] p-8 sm:p-12 shadow-lg border border-[#344E41]/20">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#8BAF92]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8BAF92]/20 border border-[#8BAF92]/40 text-[#E5EFE5] text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8BAF92]" />
            <span>Community Surplus Food Rescue Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            “Share More. <br className="hidden sm:inline" />
            <span className="text-[#8BAF92]">Waste Less.”</span>
          </h1>

          <p className="text-base sm:text-lg text-[#FFF8ED]/85 leading-relaxed max-w-2xl font-normal">
            Welcome to <strong>MealMitra</strong> — connecting restaurants, dining canteens, and caterers directly with verified orphanages, night shelters, and community kitchens.
          </p>

          {/* Action CTAs: Distinct Pathways for Donors & Recipient Organizations */}
          <div className="pt-2">
            {!isAuthenticated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {/* 1. Food Donors Card */}
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-7 h-7 rounded-lg bg-[#8BAF92] text-[#344E41] flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">For Food Donors</h4>
                      <p className="text-[11px] text-white/70">Restaurants, Canteens, Caterers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenSignUp('donor')}
                      className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex-1"
                    >
                      Donor Register
                    </button>
                    <button
                      onClick={() => onOpenSignIn('donor')}
                      className="bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border border-white/20"
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                {/* 2. Recipient Shelters Card */}
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-amber-100">For Recipient Shelters</h4>
                      <p className="text-[11px] text-white/70">Orphanages, Night Shelters, NGOs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenSignUp('recipient')}
                      className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex-1"
                    >
                      Shelter Register
                    </button>
                    <button
                      onClick={() => onOpenSignIn('recipient')}
                      className="bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border border-white/20"
                    >
                      Shelter Sign In
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {currentUser.role === 'donor' ? (
                  <button
                    onClick={onExploreSurplus}
                    className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-6 py-3 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Enter Food Donor Station</span>
                  </button>
                ) : (
                  <button
                    onClick={onExploreSurplus}
                    className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-6 py-3 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>View Surplus Food from Donors</span>
                  </button>
                )}
              </div>
            )}

            <div className="pt-3">
              <button
                onClick={onExploreSurplus}
                className="text-xs sm:text-sm font-medium text-[#FFF8ED]/85 hover:text-white flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
              >
                <span>Browse live surplus food inventory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Trust Badges */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-[#FFF8ED]/75">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
              <span>Verified Non-Profit Shelters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
              <span>Temperature & Allergen Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
              <span>Zero Resale or Commercial Abuse</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join as a Food Donor Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8BAF92] px-3 py-1 rounded-full bg-[#E5EFE5]">
            Dedicated Donor Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">
            Why Restaurants & Canteens Choose MealMitra
          </h2>
          <p className="text-xs sm:text-sm text-[#373A36]/70 leading-relaxed">
            Throwing away safe, nutritious cooked food wastes labor, ingredients, and water. MealMitra makes donating as effortless as taking out the bins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <h3 className="font-bold text-base text-[#344E41]">Post in 60 Seconds</h3>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              Specify portions, preparation time, and collection deadline on any phone or tablet. Pre-filled profiles make everyday listing instantaneous.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
              <Phone className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <h3 className="font-bold text-base text-[#344E41]">Instant WhatsApp & Call</h3>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              When a shelter requests your surplus, connect instantly via pre-formatted WhatsApp chat or one-touch phone calls to coordinate exact vehicle arrival times.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <h3 className="font-bold text-base text-[#344E41]">Good Samaritan Protection</h3>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              All recipient shelters sign food safety inspection charters. Unlocked addresses are only revealed to authorized and approved coordinators.
            </p>
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#344E41]/12 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-[#344E41]">How the Rescue Loop Operates</h2>
          <p className="text-xs text-[#373A36]/70">Simple, respectful, and transparent coordination from kitchen to shelter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Donor Publishes Surplus</h4>
            <p className="text-xs text-[#373A36]/70 leading-relaxed">
              Enter quantity, food category, allergens, and the latest pickup deadline before quality degrades.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Shelter Claims Portions</h4>
            <p className="text-xs text-[#373A36]/70 leading-relaxed">
              Nearby orphanages and NGOs discover the post and request exact portion quantities needed for their meal service.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Approval & Logistics</h4>
            <p className="text-xs text-[#373A36]/70 leading-relaxed">
              Donor approves the request. Pickup instructions and coordinator phone numbers are safely unlocked.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#8BAF92] text-[#344E41] flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Safe Handover</h4>
            <p className="text-xs text-[#373A36]/70 leading-relaxed">
              Food is inspected, transferred into clean thermal containers, and distributed to vulnerable beneficiaries.
            </p>
          </div>
        </div>
      </section>

      {/* Callout Card to Sign In / Sign Up */}
      <section className="bg-[#E5EFE5] rounded-3xl p-8 sm:p-12 border border-[#8BAF92]/40 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">
          Ready to Make Every Meal Count?
        </h2>
        <p className="text-xs sm:text-sm text-[#373A36]/80 max-w-lg mx-auto leading-relaxed">
          Join hundreds of conscious chefs, event managers, and universities turning surplus food into warm meals for those in need.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onOpenSignUp('donor')}
            className="bg-[#344E41] hover:bg-[#283d32] text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Utensils className="w-4 h-4 text-[#8BAF92]" />
            <span>Register as Food Donor</span>
          </button>
          <button
            onClick={() => onOpenSignUp('recipient')}
            className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Register Recipient Shelter</span>
          </button>
          <button
            onClick={() => onOpenSignIn('donor')}
            className="bg-white hover:bg-stone-50 text-[#344E41] font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm border border-[#344E41]/15 shadow-sm transition-all cursor-pointer"
          >
            Sign In to Existing Account
          </button>
        </div>
      </section>
    </div>
  );
};
