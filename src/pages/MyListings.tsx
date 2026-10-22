import React, { useState, useEffect } from 'react';
import { Donation, DonationRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  ExternalLink,
  PlusCircle,
  AlertCircle,
  Check
} from 'lucide-react';

interface MyListingsProps {
  onOpenCreateDonation: () => void;
  onEditDonation: (donation: Donation) => void;
  onOpenMessages: (request: DonationRequest) => void;
}

export const MyListings: React.FC<MyListingsProps> = ({
  onOpenCreateDonation,
  onEditDonation,
  onOpenMessages,
}) => {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'listings'>('requests');
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [inboundRequests, setInboundRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch all donations to filter own
      const allDonations = await api.getDonations({ status: 'All' });
      const mine = allDonations.filter(d => d.donorId === currentUser.uid);
      setMyDonations(mine);

      // Fetch requests directed to this donor
      const requests = await api.getRequests(currentUser);
      setInboundRequests(requests.filter(r => r.donorId === currentUser.uid));
    } catch (err) {
      console.error('Failed to load donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleUpdateStatus = async (
    requestId: string,
    status: DonationRequest['status'],
    notes?: string
  ) => {
    try {
      setActionInProgress(requestId);
      await api.updateRequestStatus(requestId, status, notes, currentUser);
      await loadData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this surplus food listing?')) return;
    try {
      await api.deleteDonation(id, currentUser);
      await loadData();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#344E41]">Donor Management Console</h1>
          <p className="text-xs text-[#373A36]/70 mt-0.5">
            Manage your surplus food listings and respond to requests from verified shelters and orphanages.
          </p>
        </div>

        <button
          onClick={onOpenCreateDonation}
          className="flex items-center gap-2 bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Surplus Food</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#344E41]/10">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3 text-xs font-semibold px-3 transition-colors relative cursor-pointer ${
            activeSubTab === 'requests'
              ? 'text-[#344E41] border-b-2 border-[#8BAF92]'
              : 'text-[#373A36]/60 hover:text-[#344E41]'
          }`}
        >
          <span>Inbound Requests from Shelters</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-[#E5EFE5] text-[#344E41]">
            {inboundRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('listings')}
          className={`pb-3 text-xs font-semibold px-3 transition-colors relative cursor-pointer ${
            activeSubTab === 'listings'
              ? 'text-[#344E41] border-b-2 border-[#8BAF92]'
              : 'text-[#373A36]/60 hover:text-[#344E41]'
          }`}
        >
          <span>My Published Surplus Listings</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700">
            {myDonations.length}
          </span>
        </button>
      </div>

      {/* SubTab 1: Inbound Requests */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs text-stone-500">Loading incoming requests...</div>
          ) : inboundRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#344E41]/10 space-y-2">
              <Inbox className="w-10 h-10 text-[#8BAF92] mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-[#344E41]">No incoming requests right now</h3>
              <p className="text-xs text-[#373A36]/70">
                When a shelter, orphanage, or NGO requests your surplus food, their request details will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {inboundRequests.map((req) => {
                const isPending = req.status === 'Pending';
                const isAccepted = req.status === 'Accepted';
                const isCompleted = ['Collected', 'Completed'].includes(req.status);

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-5 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Organization & Food Info */}
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#344E41]">
                          {req.foodName}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          req.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Requested {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-xs text-[#373A36] space-y-1">
                        <p>
                          Requesting Organization: <strong className="text-[#344E41]">{req.recipientName}</strong> ({req.recipientOrgType})
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-stone-600">
                          <span className="font-semibold text-[#344E41]">
                            Claiming: {req.requestedQuantity} {req.unit}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#C97B63] font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Pickup time: {new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {req.recipientPhone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-[#8BAF92]" />
                                {req.recipientPhone}
                              </span>
                            </>
                          )}
                        </div>

                        {req.notes && (
                          <p className="text-[11px] italic bg-[#FFF8ED] p-2 rounded-lg border border-[#344E41]/10 text-[#373A36]/80 mt-1">
                            "{req.notes}"
                          </p>
                        )}

                        {req.volunteerName && (
                          <p className="text-[11px] text-[#8BAF92] font-semibold">
                            Volunteer Assigned for Transport: {req.volunteerName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Open Chat & WhatsApp */}
                      <button
                        onClick={() => onOpenMessages(req)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E5EFE5] text-[#344E41] hover:bg-[#8BAF92]/30 transition-colors"
                        title="Open in-app messaging or WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 text-[#8BAF92]" />
                        <span>Chat & WhatsApp</span>
                      </button>

                      {/* Pending state: Accept / Decline */}
                      {isPending && (
                        <>
                          <button
                            disabled={actionInProgress === req.id}
                            onClick={() => handleUpdateStatus(req.id, 'Accepted', 'Accepted by kitchen manager')}
                            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept Request</span>
                          </button>

                          <button
                            disabled={actionInProgress === req.id}
                            onClick={() => handleUpdateStatus(req.id, 'Declined', 'Unavailable or expired')}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {/* Accepted state: Mark Collected / Completed */}
                      {isAccepted && (
                        <button
                          disabled={actionInProgress === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'Completed', 'Food handed over successfully')}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#344E41] hover:bg-[#283d32] text-white shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 text-[#8BAF92]" />
                          <span>Confirm Handover Completed</span>
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          Handover Finished
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: My Listings */}
      {activeSubTab === 'listings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs text-stone-500">Loading listings...</div>
          ) : myDonations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#344E41]/10 space-y-2">
              <Package className="w-10 h-10 text-[#8BAF92] mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-[#344E41]">You have not published any surplus listings yet</h3>
              <p className="text-xs text-[#373A36]/70">
                Post leftover cooked meals, baked bread, or produce to prevent waste.
              </p>
              <button
                onClick={onOpenCreateDonation}
                className="mt-2 bg-[#8BAF92] text-[#344E41] font-semibold px-4 py-2 rounded-xl text-xs"
              >
                Post First Donation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myDonations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5EFE5] text-[#344E41]">
                        {item.category}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-[#344E41]">
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#344E41]">{item.foodName}</h3>
                    
                    <div className="text-xs text-[#373A36] space-y-1">
                      <p>
                        Quantity: <strong>{item.quantity} {item.unit}</strong> remaining (of {item.originalQuantity})
                      </p>
                      <p className="text-stone-500">
                        Pickup Deadline: {new Date(item.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(item.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                      </p>
                      <p className="text-stone-500 truncate">
                        Location: {item.pickupLocation}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#344E41]/10 flex items-center justify-end gap-2 mt-4">
                    <button
                      onClick={() => onEditDonation(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#344E41] hover:bg-[#E5EFE5] transition-colors"
                    >
                      Edit Listing
                    </button>
                    <button
                      onClick={() => handleDeleteDonation(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
