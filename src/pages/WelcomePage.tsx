import React, { useRef, useState, useEffect } from 'react';
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
  Globe2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface WelcomePageProps {
  onGetStarted: () => void;
  onOpenSignIn?: (role?: 'donor' | 'recipient') => void;
  onOpenSignUp?: (role?: 'donor' | 'recipient') => void;
  onExploreSurplus?: () => void;
}

interface RescueStepItem {
  step: number;
  role: string;
  subtitle: string;
  title: string;
  description: string;
  timeframe: string;
  points: string[];
  standard: string;
  cardBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  pillBg: string;
  pillText: string;
  checkColor: string;
  icon: React.ElementType;
}

const rescueSteps: RescueStepItem[] = [
  {
    step: 1,
    role: 'Donor Kitchen',
    subtitle: 'Quality & Sensory Check',
    title: 'Surplus Inspected & Logged',
    description: 'Commercial kitchens and banquet chefs evaluate untouched food immediately after service.',
    timeframe: '~2-3 mins',
    points: [
      'Digital temperature check (Hot dishes ≥ 60°C, chilled items ≤ 5°C)',
      'Categorized into cooked mains, breads/bakery, or fresh pantry items',
      'Allergen tags & dietary classification (Veg, Halal, Nut-free, Dairy)'
    ],
    standard: 'FSSAI / Good Samaritan hygiene protocol applied',
    cardBg: 'bg-stone-50',
    borderColor: 'border-stone-200',
    badgeBg: 'bg-[#344E41]',
    badgeText: 'text-white',
    pillBg: 'bg-[#E5EFE5]',
    pillText: 'text-[#344E41]',
    checkColor: 'text-[#344E41]',
    icon: Utensils
  },
  {
    step: 2,
    role: 'MealMitra Platform',
    subtitle: 'Geo-Targeted Dispatch',
    title: 'Instant Broadcast & Expiry Timer',
    description: 'Portion counts, pickup deadlines, and packaging specs are instantly synchronized to local shelters.',
    timeframe: '< 30 seconds',
    points: [
      'Automated 10 km radius alert to verified non-profit networks',
      'Dynamic countdown timer ensures food is claimed before expiry window',
      'Direct donor contact numbers masked until formal claim approval'
    ],
    standard: 'Real-time Cloud Firestore live inventory syncing',
    cardBg: 'bg-sky-50/50',
    borderColor: 'border-sky-200',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    pillBg: 'bg-sky-100',
    pillText: 'text-sky-800',
    checkColor: 'text-sky-600',
    icon: Sparkles
  },
  {
    step: 3,
    role: 'Recipient Shelter',
    subtitle: 'Fair Portion Allocation',
    title: 'Shelter Claims Exact Headcount',
    description: 'Shelters, orphanages, and community kitchens review available surplus and reserve exact portions.',
    timeframe: '~5-10 mins',
    points: [
      'Coordinators request specific portions tailored to resident headcounts',
      'Prevents hoarding and food dumping across shelters',
      'Beneficiary profile matching (elderly soft meals, kids nutrition)'
    ],
    standard: '100% verified NGO registration and non-commercial charter',
    cardBg: 'bg-amber-50/60',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-900',
    checkColor: 'text-amber-600',
    icon: Building2
  },
  {
    step: 4,
    role: 'Donor & Shelter',
    subtitle: 'Mutual Confirmation',
    title: 'Approval & Direct Coordination',
    description: 'The donor approves the reservation, instantly unlocking direct communication channels.',
    timeframe: '< 3 mins',
    points: [
      'Direct phone contact & encrypted messaging channels unlocked',
      'Pickup timeframe locked in (typically within 45–90 minutes)',
      'Kitchen rear gate, dock access, and staff contact directions shared'
    ],
    standard: 'Secure verification token for authorized shelter pickup',
    cardBg: 'bg-teal-50/50',
    borderColor: 'border-teal-200',
    badgeBg: 'bg-teal-700',
    badgeText: 'text-white',
    pillBg: 'bg-teal-100',
    pillText: 'text-teal-900',
    checkColor: 'text-teal-700',
    icon: ShieldCheck
  },
  {
    step: 5,
    role: 'Logistics & Transit',
    subtitle: 'Thermal Chain Protection',
    title: 'Insulated Packing & Fast Transit',
    description: 'Food is packed in food-grade insulated thermal carriers and transported safely.',
    timeframe: '~15-30 mins',
    points: [
      'Thermal-insulated containers preserve safe serving temperatures',
      'Visual seal inspection & container portion verification at pickup',
      'Digital dispatch sign-off recorded directly on mobile device'
    ],
    standard: 'Cold / hot chain compliance to prevent bacterial growth',
    cardBg: 'bg-purple-50/40',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-700',
    badgeText: 'text-white',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-900',
    checkColor: 'text-purple-700',
    icon: Truck
  },
  {
    step: 6,
    role: 'Community Impact',
    subtitle: 'Dignified Service',
    title: 'Nutritious Meals Served & Audited',
    description: 'Hot meals are served with dignity to residents, and environmental impact is permanently logged.',
    timeframe: 'Same-day meal',
    points: [
      'Wholesome meals served fresh to children, elders, and families',
      'Zero commercial resale verified under Good Samaritan Charter',
      'Impact logged: meals saved, kg diverted, and landfill methane avoided'
    ],
    standard: 'End-to-end transparent ESG & community impact ledger',
    cardBg: 'bg-[#E5EFE5]/70',
    borderColor: 'border-[#8BAF92]/40',
    badgeBg: 'bg-[#8BAF92]',
    badgeText: 'text-[#344E41]',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-900',
    checkColor: 'text-emerald-700',
    icon: HeartHandshake
  }
];

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onGetStarted,
  onOpenSignIn,
  onOpenSignUp,
  onExploreSurplus,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    // Calculate approximate active step based on scroll offset
    const cardWidth = 320; // approximate width + gap
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveStepIndex(Math.min(Math.max(index, 0), rescueSteps.length - 1));
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, []);

  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
  };

  const scrollToStep = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cards = scrollContainerRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  };

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

      {/* Step by Step Workflow - Horizontal Scroll Track */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#344E41]/12 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EFE5] text-[#344E41] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#8BAF92]" />
              <span>Full Lifecycle Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">
              How the Surplus Rescue Loop Operates
            </h2>
            <p className="text-xs sm:text-sm text-[#373A36]/75 leading-relaxed">
              A verified 6-stage coordination loop ensuring wholesome surplus meals move swiftly, safely, and respectfully from commercial kitchens to recipient tables.
            </p>
          </div>

          {/* Horizontal scroll navigation controls */}
          <div className="flex items-center gap-2 self-start md:self-end shrink-0">
            <span className="text-[11px] font-semibold text-stone-500 mr-1 hidden sm:inline-flex items-center gap-1">
              <span>Scroll or swipe</span>
              <span className="text-stone-400 font-mono">↔</span>
            </span>
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Previous step"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft 
                  ? 'border-[#344E41]/30 bg-white hover:bg-[#E5EFE5] text-[#344E41] shadow-xs active:scale-95' 
                  : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Next step"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight 
                  ? 'border-[#344E41]/30 bg-white hover:bg-[#E5EFE5] text-[#344E41] shadow-xs active:scale-95' 
                  : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable track */}
        <div 
          ref={scrollContainerRef}
          onScroll={updateScrollState}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#8BAF92 transparent' }}
        >
          {rescueSteps.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            return (
              <div
                key={stepItem.step}
                className={`w-[290px] sm:w-[340px] shrink-0 snap-start rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${stepItem.cardBg} ${stepItem.borderColor}`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Step number badge, Role Tag & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${stepItem.badgeBg} ${stepItem.badgeText}`}>
                        {stepItem.step}
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${stepItem.pillBg} ${stepItem.pillText}`}>
                        {stepItem.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-white/80 px-2 py-0.5 rounded-md border border-stone-200/60 shadow-2xs">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{stepItem.timeframe}</span>
                    </div>
                  </div>

                  {/* Header & Subtitle */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                      {stepItem.subtitle}
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-stone-900 leading-snug">
                        {stepItem.title}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed pt-0.5">
                      {stepItem.description}
                    </p>
                  </div>

                  {/* Key actionable points / specifications */}
                  <div className="space-y-2 pt-1 border-t border-stone-200/70">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                      Key Protocols & Data Points:
                    </div>
                    <ul className="space-y-1.5">
                      {stepItem.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-xs text-stone-700 leading-snug">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${stepItem.checkColor}`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Standard Pill */}
                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#344E41] shrink-0" />
                  <span className="truncate font-medium">{stepItem.standard}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step indicator tracker & Quick jump buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-600">Steps overview:</span>
            <div className="flex items-center gap-1.5">
              {rescueSteps.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => scrollToStep(idx)}
                  className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                    activeStepIndex === idx
                      ? 'bg-[#344E41] text-[#FFF8ED] shadow-xs scale-105'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                  title={`Jump to step ${s.step}: ${s.title}`}
                >
                  {s.step}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-500">
              Verified end-to-end audit loop
            </span>
            <div className="h-3 w-px bg-stone-300"></div>
            <button
              onClick={onGetStarted}
              className="text-xs font-bold text-[#344E41] hover:text-[#24352b] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Join the loop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
