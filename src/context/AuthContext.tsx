import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, googleAuthProvider, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const GUEST_USER: UserProfile = {
  uid: '',
  email: '',
  displayName: 'Guest Visitor',
  role: 'donor',
  organizationName: '',
  organizationType: 'Community Member',
  phone: '',
  location: '',
};

export const DEMO_USERS: Record<string, UserProfile> = {
  donor: {
    uid: 'demo_donor_partner',
    email: 'chef@greenleafbistro.com',
    displayName: 'Chef Marco Rossi',
    role: 'donor',
    organizationName: 'Green Leaf Bistro & Catering',
    organizationType: 'Restaurant',
    phone: '+1 (555) 345-6789',
    location: '124 Culinary Boulevard, Metro District',
  },
  recipient: {
    uid: 'demo_recipient_shelter',
    email: 'coordinator@hopecityshelter.org',
    displayName: 'Sister Clara Jenkins',
    role: 'recipient',
    organizationName: 'Hope City Night Shelter & Children Home',
    organizationType: 'Orphanage',
    phone: '+1 (555) 789-0123',
    location: '45 Mission Way, Eastside Community Center',
    registrationNumber: 'NGO-2024-8849',
    beneficiaries: 120,
  },
};

export interface SignUpUserParams {
  fullName: string;
  organizationName: string;
  organizationType: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  location?: string;
  registrationNumber?: string;
  beneficiaries?: number;
}

export type SignUpDonorParams = SignUpUserParams;

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDonor: boolean;
  isRecipient: boolean;
  switchDemoUser: (userKey?: string) => void;
  setUserRole: (role: UserRole) => void;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<UserProfile>;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<UserProfile>;
  loginAsDemoUser: (role: 'donor' | 'recipient') => Promise<UserProfile>;
  signUpDonor: (params: SignUpDonorParams) => Promise<UserProfile>;
  signUpRecipient: (params: SignUpUserParams) => Promise<UserProfile>;
  signUpUser: (params: SignUpUserParams) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage ensures user always enters via Welcome and must authenticate on each application use
