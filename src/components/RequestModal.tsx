import React, { useState } from 'react';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle, Clock, Package, MapPin, Building, ShieldCheck } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  onSubmit: (data: {
    donationId: string;
    requestedQuantity: number;
    pickupTime: string;
    notes?: string;
    recipientPhone?: string;
  }) => Promise<void>;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  donation,
  onSubmit,
}) => {
  const { currentUser } = useAuth();
  const [requestedQuantity, setRequestedQuantity] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>(currentUser.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default quantity to donation available quantity
  React.useEffect(() => {
    if (donation) {
      setRequestedQuantity(String(donation.quantity));
      // Default pickup time: 1.5 hours from now or 30 min before deadline
      const defaultTime = new Date(Date.now() + 1.5 * 3600 * 1000);
      setPickupTime(defaultTime.toISOString().slice(0, 16));
      setNotes(`Requesting for ${currentUser.organizationName || 'our community shelter'}. We have insulated containers ready.`);
      setPhone(currentUser.phone || '');
      setError(null);
    }
  }, [donation, currentUser]);

  if (!isOpen || !donation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseFloat(requestedQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid requested quantity greater than 0.');
      return;
    }

    if (qty > donation.quantity) {
      setError(`Cannot request ${qty} ${donation.unit}. Only ${donation.quantity} ${donation.unit} are currently available.`);
      return;
    }

    if (!pickupTime) {
      setError('Please specify your intended collection time.');
      return;
    }

    const timeDate = new Date(pickupTime);
    if (timeDate <= new Date()) {
      setError('Collection time must be scheduled in the future.');
      return;
    }

    const deadlineDate = new Date(donation.deadline);
    if (timeDate > deadlineDate) {
      setError(`Collection time cannot be later than the donor's pickup deadline (${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        donationId: donation.id,
        requestedQuantity: qty,
        pickupTime: timeDate.toISOString(),
        notes: notes.trim(),
        recipientPhone: phone.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#344E41]/15 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFF8ED] border-b border-[#344E41]/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#344E41]">Request Surplus Food Donation</h2>
            <p className="text-xs text-[#373A36]/70">Coordinate collection with {donation.donorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#373A36]/60 hover:text-[#344E41] hover:bg-[#344E41]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Food Item Summary */}
        <div className="p-5 bg-[#E5EFE5]/40 border-b border-[#344E41]/10 text-xs space-y-1.5">
          <div className="font-bold text-sm text-[#344E41]">{donation.foodName}</div>
          <div className="flex flex-wrap items-center gap-3 text-[#373A36]">
            <span className="flex items-center gap-1 font-semibold text-[#344E41]">
              <Package className="w-3.5 h-3.5 text-[#8BAF92]" />
              {donation.quantity} {donation.unit} available
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8BAF92]" />
              {donation.pickupLocation}
            </span>
            <span className="flex items-center gap-1 text-[#C97B63] font-medium">
              <Clock className="w-3.5 h-3.5" />
              Deadline: {new Date(donation.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Requested Quantity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344E41]">
              Quantity Needed ({donation.unit}) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                min="1"
                max={donation.quantity}
                required
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
              />
              <button
                type="button"
                onClick={() => setRequestedQuantity(String(donation.quantity))}
                className="text-xs px-2.5 py-2 rounded-xl border border-[#8BAF92] text-[#344E41] bg-[#E5EFE5] hover:bg-[#8BAF92]/30 font-medium shrink-0"
              >
                Take All ({donation.quantity})
              </button>
            </div>
            <p className="text-[11px] text-[#373A36]/60">
              You can claim partial portions or the entire batch according to your shelter's capacity.
            </p>
          </div>

          {/* Proposed Collection Time */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344E41] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8BAF92]" />
              Estimated Pickup Time *
            </label>
            <input
              type="datetime-local"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344E41]">
              Recipient Coordinator Phone Number (for WhatsApp / Call coordination) *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344E41]">
              Notes for Donor (Beneficiaries, transportation type)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Serving dinner for 40 children at Hope Children's Home. We will bring clean insulated soup totes."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
            />
          </div>

          <div className="pt-3 border-t border-[#344E41]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#373A36] hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : 'Confirm & Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
