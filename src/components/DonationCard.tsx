import React from 'react';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  MapPin, 
  ShieldAlert, 
  PackageCheck, 
  Thermometer, 
  AlertTriangle,
  ArrowRight,
  Edit2,
  Trash2,
  Flag
} from 'lucide-react';

interface DonationCardProps {
  donation: Donation;
  onRequest: (donation: Donation) => void;
  onViewDetails: (donation: Donation) => void;
  onEdit?: (donation: Donation) => void;
  onDelete?: (donation: Donation) => void;
  onReport?: (donation: Donation) => void;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onRequest,
  onViewDetails,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { currentUser } = useAuth();
  const isOwner = currentUser.uid === donation.donorId;

  // Deadline calculation
  const deadlineDate = new Date(donation.deadline);
  const now = new Date();
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isUrgent = diffHours > 0 && diffHours <= 3;
  const isExpired = diffHours <= 0 || donation.status === 'Expired';

  const formatDeadline = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
        ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch {
      return dateStr;
    }
  };

  const getStorageBadge = (storage: string) => {
    switch (storage) {
      case 'Refrigerated':
        return { label: 'Refrigerated (2-5°C)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'Heated/Insulated':
        return { label: 'Heated Holding (60°C+)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'Frozen':
        return { label: 'Frozen (-18°C)', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      default:
        return { label: 'Room Temperature', color: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  const storageBadge = getStorageBadge(donation.storageConditions);

  return (
    <div className="bg-white rounded-2xl border border-[#344E41]/12 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Card Header & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#E5EFE5] text-[#344E41] border border-[#8BAF92]/30">
            {donation.category}
          </span>

          {isUrgent && !isExpired && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#C97B63]/15 text-[#C97B63] border border-[#C97B63]/30 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Pickup Urgent (&lt;3 hrs)
            </span>
          )}

          {isExpired && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
              Expired
            </span>
          )}

          {!isUrgent && !isExpired && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              donation.status === 'Available'
                ? 'bg-[#8BAF92]/20 text-[#344E41] border-[#8BAF92]/40'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {donation.status}
            </span>
          )}
        </div>

        {/* Food Title */}
        <h3 className="text-lg font-bold text-[#344E41] group-hover:text-[#8BAF92] transition-colors leading-snug mb-1">
          {donation.foodName}
        </h3>

        {/* Quantity Callout */}
        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#344E41] bg-[#FFF8ED] px-2.5 py-1 rounded-lg border border-[#344E41]/10 my-1">
          <PackageCheck className="w-4 h-4 text-[#8BAF92]" />
          <span>
            {donation.quantity} {donation.unit} available
          </span>
          {donation.originalQuantity && donation.originalQuantity !== donation.quantity && (
            <span className="text-xs text-[#373A36]/50 font-normal">
              (of {donation.originalQuantity} originally)
            </span>
          )}
        </div>

        {/* Donor identity */}
        <p className="text-xs text-[#373A36]/80 flex items-center gap-1 mt-1">
          <span className="font-medium text-[#344E41]">{donation.donorName}</span>
          <span className="text-stone-400">•</span>
          <span className="text-[#373A36]/70">{donation.donorType}</span>
        </p>

        {/* Description snippet */}
        {donation.description && (
          <p className="text-xs text-[#373A36]/80 mt-2 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>
        )}
      </div>

      {/* Logistics & Safety Details */}
      <div className="px-5 py-3 bg-[#FFF8ED]/40 border-t border-[#344E41]/8 space-y-2 text-xs">
        {/* General Location */}
        <div className="flex items-center gap-2 text-[#373A36]">
          <MapPin className="w-3.5 h-3.5 text-[#8BAF92] shrink-0" />
          <span className="truncate">{donation.pickupLocation}</span>
        </div>

        {/* Pickup Deadline */}
        <div className={`flex items-center gap-2 ${isUrgent ? 'text-[#C97B63] font-semibold' : 'text-[#373A36]'}`}>
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Deadline: {formatDeadline(donation.deadline)}</span>
        </div>

        {/* Storage & Allergens */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${storageBadge.color}`}>
            <Thermometer className="w-3 h-3" />
            {storageBadge.label}
          </span>

          {donation.allergens && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
              <ShieldAlert className="w-3 h-3 text-stone-500" />
              {donation.allergens}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-white border-t border-[#344E41]/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails(donation)}
            className="text-xs text-[#344E41] hover:text-[#8BAF92] font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Details & Safety
          </button>

          {onReport && (
            <button
              onClick={() => onReport(donation)}
              className="p-1 text-stone-400 hover:text-[#C97B63] transition-colors ml-1"
              title="Report food safety or listing concern"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isOwner ? (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(donation)}
                className="p-1.5 rounded-lg text-[#344E41] hover:bg-[#E5EFE5] transition-colors cursor-pointer"
                title="Edit listing"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(donation)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            disabled={isExpired || donation.quantity <= 0 || donation.status !== 'Available'}
            onClick={() => onRequest(donation)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              isExpired || donation.quantity <= 0 || donation.status !== 'Available'
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] hover:shadow'
            }`}
          >
            <span>Request Food</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
