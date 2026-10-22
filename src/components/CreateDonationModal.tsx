import React, { useState, useEffect } from 'react';
import { Donation, FoodCategory, StorageCondition } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle, Sparkles, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface CreateDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Donation>) => Promise<void>;
  initialData?: Donation | null;
}

const CATEGORIES: FoodCategory[] = [
  'Cooked Meals',
  'Bakery & Bread',
  'Fresh Produce',
  'Dairy & Packaged',
  'Beverages',
  'Desserts & Snacks',
];

const STORAGE_CONDITIONS: StorageCondition[] = [
  'Refrigerated',
  'Room Temperature',
  'Heated/Insulated',
  'Frozen',
];

export const CreateDonationModal: React.FC<CreateDonationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState('meals');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupAddressDetails, setPickupAddressDetails] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [storageConditions, setStorageConditions] = useState<StorageCondition>('Heated/Insulated');
  const [allergens, setAllergens] = useState('Contains Gluten, Dairy. Vegetarian.');

  // Set default future deadline (+4 hours)
  useEffect(() => {
    if (initialData) {
      setFoodName(initialData.foodName);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setQuantity(String(initialData.quantity));
      setUnit(initialData.unit);
      setPickupLocation(initialData.pickupLocation);
      setPickupAddressDetails(initialData.pickupAddressDetails || '');
      setPrepTime(initialData.prepTime ? initialData.prepTime.slice(0, 16) : '');
      setDeadline(initialData.deadline ? initialData.deadline.slice(0, 16) : '');
      setStorageConditions(initialData.storageConditions);
      setAllergens(initialData.allergens || '');
    } else {
      // Default new listing values
      setFoodName('');
      setDescription('');
      setCategory('Cooked Meals');
      setQuantity('30');
      setUnit('meals');
      setPickupLocation(currentUser.location || 'Central City Market Area');
      setPickupAddressDetails('');
      
      const now = new Date();
      setPrepTime(now.toISOString().slice(0, 16));
      
      // Default 4 hours from now
      const defaultDeadline = new Date(Date.now() + 4 * 3600 * 1000);
      setDeadline(defaultDeadline.toISOString().slice(0, 16));
      setStorageConditions('Heated/Insulated');
      setAllergens('Nut-Free, Vegetarian friendly.');
    }
    setError(null);
  }, [initialData, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!foodName.trim()) {
      setError('Food name is required.');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Available quantity must be a positive number.');
      return;
    }

    if (!deadline) {
      setError('Pickup deadline is required.');
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      setError('Pickup deadline must be set in the future.');
      return;
    }

    if (!pickupLocation.trim()) {
      setError('General pickup location is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        foodName: foodName.trim(),
        description: description.trim(),
        category,
        quantity: qty,
        unit,
        pickupLocation: pickupLocation.trim(),
        pickupAddressDetails: pickupAddressDetails.trim() || pickupLocation.trim(),
        prepTime: prepTime ? new Date(prepTime).toISOString() : new Date().toISOString(),
        deadline: deadlineDate.toISOString(),
        storageConditions,
        allergens: allergens.trim(),
        donorType: currentUser.organizationType || 'Food Donor',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit surplus food listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#344E41]/15 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-[#FFF8ED] border-b border-[#344E41]/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-[#344E41]">
              {initialData ? 'Edit Surplus Food Listing' : 'Publish Surplus Food for Rescue'}
            </h2>
            <p className="text-xs text-[#373A36]/70 mt-0.5">
              Connect clean excess food to local shelters and orphanages.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#373A36]/60 hover:text-[#344E41] hover:bg-[#344E41]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authenticated Donor Profile Summary Banner */}
        <div className="bg-[#E5EFE5]/60 border-b border-[#8BAF92]/20 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#344E41]">
            <span className="font-semibold">Donor Account:</span>
            <span>{currentUser.organizationName || currentUser.displayName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#8BAF92]/30 font-medium">
              {currentUser.organizationType || 'Restaurant'}
            </span>
          </div>
          <span className="text-[11px] text-[#373A36]/70 hidden sm:inline">
            Phone: {currentUser.phone || 'Auto-linked'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41]">
                Food Title / Item Name *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Steamed Rice & Dal, Assorted Sandwich Platters"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41]">
                Available Quantity *
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 40"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41]">
                Unit of Measurement *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm bg-white"
              >
                <option value="meals">meals / individual portions</option>
                <option value="kg">kg (kilograms)</option>
                <option value="loaves">loaves / bakery units</option>
                <option value="boxes">boxes / crates</option>
                <option value="litres">litres (soup/beverage)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344E41]">
              Description & Packaging Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly prepared ingredients, packaging type (aluminum containers, food-grade totes), freshness guarantee..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
            />
          </div>

          {/* Timings: Prep Time & Pickup Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF8ED]/50 p-3.5 rounded-xl border border-[#344E41]/10">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8BAF92]" />
                Prepared / Cooked Time
              </label>
              <input
                type="datetime-local"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#C97B63] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C97B63]" />
                Must Collect By (Deadline) *
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#C97B63]/40 focus:outline-none focus:ring-2 focus:ring-[#C97B63] text-xs bg-white"
              />
            </div>
          </div>

          {/* Storage & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41]">
                Storage Conditions *
              </label>
              <select
                value={storageConditions}
                onChange={(e) => setStorageConditions(e.target.value as StorageCondition)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm bg-white"
              >
                {STORAGE_CONDITIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8BAF92]" />
                Allergen & Dietary Declarations
              </label>
              <input
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="e.g. Vegetarian, Nut-Free, Contains Dairy, Gluten"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
              />
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8BAF92]" />
                Public Pickup Area / Neighborhood *
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Downtown Market District (Near City Hall)"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
              />
              <p className="text-[11px] text-[#373A36]/60">
                Shown publicly on discovery cards so recipients know general transit distance.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344E41]">
                Exact Pickup Street Address & Instructions (Private)
              </label>
              <input
                type="text"
                value={pickupAddressDetails}
                onChange={(e) => setPickupAddressDetails(e.target.value)}
                placeholder="e.g. Back kitchen loading dock #3, 412 Market St, Ring bell labeled Kitchen"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-sm"
              />
              <p className="text-[11px] text-[#373A36]/60">
                Protected: revealed ONLY to verified recipients whose requests you approve.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#344E41]/10 flex items-center justify-end gap-3">
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
              {submitting ? 'Publishing...' : initialData ? 'Save Changes' : 'Post Surplus Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
