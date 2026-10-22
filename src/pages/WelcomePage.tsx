import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Utensils, 
  Building2, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Users,
  PlusCircle,
  Truck,
  Award,
  Zap,
  Globe2
} from 'lucide-react';

interface WelcomePageProps {
  onGetStarted: () => void;
  onOpenSignIn?: (role?: 'donor' | 'recipient') => void;
  onOpenSignUp?: (role?: 'donor' | 'recipient') => void;
  onExploreSurplus?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onGetStarted,
  onOpenSignIn,
  onOpenSignUp,
  onExploreSurplus,
}) => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 pb-16 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#344E41] via-[#283d33] to-[#1a2820] text-[#FFF8ED] p-8 sm:p-14 shadow-2xl border border-[#344E41]/30">
        {/* Glow ambient shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#8BAF92]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 translate-y-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8BAF92]/20 border border-[#8BAF92]/40 text-[#E5EFE5] text-xs font-bold backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#8BAF92]" />
            <span>Community Surplus Food Rescue Network</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              “Share More. <br />
              <span className="text-[#8BAF92]">Waste Less.”</span>
            </h1>
            <p className="text-base sm:text-xl text-[#FFF8ED]/85 leading-relaxed max-w-2xl font-normal pt-2">
              Welcome to <strong>MealMitra</strong> — connecting restaurants, dining canteens, and caterers directly with verified orphanages, night shelters, and community kitchens in real time.
            </p>
          </div>

          {/* Core "Get started" Call to Action with Animation */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#8BAF92] to-[#789d7f] hover:from-[#9bc0a2] hover:to-[#88ad8f] text-[#24352b] font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-4 ring-[#8BAF92]/30"
            >
              <span>Get started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
            </button>

            {isAuthenticated && (
              <button
                onClick={onExploreSurplus}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-[#FFF8ED] font-semibold text-sm px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-[#8BAF92]" />
                <span>Go directly to {currentUser.role === 'donor' ? 'Donor Window' : 'Surplus Food Listings'}</span>
              </button>
            )}
          </div>

          {/* Quick Access Badges for Donors & Shelters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-4">
            {/* 1. Food Donors Card */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs space-y-2.5">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-[#8BAF92] text-[#344E41] flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">For Food Donors</h4>
                  <p className="text-[11px] text-white/70">Restaurants, Canteens, Caterers</p>
                </div>
              </div>
              <p className="text-xs text-white/80">List excess hot meals and bakery surplus in seconds with automatic expiry tracking.</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => (onOpenSignUp ? onOpenSignUp('donor') : onGetStarted())}
                  className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex-1"
                >
                  Donor Register
                </button>
                <button
                  onClick={() => (onOpenSignIn ? onOpenSignIn('donor') : onGetStarted())}
                  className="bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border border-white/20"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* 2. Recipient Shelters Card */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-xs space-y-2.5">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-100">For Recipient Shelters</h4>
                  <p className="text-[11px] text-white/70">Orphanages, Shelters, NGOs</p>
                </div>
              </div>
              <p className="text-xs text-white/80">Browse available surplus food from donors and request portions for your residents.</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => (onOpenSignUp ? onOpenSignUp('recipient') : onGetStarted())}
                  className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex-1"
                >
                  Shelter Register
                </button>
                <button
                  onClick={() => (onOpenSignIn ? onOpenSignIn('recipient') : onGetStarted())}
                  className="bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border border-white/20"
                >
                  Shelter Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Live Trust Badges */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-[#FFF8ED]/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
              <span>100% Verified Non-Profit Shelters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
              <span>Temperature & Allergen Integrity</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />
              <span>Zero Commercial Resale Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#344E41]/10 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
            <Utensils className="w-4 h-4 text-[#8BAF92]" />
            <span>Redistributed Meals</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">3,420+</div>
          <p className="text-[11px] text-stone-500">Nutritious portions delivered</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#344E41]/10 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
            <Building2 className="w-4 h-4 text-[#8BAF92]" />
            <span>Active Shelters</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">38</div>
          <p className="text-[11px] text-stone-500">Verified orphanages & homes</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#344E41]/10 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
            <Award className="w-4 h-4 text-[#8BAF92]" />
            <span>Donor Kitchens</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">89</div>
          <p className="text-[11px] text-stone-500">Restaurants, canteens, bakeries</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#344E41]/10 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
            <Globe2 className="w-4 h-4 text-[#8BAF92]" />
            <span>CO₂ Prevented</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">5.8 Tons</div>
          <p className="text-[11px] text-stone-500">Methane & landfill mitigation</p>
        </div>
      </section>

      {/* Why Join MealMitra Ecosystem */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#344E41] px-3.5 py-1.5 rounded-full bg-[#E5EFE5]">
            Balanced Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">
            Clear Roles, Strict Integrity, Zero Waste
          </h2>
          <p className="text-xs sm:text-sm text-[#373A36]/70 leading-relaxed">
            MealMitra enforces strict role boundaries: Food Donors publish surplus inventory, while Recipient Shelters claim portions to feed beneficiaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <h3 className="font-bold text-base text-[#344E41]">Publish in 60 Seconds</h3>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              Donors specify portions, preparation time, temperature conditions, and pickup deadlines directly from any phone or kitchen POS.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <h3 className="font-bold text-base text-[#344E41]">Fair Portion Allocation</h3>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              Shelters view live donor listings and request only the exact portions needed, preventing food hoarding and ensuring equitable community distribution.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-[#8BAF92]" />
            </div>
            <h3 className="font-bold text-base text-[#344E41]">Good Samaritan Charter</h3>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              Full legal compliance under Good Samaritan Food Donation frameworks. Donors are protected when acting in good faith to donate wholesome food.
            </p>
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#344E41]/12 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-[#344E41]">How the Surplus Rescue Loop Operates</h2>
          <p className="text-xs text-[#373A36]/70">Simple, respectful, and transparent coordination from kitchen to shelter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-8 h-8 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Donor Publishes Surplus</h4>
            <p className="text-xs text-[#373A36]/70 leading-relaxed">
              Chefs post meal portions, preparation times, storage conditions, and expiry limits.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-300">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-bold text-sm text-amber-950">Shelter Claims Portions</h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              Nearby orphanages and shelters discover listings and request portions for their lunch/dinner.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-8 h-8 rounded-xl bg-[#344E41] text-[#FFF8ED] flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Donor Accepts & Coordinates</h4>
            <p className="text-xs text-[#373A36]/70 leading-relaxed">
              Donor approves claim. Direct phone contact, pickup times, and chat coordination unlock safely.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-[#E5EFE5] border border-[#8BAF92]/40">
            <div className="w-8 h-8 rounded-xl bg-[#8BAF92] text-[#344E41] flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h4 className="font-bold text-sm text-[#344E41]">Safe Handover & Meal Served</h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              Food is packed in insulated containers and served warm to children, elders, and families in need.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-[#344E41] to-[#24352b] rounded-3xl p-8 sm:p-12 text-[#FFF8ED] text-center space-y-6 shadow-xl border border-[#344E41]/20">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Make Every Meal Count?
          </h2>
          <p className="text-xs sm:text-sm text-[#FFF8ED]/85 leading-relaxed">
            Start saving wholesome food from being wasted. Join our verified network of conscious kitchens and caring community shelters today.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center justify-center gap-2 bg-[#8BAF92] hover:bg-[#9bc0a2] text-[#344E41] font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};