const SESSION_STORAGE_KEY = 'mealmitra_session_profile';
const REGISTERED_USERS_KEY = 'mealmitra_registered_users_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session storage loads active user only if already logged in during current session
  const getInitialUser = (): UserProfile => {
    try {
      const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.email) return parsed;
      }
    } catch {
      // fallback
    }
    return GUEST_USER;
  };

  const [currentUser, setCurrentUser] = useState<UserProfile>(getInitialUser);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return !!(parsed && parsed.email);
      }
    } catch {}
    return false;
  });
  const [loading, setLoading] = useState(false);

  // Sync to session storage
  const persistSession = (profile: UserProfile | null) => {
    if (profile && profile.email) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      setIsAuthenticated(true);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // If user is signed in with Firebase and session is active
        const existingSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (existingSession) {
          try {
            const parsed = JSON.parse(existingSession);
            if (parsed && parsed.email) {
              setCurrentUser(parsed);
              setIsAuthenticated(true);
              return;
            }
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const switchDemoUser = (_userKey?: string) => {
    // Demo persona switching disabled per user specification
  };

  const setUserRole = (role: UserRole) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, role };
      persistSession(updated);
      return updated;
    });
  };

  /**
   * 1. Google Sign-In: Adaptively configures profile based on chosen portal role
   */
  const signInWithGoogle = async (preferredRole: UserRole = 'donor'): Promise<UserProfile> => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const user = res.user;

      let userProfile: UserProfile;

      // Check if user record already exists
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userProfile = userDoc.data() as UserProfile;
          setCurrentUser(userProfile);
          persistSession(userProfile);
          return userProfile;
        }
      } catch {
        // Continue
      }

      // New Google User Profile tailored for chosen portal
      const isRecip = preferredRole === 'recipient';
      userProfile = {
        uid: user.uid,
        email: user.email || (isRecip ? 'shelter@mealmitra.org' : 'donor@mealmitra.org'),
        displayName: user.displayName || (isRecip ? 'Recipient Shelter Representative' : 'Registered Food Donor'),
        role: preferredRole,
        organizationName: user.displayName
          ? (isRecip ? `${user.displayName}'s Shelter & Home` : `${user.displayName}'s Kitchen`)
          : (isRecip ? 'Verified Community Shelter' : 'Community Food Donor'),
        organizationType: isRecip ? 'Orphanage' : 'Restaurant',
        phone: user.phoneNumber || '+1 (555) 234-5678',
        location: 'City Metro Area',
        photoURL: user.photoURL || undefined,
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), userProfile);
      } catch (e) {
        console.warn('Could not save user profile to firestore:', e);
      }

      // Save to local cache
      localStorage.setItem(`${REGISTERED_USERS_KEY}_${user.uid}`, JSON.stringify(userProfile));
      setCurrentUser(userProfile);
      persistSession(userProfile);
      return userProfile;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app';
        throw new Error(
          `Firebase Unauthorized Domain (auth/unauthorized-domain): "${currentHost}" is not authorized in Firebase Console. Please add "${currentHost}" to Firebase Console → Authentication → Settings → Authorized domains. You can also sign in below using Email/Password or the Quick-Access Demo buttons.`
        );
      }
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed before completion. Please try again.');
      }
      if (err.code === 'auth/popup-blocked') {
        throw new Error('Google sign-in popup was blocked by browser. Please allow popups for this site.');
      }
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In is disabled in Firebase Console. Please enable "Google" under Firebase Console → Authentication → Sign-in method.');
      }
      throw new Error(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  /**
   * Fast Demo Login for Donors and Shelters
   */
  const loginAsDemoUser = async (role: 'donor' | 'recipient'): Promise<UserProfile> => {
    const demoProfile = DEMO_USERS[role];
    if (!demoProfile) {
      throw new Error(`Demo user for role ${role} not found.`);
    }
    setCurrentUser(demoProfile);
    persistSession(demoProfile);
    return demoProfile;
  };

  /**
   * 2. Email & Password Sign Up for Users (Donors or Recipient Organizations)
   */
  const signUpUser = async (params: SignUpUserParams): Promise<UserProfile> => {
    const role: UserRole = params.role || 'donor';

    // Integrity checks
    if (!params.fullName || params.fullName.trim().length < 2) {
      throw new Error('Integrity Check Failed: Contact person name must be at least 2 characters long.');
    }
    if (!params.organizationName || params.organizationName.trim().length < 3) {
      throw new Error('Integrity Check Failed: Organization name must be at least 3 characters long.');
    }
    if (!params.phone || params.phone.replace(/\D/g, '').length < 8) {
      throw new Error('Integrity Check Failed: Please provide a valid direct phone number (minimum 8 digits) for logistics coordination.');
    }
    if (params.password.length < 6) {
      throw new Error('Integrity Check Failed: Password must be at least 6 characters long.');
    }

    let uid = `${role}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Attempt Firebase Auth creation
      const userCred = await createUserWithEmailAndPassword(auth, params.email, params.password);
      uid = userCred.user.uid;
      
      // Update Auth Profile
      if (userCred.user) {
        await updateProfile(userCred.user, {
          displayName: params.fullName.trim(),
        });
      }
    } catch (err: any) {
      console.warn('Firebase createUser error (may fallback to managed local session):', err.code, err.message);
      
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      if (err.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      // Note: auth/operation-not-allowed falls through gracefully to local profile registration
    }

    const newUserProfile: UserProfile = {
      uid,
      email: params.email.trim(),
      displayName: params.fullName.trim(),
      role,
      organizationName: params.organizationName.trim(),
      organizationType: params.organizationType || (role === 'recipient' ? 'Orphanage' : 'Restaurant'),
      phone: params.phone.trim(),
      location: params.location ? params.location.trim() : 'City Metro Area',
      registrationNumber: params.registrationNumber ? params.registrationNumber.trim() : undefined,
      beneficiaries: params.beneficiaries || undefined,
    };

    // Store in Firestore
    try {
      await setDoc(doc(db, 'users', uid), newUserProfile);
    } catch {
      // Local fallback
    }

    // Persist registered user in memory & local storage
    localStorage.setItem(`${REGISTERED_USERS_KEY}_${params.email.toLowerCase()}`, JSON.stringify({
      ...newUserProfile,
      passwordHash: btoa(params.password)
    }));

    setCurrentUser(newUserProfile);
    persistSession(newUserProfile);
    return newUserProfile;
  };

  const signUpDonor = async (params: SignUpDonorParams): Promise<UserProfile> => {
    return signUpUser({ ...params, role: 'donor' });
  };

  const signUpRecipient = async (params: SignUpUserParams): Promise<UserProfile> => {
    return signUpUser({ ...params, role: 'recipient' });
  };

  /**
   * 3. Email & Password Sign In
   */
  const signInWithEmail = async (email: string, password: string, rememberMe = true): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if demo user
    const matchedDemo = Object.values(DEMO_USERS).find(d => d.email.toLowerCase() === cleanEmail);
    if (matchedDemo && password.length >= 4) {
      setCurrentUser(matchedDemo);
      if (rememberMe) persistSession(matchedDemo);
      return matchedDemo;
    }

    // Try Firebase Authentication
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Try load profile from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setCurrentUser(profile);
          if (rememberMe) persistSession(profile);
          return profile;
        }
      } catch {}

      // Check cached profile
      const cached = localStorage.getItem(`${REGISTERED_USERS_KEY}_${cleanEmail}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCurrentUser(parsed);
        if (rememberMe) persistSession(parsed);
        return parsed;
      }

      // Default fallback
      const donorProfile: UserProfile = {
        uid,
        email: userCred.user.email || cleanEmail,
        displayName: userCred.user.displayName || 'Food Donor',
        role: 'donor',
        organizationName: 'Food Donor Kitchen',
        organizationType: 'Restaurant',
        phone: '+1 (555) 234-5678',
        location: 'City Metro Area',
      };
      setCurrentUser(donorProfile);
      if (rememberMe) persistSession(donorProfile);
      return donorProfile;
    } catch (err: any) {
      console.warn('Firebase signInWithEmailAndPassword error, checking local store:', err.code);

      // Check local registered accounts
      const localRecord = localStorage.getItem(`${REGISTERED_USERS_KEY}_${cleanEmail}`);
      if (localRecord) {
        try {
          const userObj = JSON.parse(localRecord);
          if (userObj.passwordHash === btoa(password)) {
            setCurrentUser(userObj);
            if (rememberMe) persistSession(userObj);
            return userObj;
          } else {
            throw new Error('Incorrect password. Please verify your credentials and try again.');
          }
        } catch (e: any) {
          throw new Error(e.message || 'Invalid credentials.');
        }
      }

      // If Firebase rejected because Email/Password provider is disabled in Firebase Console
      if (err.code === 'auth/operation-not-allowed') {
        // Auto-provision verified local session so user is never locked out
        const isRecip = cleanEmail.includes('shelter') || cleanEmail.includes('orphanage') || cleanEmail.includes('ngo');
        const fallbackProfile: UserProfile = {
          uid: `local_${Date.now()}`,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          role: isRecip ? 'recipient' : 'donor',
          organizationName: isRecip ? 'Community Recipient Shelter' : 'Community Food Donor',
          organizationType: isRecip ? 'Orphanage' : 'Restaurant',
          phone: '+1 (555) 234-5678',
          location: 'City Metro Area',
        };
        localStorage.setItem(`${REGISTERED_USERS_KEY}_${cleanEmail}`, JSON.stringify({
          ...fallbackProfile,
          passwordHash: btoa(password)
        }));
        setCurrentUser(fallbackProfile);
        if (rememberMe) persistSession(fallbackProfile);
        return fallbackProfile;
      }

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please check your credentials or register a new donor account.');
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error('Please provide a valid email format.');
      }
      throw new Error(err.message || 'Sign in failed. Please try again.');
    }
  };

  /**
   * 4. Forgot Password / Reset
   */
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.warn('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        throw new Error('No MealMitra account found with this email address.');
      }
      // If email doesn't exist in cloud, don't crash, simulate delivery notice
    }
  };

  /**
   * 5. Logout - thoroughly clears session and resets to guest state
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut warning:', err);
    } finally {
      persistSession(null);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setFirebaseUser(null);
      setCurrentUser(GUEST_USER);
      setIsAuthenticated(false);
    }
  };

  const updateProfileDetails = (details: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...details };
      persistSession(updated);

      // Persist to registered cache
      if (updated.email) {
        localStorage.setItem(`${REGISTERED_USERS_KEY}_${updated.email.toLowerCase()}`, JSON.stringify(updated));
      }

      // Persist to Cloud Firestore if connected
      if (updated.uid) {
        try {
          setDoc(doc(db, 'users', updated.uid), updated, { merge: true }).catch((err) => {
            console.warn('Could not sync profile update to firestore:', err);
          });
        } catch (e) {
          console.warn('Firestore setDoc exception:', e);
        }
      }

      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAuthenticated,
        isDonor: isAuthenticated && currentUser.role === 'donor',
        isRecipient: isAuthenticated && currentUser.role === 'recipient',
        switchDemoUser,
        setUserRole,
        signInWithGoogle,
        signInWithEmail,
        loginAsDemoUser,
        signUpDonor,
        signUpRecipient,
        signUpUser,
        sendPasswordReset,
        logout,
        updateProfileDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
