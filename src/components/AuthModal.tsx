import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Utensils, 
  HeartHandshake, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  MapPin,
  Users
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  initialRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  initialRole = 'donor',
  onSuccess,
}) => {
  const { signInWithGoogle, signInWithEmail, signUpUser, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Common Form Fields
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('Restaurant');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Recipient-Specific Integrity Fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<number | ''>(50);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset states on open/close
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedRole(initialRole);
      setOrganizationType(initialRole === 'recipient' ? 'Orphanage' : 'Restaurant');
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const isRecipient = selectedRole === 'recipient';

  const handleRoleSwitch = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setOrganizationType(newRole === 'recipient' ? 'Orphanage' : 'Restaurant');
    setError(null);
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle(selectedRole);
      setSuccessMessage(`Signed in successfully as ${isRecipient ? 'Recipient Organization' : 'Food Donor'}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email, password, rememberMe);
      setSuccessMessage('Welcome back! Successfully authenticated.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration with Strict Constraints and Integrity Checks
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Name validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Integrity Check: Contact person name must be at least 2 characters long.');
      return;
    }

    // 2. Organization Name validation
    if (!organizationName.trim() || organizationName.trim().length < 3) {
      setError(`Integrity Check: ${isRecipient ? 'Shelter / Organization' : 'Business'} name must be at least 3 characters long.`);
      return;
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Integrity Check: Please provide a valid email format (e.g. name@domain.com).');
      return;
    }

    // 4. Phone validation (min 8 digits, only valid phone characters)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      setError('Integrity Check: Please enter a valid contact phone number with at least 8 digits for logistics coordination.');
      return;
    }

    // 5. Recipient Organization specific integrity checks
    if (isRecipient) {
      if (!registrationNumber.trim() || registrationNumber.trim().length < 3) {
        setError('Integrity Check: Official NGO, Shelter, or Society registration number is required to claim food donations.');
        return;
      }
      if (!location.trim()) {
        setError('Integrity Check: Operating shelter address is required for safe food collection.');
        return;
      }
    }

    // 6. Password validation
    if (password.length < 6) {
      setError('Integrity Check: Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Integrity Check: Passwords do not match. Please verify your password confirmation.');
      return;
    }

    try {
      setLoading(true);
      await signUpUser({
        fullName: fullName.trim(),
        organizationName: organizationName.trim(),
        organizationType,
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim() || (isRecipient ? 'Shelter Main Bay' : 'Kitchen Bay'),
        registrationNumber: isRecipient ? registrationNumber.trim() : undefined,
        beneficiaries: isRecipient && beneficiaries ? Number(beneficiaries) : undefined,
        password,
        role: selectedRole,
      });

      setSuccessMessage(
        isRecipient
          ? 'Recipient Organization registered and verified! You can now browse and claim surplus food.'
          : 'Food Donor account registered successfully! Welcome to MealMitra.'
      );

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendPasswordReset(email.trim());
      setSuccessMessage('Password reset link sent! Please check your email inbox.');
      setTimeout(() => {
        setMode('signin');
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-[#FFF8ED] rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#344E41]/15 overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className={`border-b px-6 py-4 flex items-center justify-between ${
          isRecipient ? 'bg-[#344E41] text-[#FFF8ED] border-[#344E41]' : 'bg-white text-[#344E41] border-[#344E41]/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isRecipient ? 'bg-[#8BAF92] text-[#344E41]' : 'bg-[#344E41] text-[#8BAF92]'
            }`}>
              {isRecipient ? <Building2 className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  {mode === 'signup' 
                    ? (isRecipient ? 'Register Recipient Shelter' : 'Register Food Donor')
                    : mode === 'forgot'
                    ? 'Reset Your Password'
                    : (isRecipient ? 'Recipient Shelter Sign In' : 'Food Donor Sign In')}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isRecipient ? 'bg-amber-100 text-amber-900' : 'bg-[#8BAF92]/20 text-[#344E41]'
                }`}>
                  {isRecipient ? 'Shelter' : 'Donor'}
                </span>
              </div>
              <p className={`text-[11px] ${isRecipient ? 'text-white/80' : 'text-[#373A36]/70'}`}>
                {mode === 'signup'
                  ? (isRecipient 
                      ? 'For orphanages, shelters & NGOs to claim surplus food' 
                      : 'For restaurants, canteens & kitchens to donate surplus')
                  : mode === 'forgot'
                  ? 'Enter your registered email to receive recovery instructions'
                  : (isRecipient
                      ? 'Access live donor surplus listings and track requests'
                      : 'Manage your surplus food listings and inbound requests')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isRecipient ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-stone-400 hover:text-[#344E41] hover:bg-stone-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Portal Selector Pill (Food Donor vs Recipient Organization) */}
        {mode !== 'forgot' && (
          <div className="p-4 pb-0 space-y-2">
            <label className="block text-[11px] font-bold text-[#344E41] uppercase tracking-wider">
              Select Your Access Portal:
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#E5EFE5] rounded-2xl border border-[#8BAF92]/30">
              <button
                type="button"
                onClick={() => handleRoleSwitch('donor')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isRecipient
                    ? 'bg-[#344E41] text-white shadow-xs'
                    : 'text-[#373A36]/70 hover:text-[#344E41]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('recipient')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isRecipient
                    ? 'bg-[#344E41] text-white shadow-xs'
                    : 'text-[#373A36]/70 hover:text-[#344E41]'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Recipient Shelter</span>
              </button>
            </div>

            {/* Mode Toggle (Sign In vs Register) */}
            <div className="grid grid-cols-2 p-1 bg-white rounded-xl border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#8BAF92] text-[#344E41] shadow-2xs'
                    : 'text-[#373A36]/70 hover:text-[#344E41]'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#8BAF92] text-[#344E41] shadow-2xs'
                    : 'text-[#373A36]/70 hover:text-[#344E41]'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        <div className="p-6 pt-3 space-y-4">
          {/* Notification Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#C97B63]/15 border border-[#C97B63]/30 text-[#C97B63] text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-stone-50 text-[#373A36] border border-[#344E41]/15 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
              >
                {/* Google "G" Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google as {isRecipient ? 'Recipient Shelter' : 'Food Donor'}</span>
              </button>

              <div className="relative my-3.5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#344E41]/10"></div>
                </div>
                <span className="relative bg-[#FFF8ED] px-3 text-[11px] text-[#373A36]/60 uppercase tracking-wider font-medium">
                  or sign in with email credentials
                </span>
              </div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344E41]">
                  {isRecipient ? 'Shelter / Recipient Email' : 'Donor Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#373A36]/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isRecipient ? 'shelter@charity.org' : 'chef@restaurant.com'}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[11px] text-[#8BAF92] hover:text-[#344E41] font-semibold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#373A36]/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#373A36]/80">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#8BAF92] focus:ring-[#8BAF92]"
                  />
                  <span>Remember my {isRecipient ? 'shelter' : 'donor'} session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 font-bold py-2.5 rounded-xl text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isRecipient 
                    ? 'bg-[#344E41] hover:bg-[#283d32] text-white' 
                    : 'bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{isRecipient ? 'Sign In as Recipient Organization' : 'Sign In to Donor Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              {/* Organization Type & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    {isRecipient ? 'Shelter / NGO Name *' : 'Establishment Name *'}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-[#373A36]/50" />
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={isRecipient ? 'e.g. Hope Orphanage' : 'e.g. Green Bistro'}
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    {isRecipient ? 'Shelter Type *' : 'Establishment Type *'}
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  >
                    {isRecipient ? (
                      <>
                        <option value="Orphanage">Orphanage & Children Home</option>
                        <option value="Night Shelter">Night Shelter & Homeless Shelter</option>
                        <option value="Food Bank">Community Food Bank</option>
                        <option value="Community Kitchen">Soup Kitchen / Charity Diner</option>
                        <option value="NGO">Non-Profit Feeding Program</option>
                        <option value="Elder Care">Elder Care & Senior Center</option>
                      </>
                    ) : (
                      <>
                        <option value="Restaurant">Restaurant / Bistro</option>
                        <option value="College Canteen">College / Campus Canteen</option>
                        <option value="Hostel">Hostel / Dormitory Mess</option>
                        <option value="Bakery">Bakery / Patisserie</option>
                        <option value="Event Organizer">Event / Banquet Caterer</option>
                        <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                        <option value="Individual Donor">Individual Donor</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    {isRecipient ? 'Coordinator / Director Name *' : 'Kitchen Contact Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-[#373A36]/50" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sister Mary, Chef Rajesh"
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    Direct Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#373A36]/50" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Recipient Integrity Fields: Registration ID & Beneficiaries */}
              {isRecipient && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Govt / NGO Reg # *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. REG-NGO-4921"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-700" />
                      <span>Beneficiary Count</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={beneficiaries}
                      onChange={(e) => setBeneficiaries(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      placeholder="e.g. 75 residents"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Facility Location / Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344E41]">
                  {isRecipient ? 'Operating Shelter Facility Address *' : 'Pickup Bay / City Area'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#373A36]/50" />
                  <input
                    type="text"
                    required={isRecipient}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isRecipient ? 'e.g. 142 Hope Ave, Downtown Shelter Bay' : 'e.g. 5th Main Market Area'}
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344E41]">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="liaison@organization.org"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 pr-8 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 pr-8 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-bold py-2.5 rounded-xl text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    isRecipient
                      ? 'bg-[#344E41] hover:bg-[#283d32] text-white'
                      : 'bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isRecipient 
                          ? 'Complete Recipient Shelter Registration' 
                          : 'Complete Food Donor Registration'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344E41]">
                  Enter Your Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#373A36]/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="liaison@organization.org"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-xs font-semibold text-[#344E41] hover:underline"
                >
                  Back to Sign In
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-bold rounded-xl text-xs shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Send Recovery Email</span>
                </button>
              </div>
            </form>
          )}

          {/* Food Safety & Integrity Guarantee Note */}
          <div className="pt-3 border-t border-[#344E41]/10 flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#8BAF92] shrink-0" />
            <span>
              {isRecipient
                ? 'Recipient organizations are verified non-profit shelters claiming surplus for direct consumption.'
                : 'Donor accounts comply with food safety hygiene & Good Samaritan protection standards.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
