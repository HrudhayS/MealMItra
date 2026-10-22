import React, { useState, useEffect } from 'react';
import { DonationRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Bike, 
  MapPin, 
  Clock, 
  Package, 
  CheckCircle, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface VolunteerDispatchProps {
  onOpenMessages: (request: DonationRequest) => void;
}

export const VolunteerDispatch: React.FC<VolunteerDispatchProps> = ({ onOpenMessages }) => {
  const { currentUser, switchDemoUser } = useAuth();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRequests(currentUser);
      // Volunteers can assist with any Accepted or In-Transit requests
      setRequests(data.filter(r => ['Accepted', 'Collected', 'Completed'].includes(r.status)));
    } catch (err) {
      console.error('Failed to load volunteer board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const handleAssignVolunteer = async (requestId: string) => {
    try {
      setActionInProgress(requestId);
      await api.assignVolunteer(requestId, currentUser);
      await loadRequests();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: DonationRequest['status']) => {
    try {
      setActionInProgress(requestId);
      await api.updateRequestStatus(requestId, status, `Volunteer update by ${currentUser.displayName}`, currentUser);
      await loadRequests();
    } catch (err: any) {
      alert(`Status change failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#344E41]">Volunteer Transit & Dispatch</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E5EFE5] text-[#344E41] border border-[#8BAF92]/30">
              Community Couriers
            </span>
          </div>
          <p className="text-xs text-[#373A36]/70 mt-0.5">
            Assist shelters without transport vehicles by moving packed food donations across the city.
          </p>
        </div>

        {currentUser.role !== 'volunteer' && (
          <button
            onClick={() => switchDemoUser('volunteer_alex')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#C97B63]/15 text-[#C97B63] border border-[#C97B63]/40 hover:bg-[#C97B63]/25 transition-colors cursor-pointer"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Switch to Volunteer Persona (Alex Rivera)</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#344E41]/12 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Deliveries Ready for Pickup</span>
          <p className="text-2xl font-extrabold text-[#344E41] mt-1">
            {requests.filter(r => r.status === 'Accepted' && !r.volunteerId).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#344E41]/12 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Assigned to You</span>
          <p className="text-2xl font-extrabold text-[#344E41] mt-1">
            {requests.filter(r => r.volunteerId === currentUser.uid).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#344E41]/12 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Delivered Today</span>
          <p className="text-2xl font-extrabold text-[#344E41] mt-1">
            {requests.filter(r => ['Collected', 'Completed'].includes(r.status)).length}
          </p>
        </div>
      </div>

      {/* Dispatch Board Items */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#344E41]">Surplus Deliveries Needing Transport Assistance</h2>

        {loading ? (
          <div className="text-center py-12 text-xs text-stone-500">Loading dispatch items...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#344E41]/10 space-y-2">
            <Bike className="w-10 h-10 text-[#8BAF92] mx-auto opacity-70" />
            <h3 className="font-bold text-sm text-[#344E41]">No deliveries currently requiring volunteers</h3>
            <p className="text-xs text-[#373A36]/70">
              When an accepted donation needs transport assistance, it will show up here for you to claim.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const isAssignedToMe = req.volunteerId === currentUser.uid;
              const hasNoVolunteer = !req.volunteerId;

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#344E41]">{req.foodName}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E5EFE5] text-[#344E41]">
                        {req.requestedQuantity} {req.unit}
                      </span>
                    </div>

                    <div className="text-xs text-[#373A36] space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <MapPin className="w-3.5 h-3.5 text-[#8BAF92]" />
                        <span>
                          <strong>Pickup:</strong> {req.donorName} ➔ <strong>Dropoff:</strong> {req.recipientName} ({req.recipientOrgType})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#C97B63] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pickup Time: {new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {req.volunteerName && (
                        <p className="text-[11px] text-[#344E41] font-semibold mt-1">
                          Assigned Courier: {req.volunteerName} {isAssignedToMe ? '(You)' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenMessages(req)}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-[#E5EFE5] text-[#344E41] hover:bg-[#8BAF92]/30 transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#8BAF92]" />
                      <span>Chat Parties</span>
                    </button>

                    {hasNoVolunteer && (
                      <button
                        disabled={actionInProgress === req.id}
                        onClick={() => handleAssignVolunteer(req.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Claim Transport (Assign Me)</span>
                      </button>
                    )}

                    {isAssignedToMe && req.status === 'Accepted' && (
                      <button
                        disabled={actionInProgress === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'Collected')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#344E41] hover:bg-[#283d32] text-white shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <span>Mark Picked Up / In Transit</span>
                      </button>
                    )}

                    {isAssignedToMe && req.status === 'Collected' && (
                      <button
                        disabled={actionInProgress === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'Completed')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <span>Confirm Delivered to Shelter</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
