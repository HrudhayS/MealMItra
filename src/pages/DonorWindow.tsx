import React, { useState, useEffect } from 'react';
import { Donation, DonationRequest, FoodCategory, StorageCondition } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserProfileCard } from '../components/UserProfileCard';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  PlayCircle, 
  AlertCircle,
  MessageSquare,
  Check,
  Utensils,
  PackageCheck,
  Building,
  Info
} from 'lucide-react';

interface DonorWindowProps {
  onOpenMessages: (request: DonationRequest) => void;
  onEditDonation: (donation: Donation) => void;
  onNavigate?: (tab: string) => void;
}

export const DonorWindow: React.FC<DonorWindowProps> = ({
  onOpenMessages,
  onEditDonation,
  onNavigate,
}) => {
  const { currentUser, isAuthenticated } = useAuth();

  // Local state for donor's own surplus listings and inbound requests
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [inboundRequests, setInboundRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Real-time verification test state
  const [verifying, setVerifying] = useState(false);
  const [testResults, setTestResults] = useState<{
    allPassed: boolean;
    steps: Array<{ operation: string; passed: boolean; message: string }>;
    error?: string;
  } | null>(null);

  // Form state for posting surplus food details
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Cooked Meals' as FoodCategory,
    quantity: '',
    unit: 'portions',
    prepTime: new Date().toISOString().slice(0, 16),
    deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
    storageConditions: 'Heated/Insulated' as StorageCondition,
    pickupLocation: currentUser.location || '',
    pickupAddressDetails: currentUser.location || '',
    donorPhone: currentUser.phone || '',
    allergens: 'None',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Show auto-dismissing notification
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch only this donor's donations & inbound requests
  const loadDonorData = async () => {
    try {
      setLoading(true);
      const all = await api.getDonations({ status: 'All' });
      const mine = all.filter(d => d.donorId === currentUser.uid);
      setMyDonations(mine);

      const reqs = await api.getRequests(currentUser);
      setInboundRequests(reqs.filter(r => r.donorId === currentUser.uid));
    } catch (err: any) {
      console.error('Failed to load donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, [currentUser]);

  // Form submit handler to post surplus food details
  const handlePostFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foodName.trim()) {
      notify('error', 'Please specify the food item name.');
      return;
    }
    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      notify('error', 'Please provide a valid quantity greater than zero.');
      return;
    }
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= new Date()) {
      notify('error', 'Pickup deadline must be scheduled in the future.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createDonation({
        foodName: formData.foodName.trim(),
        category: formData.category,
        quantity: qty,
        unit: formData.unit,
        prepTime: new Date(formData.prepTime).toISOString(),
        deadline: deadlineDate.toISOString(),
        storageConditions: formData.storageConditions,
        pickupLocation: formData.pickupLocation.trim() || 'Central Kitchen',
        pickupAddressDetails: formData.pickupAddressDetails.trim() || formData.pickupLocation.trim(),
        allergens: formData.allergens.trim(),
        description: formData.description.trim(),
      }, currentUser);

      notify('success', `Surplus food "${formData.foodName}" published successfully in real-time!`);
      // Reset input fields
      setFormData({
        foodName: '',
        category: 'Cooked Meals',
        quantity: '',
        unit: 'portions',
        prepTime: new Date().toISOString().slice(0, 16),
        deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
        storageConditions: 'Heated/Insulated',
        pickupLocation: currentUser.location || '',
        pickupAddressDetails: currentUser.location || '',
        donorPhone: currentUser.phone || '',
        allergens: 'None',
        description: '',
      });
      await loadDonorData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to publish surplus food.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete own donation
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove your listing "${name}"?`)) return;
    try {
      setActionLoading(id);
      await api.deleteDonation(id, currentUser);
      notify('success', `Listing "${name}" removed.`);
      await loadDonorData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(null);
    }
  };

  // Update request status (Accept, Decline, Confirm Handover)
  const handleRequestStatus = async (requestId: string, status: DonationRequest['status']) => {
    try {
      setActionLoading(requestId);
      await api.updateRequestStatus(requestId, status, undefined, currentUser);
      notify('success', `Request updated to "${status}". Inventory updated automatically.`);
      await loadDonorData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to update request.');
    } finally {
      setActionLoading(null);
    }
  };

  // Real-Time System Controls: Wipe Data
  const handleClearData = async () => {
    if (!confirm('This will wipe all existing surplus donations and requests to start 100% fresh with 0 items. Continue?')) return;
    try {
      setActionLoading('clear');
      const res = await api.clearAllData();
      notify('info', res.message);
      setTestResults(null);
      await loadDonorData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to clear data.');
    } finally {
      setActionLoading(null);
    }
  };

  // Real-Time System Controls: Add Test Batch
  const handleAddTestBatch = async () => {
    try {
      setActionLoading('test-seed');
      const item = await api.seedTestDonation(currentUser);
      notify('success', `Real-time test batch "${item.foodName}" added!`);
      await loadDonorData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to add test batch.');
    } finally {
      setActionLoading(null);
    }
  };

  // Real-Time System Controls: Verify CRUD Operations
  const handleRunVerification = async () => {
    try {
      setVerifying(true);
      setTestResults(null);
      const res = await api.verifyCrudOperations(currentUser);
      setTestResults(res);
      if (res.allPassed) {
        notify('success', 'All operations verified successfully! Create, Read, Update, Reservation, and Delete working in real-time.');
      } else {
        notify('error', `Operations verification encountered an issue: ${res.error}`);
      }
      await loadDonorData();
    } catch (err: any) {
      notify('error', err.message || 'Verification test failed to run.');
    } finally {
      setVerifying(false);
    }
  };

  if (currentUser.role === 'recipient') {
    return (
      <div className="space-y-6 pb-16 animate-in fade-in">
        <UserProfileCard onNavigateToStation={() => onNavigate?.('browse')} />
        
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Building className="w-8 h-8 text-amber-700" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-[#344E41]">Recipient Organization Mode Active</h2>
            <p className="text-xs text-[#373A36]/80 leading-relaxed">
              You are signed in as a verified shelter (<strong>{currentUser.organizationName || currentUser.displayName}</strong>). 
              Recipient organizations view and claim surplus food batches listed by partner food donors rather than entering new surplus food listings.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate?.('browse')}
              className="bg-[#344E41] hover:bg-[#283d32] text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-[#8BAF92]" />
              <span>Browse Surplus Food Listed by Donors</span>
            </button>
            <button
              onClick={() => onNavigate?.('my-requests')}
              className="bg-[#E5EFE5] hover:bg-[#d5e7d5] text-[#344E41] font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Track My Shelter Claims
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Integrated User Profile Card */}
      <UserProfileCard />

      {/* Donor Header */}
      <div className="bg-[#344E41] text-[#FFF8ED] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8BAF92]/25 text-[#E5EFE5] text-xs font-semibold border border-[#8BAF92]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#8BAF92]" />
            <span>Food Donor Station</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Surplus Food Donation Console
          </h1>

          <p className="text-xs sm:text-sm text-[#FFF8ED]/85 leading-relaxed">
            Welcome, <strong>{isAuthenticated ? currentUser.displayName : 'Food Donor Partner'}</strong> {currentUser.organizationName ? `(${currentUser.organizationName})` : ''}. 
            Enter details about your surplus food below to immediately make it available to local shelters and orphanages.
          </p>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md transition-all ${
          notification.type === 'success' 
            ? 'bg-[#344E41] text-[#FFF8ED] border border-[#8BAF92]' 
            : notification.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#8BAF92]" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-amber-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Real-Time Database Controls & Operations Verifier */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#344E41]/15 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h3 className="text-sm font-bold text-[#344E41]">Real-Time Database Status</h3>
              <p className="text-[11px] text-[#373A36]/70">
                Seed data removed • Live posts: <strong>{myDonations.length}</strong> • Inbound requests: <strong>{inboundRequests.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunVerification}
              disabled={verifying}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#344E41] text-white hover:bg-[#283d32] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Runs an automated test of Create, Read, Update, Reserve, and Delete on real-time data"
            >
              <PlayCircle className={`w-3.5 h-3.5 text-[#8BAF92] ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Verifying Operations...' : 'Verify Live Operations'}</span>
            </button>

            <button
              onClick={handleAddTestBatch}
              disabled={actionLoading === 'test-seed'}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#8BAF92]/20 text-[#344E41] hover:bg-[#8BAF92]/30 border border-[#8BAF92]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#344E41]" />
              <span>Add Real-Time Test Batch</span>
            </button>

            <button
              onClick={handleClearData}
              disabled={actionLoading === 'clear'}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Wipes all items so you can test adding data from scratch"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Results Box from Operations Verification */}
        {testResults && (
          <div className="mt-3 bg-[#FFF8ED] rounded-2xl p-4 border border-[#8BAF92]/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#344E41]/10">
              <span className="text-xs font-bold text-[#344E41] flex items-center gap-1.5">
                {testResults.allPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                Live Real-Time Operations Diagnostic Report: {testResults.allPassed ? 'ALL OPERATIONS PASSED (100% CORRECT)' : 'OPERATION ISSUE DETECTED'}
              </span>
              <button onClick={() => setTestResults(null)} className="text-[11px] text-[#373A36]/60 hover:text-[#373A36]">
                Close Report
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {testResults.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#344E41]/10">
                  {step.passed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-[#344E41]">{step.operation}: </span>
                    <span className="text-[#373A36]/80">{step.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PRIMARY SECTION: Post Surplus Food Details Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#344E41]/15 shadow-sm space-y-6">
        <div className="border-b border-[#344E41]/10 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#344E41] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#8BAF92]" />
            Post Details About Surplus Food
          </h2>
          <p className="text-xs text-[#373A36]/70 mt-1">
            Fill in the information below to register your surplus food for immediate shelter pickup.
          </p>
        </div>

        <form onSubmit={handlePostFood} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Food Item Name */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Food Name / Dish Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Vegetable Pulao, Dal Makhani & Roti, Fresh Sandwiches"
                value={formData.foodName}
                onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Food Category */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Food Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodCategory })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy & Packaged">Dairy & Packaged</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts & Snacks">Desserts & Snacks</option>
              </select>
            </div>

            {/* Available Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Available Quantity *
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="e.g., 25"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Measurement Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              >
                <option value="portions">Portions / Meals</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="litres">Litres (L)</option>
                <option value="trays">Trays / Containers</option>
                <option value="packs">Packets / Boxes</option>
              </select>
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Preparation Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Pickup Deadline */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Pickup Expiration Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Storage Condition */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Storage Condition *
              </label>
              <select
                value={formData.storageConditions}
                onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value as StorageCondition })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              >
                <option value="Hot Held (>60°C)">Hot Held (&gt;60°C)</option>
                <option value="Refrigerated (<4°C)">Refrigerated (&lt;4°C)</option>
                <option value="Room Temperature">Room Temperature</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Donor Contact Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g., +1 (555) 234-5678"
                value={formData.donorPhone}
                onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Pickup Location */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Pickup Location & Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Green Olive Bistro, Downtown Market District, Gate 4"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  pickupLocation: e.target.value,
                  pickupAddressDetails: e.target.value
                })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Allergens & Dietary */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Allergens / Dietary Information
              </label>
              <input
                type="text"
                placeholder="e.g., Pure Vegetarian, Contains Dairy, Nut-Free"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-[#344E41] mb-1.5">
                Packaging / Special Handling Notes
              </label>
              <input
                type="text"
                placeholder="e.g., Packed in insulated trays, please bring thermal carrier bag"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#FFF8ED] border border-[#344E41]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#373A36] focus:outline-none focus:ring-2 focus:ring-[#8BAF92]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing Details...' : 'Publish Surplus Food Listing'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION: My Posted Surplus Food (Only this Donor's Listings) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#344E41]/15 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#344E41]/10">
          <div>
            <h2 className="text-lg font-bold text-[#344E41] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#8BAF92]" />
              My Posted Surplus Food Listings ({myDonations.length})
            </h2>
            <p className="text-xs text-[#373A36]/70">
              Only your surplus food listings are displayed here. You can edit quantities or remove listings.
            </p>
          </div>

          <button
            onClick={loadDonorData}
            className="text-xs font-semibold text-[#344E41] hover:text-[#8BAF92] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-stone-500">Loading your surplus listings...</div>
        ) : myDonations.length === 0 ? (
          <div className="py-10 text-center bg-[#FFF8ED] rounded-2xl border border-dashed border-[#344E41]/20 p-6 space-y-2">
            <Utensils className="w-8 h-8 text-[#8BAF92] mx-auto opacity-70" />
            <h4 className="font-bold text-sm text-[#344E41]">No surplus listings posted yet</h4>
            <p className="text-xs text-[#373A36]/70 max-w-md mx-auto">
              Your donation history is completely clean. Use the form above or click "Add Real-Time Test Batch" to add your first real-time post!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myDonations.map((d) => (
              <div 
                key={d.id} 
                className="bg-[#FFF8ED] rounded-2xl p-4 sm:p-5 border border-[#344E41]/15 space-y-3 relative hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#344E41] text-[#FFF8ED]">
                      {d.category}
                    </span>
                    <h3 className="text-base font-bold text-[#344E41] mt-1.5">{d.foodName}</h3>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    d.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : d.status === 'Reserved'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-stone-200 text-stone-800 border-stone-300'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#373A36]/80 pt-1">
                  <div>
                    <span className="text-[#373A36]/60 text-[11px] block">Remaining Quantity:</span>
                    <span className="font-bold text-[#344E41] text-sm">{d.quantity} {d.unit}</span>
                  </div>
                  <div>
                    <span className="text-[#373A36]/60 text-[11px] block">Storage:</span>
                    <span className="font-medium">{d.storageConditions}</span>
                  </div>
                  <div>
                    <span className="text-[#373A36]/60 text-[11px] block">Pickup Deadline:</span>
                    <span className="font-medium text-amber-900">{new Date(d.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="text-[#373A36]/60 text-[11px] block">Location:</span>
                    <span className="font-medium truncate block">{d.pickupLocation}</span>
                  </div>
                </div>

                {d.description && (
                  <p className="text-xs text-[#373A36]/75 italic bg-white/70 p-2 rounded-xl border border-[#344E41]/10">
                    "{d.description}"
                  </p>
                )}

                {/* Listing Action Controls */}
                <div className="pt-2 border-t border-[#344E41]/10 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditDonation(d)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#344E41] hover:bg-white transition-colors border border-[#344E41]/15 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(d.id, d.foodName)}
                    disabled={actionLoading === d.id}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: Inbound Requests for this Donor's Food */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#344E41]/15 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#344E41]/10">
          <div>
            <h2 className="text-lg font-bold text-[#344E41] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#8BAF92]" />
              Inbound Requests from Shelters ({inboundRequests.length})
            </h2>
            <p className="text-xs text-[#373A36]/70">
              Review and confirm food handover when verified orphanages and NGOs request your surplus food.
            </p>
          </div>
        </div>

        {inboundRequests.length === 0 ? (
          <div className="py-8 text-center bg-[#FFF8ED] rounded-2xl border border-[#344E41]/10 text-xs text-[#373A36]/70">
            No active requests received yet. When a shelter reserves portions from your listings, they will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {inboundRequests.map((req) => (
              <div 
                key={req.id} 
                className="bg-[#FFF8ED] rounded-2xl p-4 sm:p-5 border border-[#344E41]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#344E41]">{req.recipientName}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border font-semibold text-[#373A36]/70">
                      {req.recipientOrgType}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-200 text-stone-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#373A36]">
                    Requested: <strong>{req.requestedQuantity} {req.unit}</strong> of <em>{req.foodName}</em>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#373A36]/70 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8BAF92]" />
                      Pickup Time: {new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#8BAF92]" />
                      {req.recipientPhone}
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-[#373A36]/80 italic pt-0.5">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onOpenMessages(req)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#344E41]/15 text-[#344E41] hover:bg-[#E5EFE5] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>Chat</span>
                  </button>

                  {req.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleRequestStatus(req.id, 'Accepted')}
                        disabled={actionLoading === req.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8BAF92] text-[#344E41] hover:bg-[#789d7f] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => handleRequestStatus(req.id, 'Declined')}
                        disabled={actionLoading === req.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === 'Accepted' && (
                    <button
                      onClick={() => handleRequestStatus(req.id, 'Completed')}
                      disabled={actionLoading === req.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirm Handover</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Reference for Food Donors */}
      <div className="bg-[#E5EFE5]/50 border border-[#8BAF92]/40 rounded-3xl p-5 text-xs text-[#344E41] space-y-1.5">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#8BAF92]" />
          <span>MealMitra Food Donor Quality Standards</span>
        </div>
        <p className="text-[#373A36]/80 text-[11px] leading-relaxed">
          Ensure surplus food is packed clean in food-safe containers. Hot foods must be held above 60°C and cold foods below 4°C. Donated items must never include spoiled, re-served, or unhygienic leftovers.
        </p>
      </div>
    </div>
  );
};
