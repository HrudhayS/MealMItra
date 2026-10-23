import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  HeartHandshake, 
  Utensils, 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Info,
  HelpCircle
} from 'lucide-react';

interface LoginPageProps {
  onBackToWelcome: () => void;
  onSuccess: () => void;
  initialRole?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToWelcome,
  onSuccess,
  initialRole = 'donor',
}) => {
  const { signInWithGoogle, signInWithEmail, signUpUser, loginAsDemoUser, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Common Form Fields
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState(initialRole === 'recipient' ? 'Orphanage' : 'Restaurant');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Recipient-Specific Integrity Fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<number | ''>(60);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showFirebaseInfo, setShowFirebaseInfo] = useState(false);

  const isRecipient = selectedRole === 'recipient';

  const handleRoleSwitch = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setOrganizationType(newRole === 'recipient' ? 'Orphanage' : 'Restaurant');
    setError(null);
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle(selectedRole);
      setSuccessMessage(`Authenticated as ${isRecipient ? 'Recipient Shelter' : 'Food Donor'}!`);
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
      if (err.message && err.message.includes('auth/unauthorized-domain')) {
        setShowFirebaseInfo(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo Quick-Access
  const handleQuickDemo = async (role: 'donor' | 'recipient') => {
    try {
      setLoading(true);
      setError(null);
      await loginAsDemoUser(role);
      setSuccessMessage(`Signed in as ${role === 'donor' ? 'Green Leaf Bistro (Donor)' : 'Hope City Shelter (Recipient)'}!`);
      setTimeout(() => {
        onSuccess();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Could not sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  // Email Sign In
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
      setSuccessMessage('Welcome back! Authentication successful.');
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please verify credentials.');
      if (err.message && (err.message.includes('auth/operation-not-allowed') || err.message.includes('Firebase'))) {
        setShowFirebaseInfo(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Registration with Integrity Checks
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Integrity validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Integrity Check: Contact person name must be at least 2 characters long.');
      return;
    }
    if (!organizationName.trim() || organizationName.trim().length < 3) {
      setError('Integrity Check: Organization or business name must be at least 3 characters long.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhone.length < 8) {
      setError('Integrity Check: Please provide a valid direct phone number (minimum 8 digits) for food pickup coordination.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Integrity Check: Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Integrity Check: Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    // Role-specific integrity checks
    if (isRecipient) {
      if (!registrationNumber.trim()) {
        setError('Integrity Check: Recipient shelters must enter an NGO / Trust registration number or Government accreditation ID.');
        return;
      }
      if (!beneficiaries || Number(beneficiaries) < 1) {
        setError('Integrity Check: Please specify the approximate number of beneficiaries / daily residents served.');
        return;
      }
    }

    try {
      setLoading(true);
      await signUpUser({
        fullName,
        organizationName,
        organizationType,
        email,
        phone,
        location: location.trim() || 'Metro District',
        password,
        role: selectedRole,
        registrationNumber: isRecipient ? registrationNumber.trim() : undefined,
        beneficiaries: isRecipient && beneficiaries ? Number(beneficiaries) : undefined,
      });

      setSuccessMessage(`Account registered successfully as verified ${isRecipient ? 'Recipient Shelter' : 'Food Donor'}!`);
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your account email to receive recovery instructions.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await sendPasswordReset(email.trim());
      setSuccessMessage('Password recovery instructions dispatched. Please check your inbox.');
      setTimeout(() => setMode('signin'), 2500);
    } catch (err: any) {
      setError(err.message || 'Could not send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-6 sm:py-10 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-5xl mx-auto">
        
        {/* Top Back Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToWelcome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-[#344E41] font-semibold text-xs border border-[#344E41]/15 shadow-xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-[#8BAF92] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Welcome Page</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-[#344E41]/80">MealMitra Secure Auth Gateway</span>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#344E41]/12 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Brand & Integrity Overview (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#344E41] via-[#2a3f34] to-[#1c2c23] text-[#FFF8ED] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background glowing glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#8BAF92]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#8BAF92] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Non-Profit Food Recovery</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome to <br />
                  <span className="text-[#8BAF92]">MealMitra</span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#FFF8ED]/80 leading-relaxed font-normal">
                  Dedicated surplus food rescue connecting dining kitchens directly with shelters, orphanages, and community programs.
                </p>
              </div>

              {/* Portal Info Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    isRecipient ? 'bg-amber-400 text-amber-950' : 'bg-[#8BAF92] text-[#344E41]'
                  }`}>
                    {isRecipient ? <Building2 className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {isRecipient ? 'Recipient Shelter Access' : 'Food Donor Access'}
                    </h4>
                    <p className="text-[11px] text-white/70">
                      {isRecipient ? 'View surplus & request portions' : 'Post surplus food & coordinate pickups'}
                    </p>
                  </div>
                </div>

                <ul className="text-xs text-white/80 space-y-1.5 pt-1">
                  {isRecipient ? (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Browse real-time fresh surplus listings</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Reserve exact portions for your residents</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Direct phone and WhatsApp coordination</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#8BAF92] shrink-0" />
                        <span>Publish surplus trays in under 60 seconds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#8BAF92] shrink-0" />
                        <span>Review inbound shelter claims with 1 click</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#8BAF92] shrink-0" />
                        <span>Automated food safety and allergen tracking</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Instant Test Buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-[#8BAF92] uppercase tracking-wider block">
                  Instant Test & Demo Login:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemo('donor')}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-left text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Utensils className="w-3.5 h-3.5 text-[#8BAF92] shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-[11px]">Demo Donor</div>
                      <div className="text-[10px] text-white/70 truncate">Green Leaf Bistro</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemo('recipient')}
                    className="p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/30 text-left text-xs font-semibold text-amber-200 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-[11px]">Demo Shelter</div>
                      <div className="text-[10px] text-amber-200/70 truncate">Hope City Orphanage</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Good Samaritan Notice */}
            <div className="pt-6 mt-6 border-t border-white/10 text-[11px] text-[#FFF8ED]/70 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8BAF92] shrink-0" />
              <span>Protected by Good Samaritan Food Donation Standards</span>
            </div>
          </div>

          {/* Right Column: Custom Login / Register Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#FFF8ED]">
            
            {/* Role Switcher Pill */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#344E41] uppercase tracking-wider">
                  Select Organization Type:
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isRecipient ? 'bg-amber-100 text-amber-900' : 'bg-[#8BAF92]/25 text-[#344E41]'
                }`}>
                  {isRecipient ? 'Recipient Organization' : 'Food Donor'}
                </span>
              </div>

              <div className="grid grid-cols-2 p-1.5 bg-[#E5EFE5] rounded-2xl border border-[#8BAF92]/30">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('donor')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !isRecipient
                      ? 'bg-[#344E41] text-white shadow-sm'
                      : 'text-[#373A36]/70 hover:text-[#344E41]'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>Food Donor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSwitch('recipient')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isRecipient
                      ? 'bg-[#344E41] text-white shadow-sm'
                      : 'text-[#373A36]/70 hover:text-[#344E41]'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Recipient Shelter</span>
                </button>
              </div>

              {/* Mode Toggle (Sign In vs Register) */}
              <div className="grid grid-cols-2 p-1 bg-white rounded-xl border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-[#8BAF92] text-[#344E41] shadow-xs'
                      : 'text-[#373A36]/70 hover:text-[#344E41]'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#8BAF92] text-[#344E41] shadow-xs'
                      : 'text-[#373A36]/70 hover:text-[#344E41]'
                  }`}
                >
                  Create New Account
                </button>
              </div>
            </div>

            {/* Error Message with Firebase Diagnostic Assistance */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{error}</div>
                </div>

                {/* Helpful recovery prompt if Firebase domain or provider issue */}
                {(error.includes('unauthorized-domain') || error.includes('operation-not-allowed') || showFirebaseInfo) && (
                  <div className="p-3 bg-white/80 rounded-xl border border-rose-300 text-[11px] text-stone-700 space-y-1.5">
                    <div className="font-bold text-[#344E41] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      <span>Production Deployment Setup Tip:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-stone-600">
                      <li>For Google Sign-In: Add <strong>{typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app'}</strong> to Firebase Console → Authentication → Settings → Authorized domains.</li>
                      <li>For Email/Password: Enable <strong>Email/Password</strong> provider in Firebase Console → Authentication → Sign-in method.</li>
                    </ol>
                    <p className="font-semibold text-emerald-800 pt-1">
                      💡 You can click the &quot;Demo Donor&quot; or &quot;Demo Shelter&quot; button above to immediately test all features!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            {mode !== 'forgot' && (
              <div className="mb-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white hover:bg-stone-50 text-[#373A36] border border-[#344E41]/15 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
                >
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

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#344E41]/10"></div>
                  </div>
                  <span className="relative bg-[#FFF8ED] px-3 text-[11px] text-[#373A36]/60 uppercase tracking-wider font-semibold">
                    or authenticate with email
                  </span>
                </div>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">
                    {isRecipient ? 'Shelter Email Address' : 'Donor Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#373A36]/50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isRecipient ? 'coordinator@hopecityshelter.org' : 'chef@greenleafbistro.com'}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#344E41]">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); }}
                      className="text-[11px] text-[#8BAF92] hover:text-[#344E41] font-semibold transition-colors cursor-pointer"
                    >
                      Forgot password?
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
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#373A36]/80 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-stone-300 text-[#344E41] focus:ring-[#8BAF92]"
                    />
                    <span>Keep me logged in for this visit</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    isRecipient ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#344E41] hover:bg-[#283d32]'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Sign In to {isRecipient ? 'Recipient Shelter' : 'Donor Station'}</span>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTRATION FORM WITH INTEGRITY CHECKS */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344E41]">
                      Contact Person Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-[#373A36]/50" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sister Clara / Chef Marco"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344E41]">
                      Direct Mobile / Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-[#373A36]/50" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344E41]">
                      {isRecipient ? 'Shelter / NGO Name *' : 'Restaurant / Canteen Name *'}
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-3 text-[#373A36]/50" />
                      <input
                        type="text"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder={isRecipient ? 'Hope City Children Shelter' : 'Green Leaf Kitchen'}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344E41]">Organization Category</label>
                    <select
                      value={organizationType}
                      onChange={(e) => setOrganizationType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                    >
                      {isRecipient ? (
                        <>
                          <option value="Orphanage">Orphanage & Children Home</option>
                          <option value="Night Shelter">Night Shelter / Homeless Haven</option>
                          <option value="Senior Home">Elderly Support Home</option>
                          <option value="Community Kitchen">Free Community Kitchen / Langar</option>
                          <option value="NGO">Registered Charity / NGO</option>
                        </>
                      ) : (
                        <>
                          <option value="Restaurant">Restaurant / Bistro</option>
                          <option value="Canteen">Office / College Canteen</option>
                          <option value="Catering">Event & Wedding Caterer</option>
                          <option value="Bakery">Bakery & Confectionery</option>
                          <option value="Hotel">Hotel & Banquet</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Recipient Integrity Specifics */}
                {isRecipient && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Integrity & Verification Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-amber-950">
                          NGO / Trust Reg. Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          placeholder="e.g. NGO-2024-8849"
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-amber-950">
                          Beneficiaries Served *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={beneficiaries}
                          onChange={(e) => setBeneficiaries(e.target.value ? Number(e.target.value) : '')}
                          placeholder="60"
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@organization.org"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344E41]">Password (min 6) *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
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
                    <label className="block text-xs font-semibold text-[#344E41]">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
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

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 ${
                    isRecipient ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#344E41] hover:bg-[#283d32]'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Register {isRecipient ? 'Recipient Shelter' : 'Food Donor'} Account</span>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="text-center space-y-1 mb-2">
                  <h3 className="font-bold text-sm text-[#344E41]">Reset Password</h3>
                  <p className="text-xs text-stone-600">Enter your registered email to receive recovery instructions.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344E41]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="account@mealmitra.org"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#344E41] hover:bg-[#283d32] font-bold text-xs text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Recovery Email'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="text-xs font-semibold text-[#8BAF92] hover:text-[#344E41] cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
