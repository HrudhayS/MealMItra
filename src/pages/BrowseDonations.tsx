import React, { useState, useEffect } from 'react';
import { Donation, FoodCategory } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DonationCard } from '../components/DonationCard';
import { 
  Search, 
  Filter, 
  Utensils, 
  MapPin, 
  Clock, 
  Thermometer, 
  RotateCcw,
  PlusCircle,
  Building2,
  ShieldCheck
} from 'lucide-react';

interface BrowseDonationsProps {
  onRequestDonation: (donation: Donation) => void;
  onViewDonationDetails: (donation: Donation) => void;
  onEditDonation: (donation: Donation) => void;
  onDeleteDonation: (donation: Donation) => void;
  onReportDonation: (donation: Donation) => void;
  onOpenCreateDonation: () => void;
}

const CATEGORIES = [
  'All',
  'Cooked Meals',
  'Bakery & Bread',
  'Fresh Produce',
  'Dairy & Packaged',
  'Beverages',
  'Desserts & Snacks',
];

const STORAGE_OPTIONS = ['All', 'Refrigerated', 'Room Temperature', 'Heated/Insulated', 'Frozen'];

export const BrowseDonations: React.FC<BrowseDonationsProps> = ({
  onRequestDonation,
  onViewDonationDetails,
  onEditDonation,
  onDeleteDonation,
  onReportDonation,
  onOpenCreateDonation,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStorage, setSelectedStorage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Available');
  const [sortBy, setSortBy] = useState<'deadline' | 'quantity' | 'newest'>('deadline');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await api.getDonations({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        storage: selectedStorage !== 'All' ? selectedStorage : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      });

      // Sorting
      let sorted = [...data];
      if (sortBy === 'deadline') {
        sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      } else if (sortBy === 'quantity') {
        sorted.sort((a, b) => b.quantity - a.quantity);
      } else if (sortBy === 'newest') {
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }

      setDonations(sorted);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [search, selectedCategory, selectedStorage, selectedStatus, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStorage('All');
    setSelectedStatus('Available');
    setSortBy('deadline');
  };

  const isDonor = isAuthenticated && currentUser.role === 'donor';
  const isRecipient = isAuthenticated && currentUser.role === 'recipient';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Title & Discovery Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#344E41]">Discover Surplus Food</h1>
            {isRecipient && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Recipient Shelter Mode</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#373A36]/70 mt-0.5">
            {isRecipient 
              ? 'Real-time feed of available excess food from verified donor restaurants, cafeterias, and caterers ready for shelter claim.'
              : 'Real-time feed of available excess food from restaurants, campus dining, and event hosts.'}
          </p>
        </div>

        {/* ONLY Food Donors can post new donations - recipients cannot enter surplus food */}
        {isDonor ? (
          <button
            onClick={onOpenCreateDonation}
            className="flex items-center gap-2 bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Donation</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#344E41]/12 text-xs text-[#344E41] font-medium shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#8BAF92]" />
            <span>Safe Cold & Hot Chain Verified</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#344E41]/12 shadow-xs space-y-3">
        {/* Search input + Sort options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#373A36]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food name, description, or landmark (e.g. Pasta, Sourdough, Downtown)..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#373A36]/70 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
            >
              <option value="deadline">Pickup Deadline (Urgent First)</option>
              <option value="quantity">Largest Quantity</option>
              <option value="newest">Recently Published</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-[#344E41] shrink-0">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#344E41] text-[#FFF8ED] border-[#344E41] font-semibold'
                  : 'bg-[#FFF8ED] text-[#373A36] border-[#344E41]/15 hover:bg-[#E5EFE5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Storage & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#344E41]/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Storage:</span>
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs"
              >
                {STORAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs"
              >
                <option value="Available">Available (Claimable)</option>
                <option value="Reserved">Reserved (Claimed)</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
                <option value="All">All Statuses</option>
              </select>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#344E41] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-stone-500">
          Loading surplus listings from database...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#344E41]/10 space-y-3">
          <Utensils className="w-10 h-10 text-[#8BAF92] mx-auto opacity-70" />
          <h3 className="font-bold text-base text-[#344E41]">No surplus listings found</h3>
          <p className="text-xs text-[#373A36]/70 max-w-sm mx-auto leading-relaxed">
            There are no donations matching your search filters. Try resetting the filters or check back shortly.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#E5EFE5] text-[#344E41] border border-[#8BAF92]/40"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {donations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              onRequest={onRequestDonation}
              onViewDetails={onViewDonationDetails}
              onEdit={onEditDonation}
              onDelete={onDeleteDonation}
              onReport={onReportDonation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
