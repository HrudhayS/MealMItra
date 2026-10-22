import React from 'react';
import { 
  ShieldCheck, 
  Thermometer, 
  Clock, 
  Package, 
  AlertTriangle, 
  FileCheck, 
  CheckCircle2,
  Info
} from 'lucide-react';

export const FoodSafetyPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EFE5] text-[#344E41] text-xs font-semibold mb-2">
          <ShieldCheck className="w-4 h-4 text-[#8BAF92]" />
          <span>Food Safety & Community Responsibility Charter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#344E41]">
          Food Safety Standards & Distribution Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-[#373A36]/80 mt-1 leading-relaxed">
          Surplus food rescue requires strict temperature control, hygiene, and full ingredient honesty. Every participating donor, shelter, and volunteer agrees to these core principles.
        </p>
      </div>

      {/* Mandatory Statutory Disclaimer (Section 10 Requirement) */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Important Safety & Compliance Notice</span>
        </div>
        <p className="leading-relaxed">
          <strong>MealMitra Platform Disclaimer:</strong> A surplus food listing is never guaranteed safe merely because a donor posted it on the platform. Real-world distribution requires strict adherence to local food hygiene standards, Good Samaritan food donation acts, temperature testing, hygienic transport logistics, and child protection protocols when serving youth centers.
        </p>
        <p className="text-amber-800">
          Recipient organizations must conduct visual, olfactory, and temperature inspections before accepting or distributing food.
        </p>
      </div>

      {/* 5 Golden Rules of Surplus Food Rescue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#344E41]">The 5 Golden Rules of Food Rescue</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Rule 1 */}
          <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-sm text-[#344E41]">The 2-Hour Cooked Food Rule</h3>
            </div>
            <p className="text-[#373A36]/80 leading-relaxed">
              Cooked hot foods that have sat at room temperature for over 2 hours must not be donated. Leftovers must be placed in hot holding (≥ 60°C) or blast-chilled (≤ 4°C) within 90 minutes of prep.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-sm text-[#344E41]">Continuous Temperature Maintenance</h3>
            </div>
            <p className="text-[#373A36]/80 leading-relaxed">
              Maintain the cold/hot chain. Chilled dairy and cooked meats must be transported in insulated thermal coolers with ice bricks. Hot soups and rice require insulated Cambro boxes.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-sm text-[#344E41]">Clean, Food-Grade Packaging</h3>
            </div>
            <p className="text-[#373A36]/80 leading-relaxed">
              All donated food must be packed in virgin food-grade containers, aluminum pans with secured lids, or sealed bags. Never use garbage bags, reused non-food bins, or damaged boxes.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-sm text-[#344E41]">Accurate Allergen Declarations</h3>
            </div>
            <p className="text-[#373A36]/80 leading-relaxed">
              Donors must explicitly list presence of the Top 8 Allergens (Peanuts, Tree Nuts, Dairy, Wheat/Gluten, Eggs, Soy, Shellfish, Fish). Shelters serve vulnerable populations with severe sensitivities.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="bg-white p-5 rounded-2xl border border-[#344E41]/12 space-y-2 shadow-xs sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold">
                5
              </div>
              <h3 className="font-bold text-sm text-[#344E41]">Inspection & Immediate Serving Protocol</h3>
            </div>
            <p className="text-[#373A36]/80 leading-relaxed">
              Upon pickup, recipient staff must verify packaging seals, check smell and temperature. Any food suspected of contamination or sitting past deadline must be rejected and reported. Reheat hot meals to 74°C (165°F) before distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Community Reporting */}
      <div className="bg-white p-6 rounded-2xl border border-[#344E41]/12 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-[#344E41] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#C97B63]" />
          Reporting Violations or Unsafe Food
        </h3>
        <p className="text-xs text-[#373A36]/80 leading-relaxed">
          If you encounter spoiled food, unhygienic packaging, inaccurate allergen descriptions, or unresponsive donors, click the <strong>Flag / Report Listing</strong> button found on any donation card or details modal. Our team reviews all reports immediately and suspends recurring offenders.
        </p>
      </div>
    </div>
  );
};
