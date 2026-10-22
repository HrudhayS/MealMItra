import React, { useState, useEffect } from 'react';
import { DonationRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Inbox, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  CheckCircle, 
  Building2, 
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

interface MyRequestsProps {
  onOpenMessages: (request: DonationRequest) => void;
  onExploreDonations: () => void;
}

export const MyRequests: React.FC<MyRequestsProps> = ({
  onOpenMessages,
  onExploreDonations,
}) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRequests(currentUser);
      // Filter for requests created by this recipient
      setRequests(data.filter(r => r.recipientId === currentUser.uid));
    } catch (err) {
      console.error('Failed to load recipient requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const handleMarkCollected = async (requestId: string) => {
    try {
      setActionInProgress(requestId);
      await api.updateRequestStatus(requestId, 'Collected', 'Recipient confirmed food collected and inspected.', currentUser);
      await loadRequests();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#344E41]">My Organization Requests & Pickups</h1>
          <p className="text-xs text-[#373A36]/70 mt-0.5">
            Track claims, coordinate collection, and unlock donor pickup addresses.
          </p>
        </div>

        <button
          onClick={onExploreDonations}
          className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
        >
          Find More Surplus Food
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-stone-500">Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#344E41]/10 space-y-3">
          <Inbox className="w-10 h-10 text-[#8BAF92] mx-auto opacity-70" />
          <h3 className="font-bold text-base text-[#344E41]">No active donation claims</h3>
          <p className="text-xs text-[#373A36]/70 max-w-sm mx-auto leading-relaxed">
            Your shelter or orphanage hasn't submitted any food requests yet. Browse available surplus batches and claim meals for your community.
          </p>
          <button
            onClick={onExploreDonations}
            className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#8BAF92] text-[#344E41] hover:bg-[#789d7f] transition-colors"
          >
            Explore Available Food Listings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isAccepted = req.status === 'Accepted';
            const isPending = req.status === 'Pending';
            const isCollected = ['Collected', 'Completed'].includes(req.status);
            const isDeclined = req.status === 'Declined';

            // WhatsApp link
            const cleanPhone = (req.donorPhone || '+15552345678').replace(/[^0-9+]/g, '');
            const waMsg = encodeURIComponent(
              `Hello ${req.donorName}! This is ${currentUser.displayName}. We are coordinating pickup for the "${req.foodName}" reservation (${req.requestedQuantity} ${req.unit}).`
            );

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Request Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#344E41]">{req.foodName}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isAccepted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isDeclined
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#373A36]/70 mt-1">
                      Provided by: <strong className="text-[#344E41]">{req.donorName}</strong>
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-bold text-[#344E41]">
                      {req.requestedQuantity} {req.unit} reserved
                    </span>
                    <p className="text-stone-400 text-[11px]">
                      Submitted: {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Logistics details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FFF8ED]/40 p-3.5 rounded-xl border border-[#344E41]/8">
                  <div className="flex items-center gap-2 text-[#373A36]">
                    <Clock className="w-4 h-4 text-[#8BAF92]" />
                    <span>
                      Scheduled Collection: <strong>{new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({new Date(req.pickupTime).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </span>
                  </div>

                  {req.volunteerName ? (
                    <div className="flex items-center gap-2 text-[#344E41] font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#8BAF92]" />
                      <span>Volunteer Assigned: <strong>{req.volunteerName}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-stone-500">
                      <span>Transport: Direct organization pickup</span>
                    </div>
                  )}
                </div>

                {/* If Accepted: Protected Instructions Unlocked */}
                {isAccepted && (
                  <div className="bg-[#E5EFE5]/50 p-4 rounded-xl border border-[#8BAF92]/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#344E41]">
                      <ShieldCheck className="w-4 h-4 text-[#8BAF92]" />
                      <span>Request Approved! Pickup Address & Direct Contacts Unlocked:</span>
                    </div>
                    
                    <p className="text-xs text-[#373A36]">
                      📍 <strong>Donor Location / Loading Bay:</strong> Back delivery bay, 412 Market St (Downtown District). Please notify donor upon parking.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors shadow-2xs text-xs"
                      >
                        <span>WhatsApp Donor</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#344E41] text-[#FFF8ED] font-medium hover:bg-[#283d32] transition-colors shadow-2xs text-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#8BAF92]" />
                        <span>Call Donor ({req.donorPhone || '+1 (555) 234-5678'})</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#344E41]/10">
                  <button
                    onClick={() => onOpenMessages(req)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#344E41] hover:text-[#8BAF92] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#8BAF92]" />
                    <span>Open In-App Messages</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isAccepted && (
                      <button
                        disabled={actionInProgress === req.id}
                        onClick={() => handleMarkCollected(req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] shadow-xs cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm We Received Food</span>
                      </button>
                    )}

                    {isCollected && (
                      <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Collected & Distributed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
