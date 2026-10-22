import React from 'react';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  MapPin, 
  Clock, 
  Package, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Flag,
  ArrowRight
} from 'lucide-react';

interface DonationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  onRequest: (donation: Donation) => void;
  onReport: (donation: Donation) => void;
}

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  isOpen,
  onClose,
  donation,
  onRequest,
  onReport,
}) => {
  const { currentUser } = useAuth();
  if (!isOpen || !donation) return null;

  const isOwner = currentUser.uid === donation.donorId;
  const deadlineDate = new Date(donation.deadline);
  const now = new Date();
  const isUrgent = (deadlineDate.getTime() - now.getTime()) / (1000 * 3600) <= 3 && deadlineDate > now;
  const isExpired = deadlineDate <= now || donation.status === 'Expired';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#344E41]/15 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#FFF8ED] border-b border-[#344E41]/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5EFE5] text-[#344E41] border border-[#8BAF92]/30">
              {donation.category}
            </span>
            <h2 className="text-xl font-bold text-[#344E41] mt-1">{donation.foodName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#373A36]/60 hover:text-[#344E41] hover:bg-[#344E41]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-[#373A36]">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#FFF8ED] border border-[#344E41]/10">
              <span className="text-[10px] text-[#373A36]/70 uppercase font-semibold">Available</span>
              <p className="text-sm font-bold text-[#344E41] mt-0.5">
                {donation.quantity} {donation.unit}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF8ED] border border-[#344E41]/10">
              <span className="text-[10px] text-[#373A36]/70 uppercase font-semibold">Storage Condition</span>
              <p className="text-xs font-bold text-[#344E41] mt-0.5">
                {donation.storageConditions}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${isUrgent ? 'bg-[#C97B63]/10 border-[#C97B63]/30 text-[#C97B63]' : 'bg-[#FFF8ED] border-[#344E41]/10'}`}>
              <span className="text-[10px] uppercase font-semibold">Pickup Deadline</span>
              <p className="text-xs font-bold mt-0.5">
                {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })})
              </p>
            </div>
          </div>

          {/* Description */}
          {donation.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider">Food Description</h4>
              <p className="text-xs leading-relaxed text-[#373A36]/80 p-3 bg-stone-50 rounded-xl border border-stone-200">
                {donation.description}
              </p>
            </div>
          )}

          {/* Donor & Location Details */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#E5EFE5]/40 border border-[#8BAF92]/20">
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#8BAF92]" />
              Donor Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-500">Donor Name:</span>{' '}
                <strong className="text-[#344E41]">{donation.donorName}</strong>
              </div>
              <div>
                <span className="text-stone-500">Donor Type:</span>{' '}
                <span className="text-[#344E41] font-medium">{donation.donorType}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-stone-500">Public Area:</span>{' '}
                <span className="text-[#344E41] font-medium">{donation.pickupLocation}</span>
              </div>
            </div>
          </div>

          {/* Allergen & Safety */}
          <div className="space-y-2 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Allergen Notice & Food Safety Standard
            </h4>
            <p className="text-[11px] leading-relaxed">
              <strong>Allergen Notice:</strong> {donation.allergens || 'None declared by donor.'}
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              MealMitra requires all recipients to inspect package temperature upon pickup. Reheat cooked items to 74°C (165°F) before serving.
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-[#344E41]/10">
            <button
              onClick={() => onReport(donation)}
              className="text-stone-500 hover:text-[#C97B63] flex items-center gap-1 text-xs transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Listing</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#373A36] hover:bg-stone-100 transition-colors"
              >
                Close
              </button>

              {!isOwner && (
                <button
                  disabled={isExpired || donation.quantity <= 0 || donation.status !== 'Available'}
                  onClick={() => {
                    onClose();
                    onRequest(donation);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                    isExpired || donation.quantity <= 0 || donation.status !== 'Available'
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      : 'bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41]'
                  }`}
                >
                  <span>Request This Food</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
