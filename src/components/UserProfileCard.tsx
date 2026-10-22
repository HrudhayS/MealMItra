import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Edit3, 
  Check, 
  X, 
  Utensils, 
  Bike, 
  HeartHandshake, 
  Sparkles, 
  UserCheck, 
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

interface UserProfileCardProps {
  onNavigateToPost?: () => void;
  onNavigateToStation?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup', role?: UserRole) => void;
  compact?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  onNavigateToPost,
  onNavigateToStation,
  onOpenAuth,
  compact = false,
}) => {
  const { currentUser, updateProfileDetails, isAuthenticated, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName || '',
    organizationName: currentUser.organizationName || '',
    organizationType: currentUser.organizationType || 'Restaurant',
    phone: currentUser.phone || '',
    location: currentUser.location || '',
  });

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleOpenEdit = () => {
    setFormData({
      displayName: currentUser.displayName || '',
      organizationName: currentUser.organizationName || '',
      organizationType: currentUser.organizationType || 'Restaurant',
      phone: currentUser.phone || '',
      location: currentUser.location || '',
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileDetails({
      displayName: formData.displayName.trim(),
      organizationName: formData.organizationName.trim(),
      organizationType: formData.organizationType,
      phone: formData.phone.trim(),
      location: formData.location.trim(),
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'donor':
        return {
          label: 'Food Donor Partner',
          icon: <Utensils className="w-3.5 h-3.5" />,
          bg: 'bg-[#8BAF92]/20 text-[#344E41] border-[#8BAF92]/40',
        };
      case 'recipient':
        return {
          label: 'Recipient Organization',
          icon: <Building2 className="w-3.5 h-3.5" />,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'volunteer':
        return {
          label: 'Volunteer Courier',
          icon: <Bike className="w-3.5 h-3.5" />,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      default:
        return {
          label: 'Community Member',
          icon: <HeartHandshake className="w-3.5 h-3.5" />,
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  // Avatar initials generator
  const getInitials = (name: string) => {
    if (!name) return 'MM';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-3xl border border-[#344E41]/15 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Top Banner accent */}
      <div className="bg-gradient-to-r from-[#344E41] via-[#2d4237] to-[#8BAF92] p-5 sm:p-6 text-[#FFF8ED] relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] text-[#344E41] font-extrabold text-xl flex items-center justify-center border-2 border-white/60 shadow-sm">
                  {getInitials(currentUser.displayName)}
                </div>
              )}
              {/* Online pulse indicator */}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {isAuthenticated ? (currentUser.displayName || 'Food Donor') : 'Guest Visitor'}
                </h2>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isAuthenticated ? 'Verified Account' : 'Guest Mode'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#FFF8ED]/85">
                <span className="font-semibold text-white">
                  {isAuthenticated 
                    ? (currentUser.organizationName || 'Registered Partner') 
                    : 'Community Explorer'}
                </span>
                {currentUser.organizationType && isAuthenticated && (
                  <>
                    <span>•</span>
                    <span className="bg-white/15 px-2 py-0.5 rounded-md text-[11px] font-medium">
                      {currentUser.organizationType}
                    </span>
                  </>
                )}
                {isAuthenticated && currentUser.uid && (
                  <>
                    <span>•</span>
                    <span className="text-[#FFF8ED]/75">UID: {currentUser.uid.slice(0, 14)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleOpenEdit}
                  className="bg-white/15 hover:bg-white/25 text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                {onNavigateToStation && (
                  <button
                    onClick={onNavigateToStation}
                    className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{currentUser.role === 'recipient' ? 'Browse Surplus Food' : 'Donor Station'}</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="bg-rose-500/25 hover:bg-rose-600 text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-300/30"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {onOpenAuth && (
                  <>
                    <button
                      onClick={() => onOpenAuth('signin', 'donor')}
                      className="bg-white text-[#344E41] hover:bg-[#FFF8ED] font-semibold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Food Donor Sign In"
                    >
                      <Utensils className="w-3.5 h-3.5 text-[#8BAF92]" />
                      <span>Donor Login</span>
                    </button>
                    <button
                      onClick={() => onOpenAuth('signin', 'recipient')}
                      className="bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-amber-300"
                      title="Recipient Shelter Sign In"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
                      <span>Shelter Login</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveSuccess && (
          <div className="mt-3 bg-emerald-600/90 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>Profile details updated and synchronized with cloud store.</span>
          </div>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="p-5 sm:p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Role & Organization Profile */}
          <div className="bg-[#FFF8ED]/50 border border-[#344E41]/10 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#344E41] uppercase tracking-wider">
                User Role & Entity
              </span>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleInfo.bg}`}>
                {roleInfo.icon}
                <span>{roleInfo.label}</span>
              </div>
            </div>

            <div className="pt-1 space-y-1.5 text-xs text-[#373A36]">
              <div className="flex items-center justify-between py-1 border-b border-[#344E41]/8">
                <span className="text-[#373A36]/70">Organization:</span>
                <span className="font-semibold text-[#344E41]">
                  {currentUser.organizationName || (isAuthenticated ? 'Not specified' : 'Guest Visitor')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#344E41]/8">
                <span className="text-[#373A36]/70">Facility Type:</span>
                <span className="font-medium text-[#344E41]">
                  {currentUser.organizationType || (isAuthenticated ? 'Restaurant / Eatery' : 'Guest Explorer')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#373A36]/70">Account Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-emerald-600' : 'bg-stone-400'}`}></span>
                  {isAuthenticated ? 'Authenticated & Active' : 'Browsing as Guest'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Information */}
          <div className="bg-[#FFF8ED]/50 border border-[#344E41]/10 rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-[#344E41] uppercase tracking-wider">
              Contact Channels
            </span>

            <div className="pt-1 space-y-2 text-xs text-[#373A36]">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#8BAF92] shrink-0 mt-0.5" />
                <div className="truncate">
                  <p className="text-[10px] text-[#373A36]/60">Primary Email</p>
                  <p className="font-medium text-[#344E41] truncate" title={currentUser.email}>
                    {currentUser.email || (isAuthenticated ? 'donor@mealmitra.org' : 'Sign in to link email')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#8BAF92] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#373A36]/60">Direct Phone / WhatsApp</p>
                  <p className="font-medium text-[#344E41]">
                    {currentUser.phone || (isAuthenticated ? '+1 (555) 234-5678' : 'Available upon login')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Pickup Location & Safety Guidelines */}
          <div className="bg-[#FFF8ED]/50 border border-[#344E41]/10 rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-[#344E41] uppercase tracking-wider">
              Pickup & Service Hub
            </span>

            <div className="pt-1 text-xs text-[#373A36]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C97B63] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#373A36]/60">Registered Facility Location</p>
                  <p className="font-medium text-[#344E41] line-clamp-2">
                    {currentUser.location || (isAuthenticated ? 'Registered Dispatch Bay' : 'City Metro Hub')}
                  </p>
                </div>
              </div>

              {/* Verified food safety certification badge */}
              <div className="mt-3 pt-2.5 border-t border-[#344E41]/10">
                <p className="text-[10px] font-semibold text-[#373A36]/70 mb-1 flex items-center justify-between">
                  <span>Food Safety Compliance:</span>
                  <span className="text-[#8BAF92] text-[10px] font-medium">Standards Enforced</span>
                </p>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#344E41]/10 text-[11px] text-[#344E41]">
                  <ShieldCheck className="w-4 h-4 text-[#8BAF92] shrink-0" />
                  <span className="leading-tight">Safe hot holding (&gt;60°C) and chill-chain monitored</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFF8ED] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#344E41]/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344E41]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#344E41] text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-[#8BAF92]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#344E41]">Update Profile Information</h3>
                  <p className="text-xs text-[#373A36]/70">Changes persist across sessions and cloud database</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#344E41] mb-1">
                  Contact / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#344E41]/20 bg-white text-[#344E41] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8BAF92]"
                  placeholder="e.g. Marco Silva / Kitchen Manager"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#344E41] mb-1">
                    Organization / Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#344E41]/20 bg-white text-[#344E41] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8BAF92]"
                    placeholder="e.g. Green Olive Bistro"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#344E41] mb-1">
                    Organization Type
                  </label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#344E41]/20 bg-white text-[#344E41] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8BAF92]"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="College Canteen">College / University Canteen</option>
                    <option value="Hostel Mess">Hostel / Campus Mess</option>
                    <option value="Artisan Bakery">Artisan Bakery</option>
                    <option value="Catering Service">Catering / Banquet Hall</option>
                    <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                    <option value="Orphanage">Orphanage & Children Home</option>
                    <option value="Night Shelter">Night Shelter & NGO</option>
                    <option value="Volunteer Corps">Volunteer Fleet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#344E41] mb-1">
                  Phone Number (For Recipient Coordination)
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#344E41]/20 bg-white text-[#344E41] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8BAF92]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#344E41] mb-1">
                  Registered Location / Pickup Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#344E41]/20 bg-white text-[#344E41] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8BAF92]"
                  placeholder="e.g. 142 Main Street, Downtown Market District"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#344E41]/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#344E41] hover:bg-[#2b4035] text-white px-5 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#8BAF92]" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
