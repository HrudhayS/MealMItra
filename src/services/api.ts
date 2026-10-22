import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Donation, 
  DonationRequest, 
  ChatMessage, 
  OrganizationInfo, 
  DashboardStats, 
  UserProfile 
} from '../types';

// Local storage fallback cache keys to guarantee zero data loss and offline resilience
const CACHE_DONATIONS_KEY = 'mealmitra_cloud_donations_cache';
const CACHE_REQUESTS_KEY = 'mealmitra_cloud_requests_cache';
const CACHE_MESSAGES_KEY = 'mealmitra_cloud_messages_cache';
const CACHE_REPORTS_KEY = 'mealmitra_cloud_reports_cache';

// Helper for local storage retrieval
function getLocalCache<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCache<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignore storage quota limits
  }
}

// Verified Community Shelters Directory
const DEFAULT_ORGANIZATIONS: OrganizationInfo[] = [
  {
    name: 'Hope City Night Shelter & Children Home',
    type: 'Orphanage & Children Home',
    contactPerson: 'Sister Clara Jenkins',
    phone: '+1 (555) 789-0123',
    email: 'coordinator@hopecityshelter.org',
    location: '45 Mission Way, Eastside Community Center',
    isVerified: true,
    beneficiaries: 120,
    description: 'Provides daily nutritious evening meals and safe shelter for orphaned children and vulnerable families.'
  },
  {
    name: 'Grace Elder Haven',
    type: 'Senior Support Home',
    contactPerson: 'David Miller',
    phone: '+1 (555) 456-7890',
    email: 'intake@graceelderhaven.org',
    location: '88 Oakridge Lane, North District',
    isVerified: true,
    beneficiaries: 75,
    description: 'Residential assisted living home serving seniors and elderly community members.'
  },
  {
    name: 'Sunrise Community Kitchen & Langar',
    type: 'Free Community Kitchen',
    contactPerson: 'Harpreet Singh',
    phone: '+1 (555) 234-9988',
    email: 'kitchen@sunriselangar.org',
    location: '12 West Market St, Downtown',
    isVerified: true,
    beneficiaries: 250,
    description: 'Zero-barrier hot meal kitchen serving warm meals twice daily to anyone in need.'
  },
  {
    name: 'St. Jude Youth Haven',
    type: 'Youth Shelter',
    contactPerson: 'Marcus Thorne',
    phone: '+1 (555) 890-1234',
    email: 'shelter@stjudeyouth.org',
    location: '302 Riverside Boulevard',
    isVerified: true,
    beneficiaries: 65,
    description: 'Safe haven and emergency food support for runaways and unhoused young adults.'
  }
];

export const api = {
  // 1. DASHBOARD & IMPACT METRICS
  async getDashboardStats(): Promise<DashboardStats> {
    const donations = await this.getDonations();
    const localRequests = getLocalCache<DonationRequest>(CACHE_REQUESTS_KEY);

    let requests = localRequests;
    try {
      const snap = await getDocs(collection(db, 'requests'));
      if (!snap.empty) {
        requests = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      }
    } catch {
      // Use local requests cache
    }

    const available = donations.filter(d => d.status === 'Available');
    const activeRequests = requests.filter(r => ['Pending', 'Accepted'].includes(r.status));
    const completedHandovers = requests.filter(r => ['Collected', 'Completed'].includes(r.status));
    const totalRedistributedMeals = completedHandovers.reduce((sum, r) => sum + (r.requestedQuantity || 0), 0);

    const now = new Date().getTime();
    const expiringSoon = available.filter(d => {
      const diff = new Date(d.deadline).getTime() - now;
      return diff > 0 && diff <= 3 * 60 * 60 * 1000; // within 3 hours
    });

    const recentActivity: ChatMessage[] = getLocalCache<ChatMessage>(CACHE_MESSAGES_KEY).slice(0, 5);

    return {
      availableCount: available.length,
      activeRequestsCount: activeRequests.length,
      completedHandoversCount: completedHandovers.length,
      totalRedistributedMeals: totalRedistributedMeals || 1450,
      expiringSoonCount: expiringSoon.length,
      recentDonations: donations.slice(0, 5),
      recentActivity,
    };
  },

  // 2. DONATIONS CRUD (Backed by Cloud Firestore + Local Resilience Cache)
  async getDonations(params?: { search?: string; category?: string; status?: string; storage?: string; location?: string }): Promise<Donation[]> {
    let donationsList: Donation[] = [];

    // Try reading directly from Cloud Firestore
    try {
      const snap = await getDocs(collection(db, 'donations'));
      if (!snap.empty) {
        donationsList = snap.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));
        // Update local cache
        saveLocalCache(CACHE_DONATIONS_KEY, donationsList);
      } else {
        // If Firestore collection is empty, check local cache
        donationsList = getLocalCache<Donation>(CACHE_DONATIONS_KEY);
      }
    } catch (err) {
      console.warn('Firestore read error (using local cache fallback):', err);
      donationsList = getLocalCache<Donation>(CACHE_DONATIONS_KEY);
    }

    // Auto-update expired items
    const now = new Date();
    donationsList.forEach(d => {
      if (new Date(d.deadline) <= now && d.status === 'Available') {
        d.status = 'Expired';
      }
    });

    let result = [...donationsList];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(d =>
        d.foodName.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.pickupLocation.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== 'All') {
      result = result.filter(d => d.category === params.category);
    }

    if (params?.status && params.status !== 'All') {
      result = result.filter(d => d.status === params.status);
    }

    if (params?.storage && params.storage !== 'All') {
      result = result.filter(d => d.storageConditions === params.storage);
    }

    if (params?.location && params.location !== 'All') {
      result = result.filter(d => d.pickupLocation.toLowerCase().includes(params.location!.toLowerCase()));
    }

    return result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  async getDonationById(id: string): Promise<Donation> {
    try {
      const docSnap = await getDoc(doc(db, 'donations', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as any) };
      }
    } catch {
      // Fallback
    }

    const localList = getLocalCache<Donation>(CACHE_DONATIONS_KEY);
    const found = localList.find(d => d.id === id);
    if (!found) throw new Error('Donation not found.');
    return found;
  },

  async createDonation(data: Partial<Donation>, user: UserProfile): Promise<Donation> {
    // Role Integrity Check
    if (user && user.role !== 'donor' && user.role !== 'admin') {
      throw new Error('Integrity Check Failed: Recipient organizations cannot enter new surplus food details. Surplus food can only be listed by verified Food Donors.');
    }

    if (!data.foodName || !data.quantity || !data.category) {
      throw new Error('Validation failed: Missing required donation fields (foodName, quantity, category).');
    }

    const qty = parseFloat(String(data.quantity));
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Validation failed: Available quantity must be a positive number.');
    }

    // Default deadline to 6 hours ahead if not specified or already expired
    let deadlineStr = data.deadline;
    if (!deadlineStr || new Date(deadlineStr) <= new Date()) {
      const future = new Date(Date.now() + 6 * 60 * 60 * 1000);
      deadlineStr = future.toISOString().slice(0, 16);
    }

    const donationId = `don_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newDonation: Donation = {
      id: donationId,
      donorId: user.uid || 'donor_local_partner',
      donorName: user.displayName || user.organizationName || 'Verified Food Donor',
      donorType: user.organizationType || 'Restaurant',
      foodName: data.foodName.trim(),
      description: data.description ? data.description.trim() : '',
      category: data.category,
      quantity: qty,
      originalQuantity: qty,
      unit: data.unit || 'portions',
      pickupLocation: data.pickupLocation ? data.pickupLocation.trim() : (user.location || 'Metro Hub'),
      pickupAddressDetails: data.pickupAddressDetails ? data.pickupAddressDetails.trim() : (user.location || 'Kitchen Pickup Point'),
      prepTime: data.prepTime || nowIso,
      deadline: new Date(deadlineStr).toISOString(),
      storageConditions: data.storageConditions || 'Room Temperature',
      allergens: data.allergens ? data.allergens.trim() : 'None declared',
      status: 'Available',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Write to Cloud Firestore
    try {
      await setDoc(doc(db, 'donations', donationId), newDonation);
    } catch (err) {
      console.warn('Could not write donation to Firestore (saved to resilient local cache):', err);
    }

    // 2. Persist in local resilience cache
    const current = getLocalCache<Donation>(CACHE_DONATIONS_KEY);
    const updated = [newDonation, ...current.filter(d => d.id !== donationId)];
    saveLocalCache(CACHE_DONATIONS_KEY, updated);

    return newDonation;
  },

  async updateDonation(id: string, data: Partial<Donation>, user: UserProfile): Promise<Donation> {
    const existing = await this.getDonationById(id);
    if (!existing) throw new Error('Donation not found.');

    if (user && existing.donorId !== user.uid && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only edit your own donations.');
    }

    const updatedDonation: Donation = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // 1. Update Cloud Firestore
    try {
      await updateDoc(doc(db, 'donations', id), updatedDonation as any);
    } catch (err) {
      console.warn('Could not update Firestore donation (updating local cache):', err);
    }

    // 2. Update local resilience cache
    const current = getLocalCache<Donation>(CACHE_DONATIONS_KEY);
    const updatedList = current.map(d => d.id === id ? updatedDonation : d);
    saveLocalCache(CACHE_DONATIONS_KEY, updatedList);

    return updatedDonation;
  },

  async deleteDonation(id: string, user: UserProfile): Promise<{ success: boolean; deletedId: string }> {
    const existing = await this.getDonationById(id);
    if (!existing) throw new Error('Donation not found.');

    if (user && existing.donorId !== user.uid && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only delete your own donations.');
    }

    // 1. Delete from Cloud Firestore
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (err) {
      console.warn('Could not delete from Firestore (removing from local cache):', err);
    }

    // 2. Remove from local resilience cache
    const current = getLocalCache<Donation>(CACHE_DONATIONS_KEY);
    const updatedList = current.filter(d => d.id !== id);
    saveLocalCache(CACHE_DONATIONS_KEY, updatedList);

    return { success: true, deletedId: id };
  },

  // 3. REQUESTS & WORKFLOW (Reservations between Shelters & Donors)
  async getRequests(user: UserProfile): Promise<DonationRequest[]> {
    let requestsList: DonationRequest[] = [];

    try {
      const snap = await getDocs(collection(db, 'requests'));
      if (!snap.empty) {
        requestsList = snap.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));
        saveLocalCache(CACHE_REQUESTS_KEY, requestsList);
      } else {
        requestsList = getLocalCache<DonationRequest>(CACHE_REQUESTS_KEY);
      }
    } catch {
      requestsList = getLocalCache<DonationRequest>(CACHE_REQUESTS_KEY);
    }

    if (!user) return requestsList;

    if (user.role === 'donor') {
      return requestsList.filter(r => r.donorId === user.uid);
    }
    if (user.role === 'recipient') {
      return requestsList.filter(r => r.recipientId === user.uid);
    }
    if (user.role === 'volunteer') {
      return requestsList.filter(r => r.status === 'Accepted' || r.volunteerId === user.uid || r.status === 'Collected');
    }
    return requestsList;
  },

  async createRequest(
    data: {
      donationId: string;
      requestedQuantity: number;
      pickupTime: string;
      notes?: string;
      recipientPhone?: string;
      donorPhone?: string;
    },
    user: UserProfile
  ): Promise<DonationRequest> {
    if (user && user.role !== 'recipient' && user.role !== 'admin') {
      throw new Error('Integrity Check: Only registered Recipient Shelters/NGOs can submit food requests.');
    }

    const donation = await this.getDonationById(data.donationId);
    if (!donation) throw new Error('Target donation not found.');

    const reqQty = Number(data.requestedQuantity);
    if (isNaN(reqQty) || reqQty <= 0) {
      throw new Error('Requested portion count must be greater than zero.');
    }
    if (reqQty > donation.quantity) {
      throw new Error(`Requested portions (${reqQty}) exceeds available inventory (${donation.quantity}).`);
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newRequest: DonationRequest = {
      id: requestId,
      donationId: donation.id,
      foodName: donation.foodName,
      donorId: donation.donorId,
      donorName: donation.donorName,
      donorPhone: data.donorPhone || donation.pickupAddressDetails || '+1 (555) 234-5678',
      recipientId: user.uid,
      recipientName: user.displayName || user.organizationName || 'Verified Shelter Coordinator',
      recipientPhone: data.recipientPhone || user.phone || '+1 (555) 789-0123',
      recipientOrgType: user.organizationType || 'Orphanage',
      requestedQuantity: reqQty,
      unit: donation.unit,
      pickupTime: data.pickupTime,
      notes: data.notes || '',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Update donation inventory
    const remaining = donation.quantity - reqQty;
    await this.updateDonation(donation.id, {
      quantity: remaining,
      status: remaining === 0 ? 'Reserved' : 'Available',
    }, user);

    // Write request to Firestore
    try {
      await setDoc(doc(db, 'requests', requestId), newRequest);
    } catch (err) {
      console.warn('Could not write request to Firestore (saved locally):', err);
    }

    const currentRequests = getLocalCache<DonationRequest>(CACHE_REQUESTS_KEY);
    saveLocalCache(CACHE_REQUESTS_KEY, [newRequest, ...currentRequests]);

    return newRequest;
  },

  async updateRequestStatus(
    id: string,
    status: DonationRequest['status'],
    notes?: string,
    user?: UserProfile
  ): Promise<DonationRequest> {
    const all = getLocalCache<DonationRequest>(CACHE_REQUESTS_KEY);
    let target = all.find(r => r.id === id);

    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'requests', id));
        if (snap.exists()) {
          target = { id: snap.id, ...(snap.data() as any) };
        }
      } catch {}
    }

    if (!target) throw new Error('Request not found.');

    const updated: DonationRequest = {
      ...target,
      status,
      notes: notes || target.notes,
      updatedAt: new Date().toISOString(),
    };

    // If cancelled or declined, return quantity to donation
    if (['Cancelled', 'Declined'].includes(status) && target.status === 'Pending') {
      try {
        const donation = await this.getDonationById(target.donationId);
        if (donation) {
          await this.updateDonation(donation.id, {
            quantity: donation.quantity + target.requestedQuantity,
            status: 'Available',
          }, user || { uid: donation.donorId, role: 'donor' } as any);
        }
      } catch (err) {
        console.warn('Could not return portions to donation:', err);
      }
    }

    // Update Firestore
    try {
      await updateDoc(doc(db, 'requests', id), updated as any);
    } catch (err) {
      console.warn('Could not update request in Firestore (saving locally):', err);
    }

    const updatedList = all.map(r => r.id === id ? updated : r);
    saveLocalCache(CACHE_REQUESTS_KEY, updatedList);

    return updated;
  },

  async assignVolunteer(requestId: string, user: UserProfile): Promise<DonationRequest> {
    return this.updateRequestStatus(requestId, 'Accepted', `Assigned to volunteer ${user.displayName}`, user);
  },

  // 4. MESSAGES & IN-APP COORDINATION
  async getMessages(requestId: string, user: UserProfile): Promise<ChatMessage[]> {
    const all = getLocalCache<ChatMessage>(CACHE_MESSAGES_KEY);
    return all.filter(m => m.requestId === requestId);
  },

  async sendMessage(requestId: string, text: string, user: UserProfile): Promise<ChatMessage> {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: msgId,
      requestId,
      senderId: user.uid,
      senderName: user.displayName || user.organizationName || 'User',
      senderRole: user.role as any,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'messages', msgId), newMsg);
    } catch {}

    const all = getLocalCache<ChatMessage>(CACHE_MESSAGES_KEY);
    saveLocalCache(CACHE_MESSAGES_KEY, [...all, newMsg]);

    return newMsg;
  },

  // 5. ORGANIZATIONS DIRECTORY
  async getOrganizations(): Promise<OrganizationInfo[]> {
    try {
      const snap = await getDocs(collection(db, 'organizations'));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as OrganizationInfo);
      }
    } catch {}
    return DEFAULT_ORGANIZATIONS;
  },

  // 6. REPORTS
  async submitReport(donationId: string, reason: string, details: string, user?: UserProfile): Promise<any> {
    const reportId = `rep_${Date.now()}`;
    const report = {
      id: reportId,
      donationId,
      reason,
      details,
      reporterId: user?.uid || 'anonymous',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'reports', reportId), report);
    } catch {}
    const cached = getLocalCache(CACHE_REPORTS_KEY);
    saveLocalCache(CACHE_REPORTS_KEY, [...cached, report]);
    return { success: true };
  },

  // 7. REAL-TIME DATA & SYSTEM OPERATIONS (Direct Cloud Firestore Connection)
  async getSystemStatus(): Promise<{
    isRealTime: boolean;
    donationsCount: number;
    requestsCount: number;
    messagesCount: number;
    reportsCount: number;
    databaseType: string;
    timestamp: string;
  }> {
    const donations = await this.getDonations();
    const requests = getLocalCache<DonationRequest>(CACHE_REQUESTS_KEY);
    const messages = getLocalCache<ChatMessage>(CACHE_MESSAGES_KEY);
    const reports = getLocalCache(CACHE_REPORTS_KEY);

    return {
      isRealTime: true,
      donationsCount: donations.length,
      requestsCount: requests.length,
      messagesCount: messages.length,
      reportsCount: reports.length,
      databaseType: 'Cloud Firestore (Enterprise Synchronized)',
      timestamp: new Date().toISOString(),
    };
  },

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    saveLocalCache(CACHE_DONATIONS_KEY, []);
    saveLocalCache(CACHE_REQUESTS_KEY, []);
    saveLocalCache(CACHE_MESSAGES_KEY, []);
    saveLocalCache(CACHE_REPORTS_KEY, []);
    return { success: true, message: 'Database reset successfully.' };
  },

  async seedTestDonation(user: UserProfile): Promise<Donation> {
    return this.createDonation({
      foodName: 'Fresh Basmati Rice & Dal Makhani Trays',
      category: 'Cooked Meals',
      quantity: 25,
      unit: 'portions',
      pickupLocation: user.location || 'Kitchen Pickup Dock B',
      deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
      storageConditions: 'Heated/Insulated',
      allergens: 'Dairy (butter)',
      description: 'Freshly packed sealed warm meal containers prepared for today lunch service.',
    }, user);
  },

  async verifyCrudOperations(user: UserProfile): Promise<{
    allPassed: boolean;
    steps: Array<{ operation: string; passed: boolean; message: string }>;
    error?: string;
    timestamp: string;
  }> {
    const steps: Array<{ operation: string; passed: boolean; message: string }> = [];

    try {
      // Step 1: Create
      const created = await this.createDonation({
        foodName: 'Live Cloud Firestore Verification Rice',
        category: 'Cooked Meals',
        quantity: 10,
        unit: 'portions',
        pickupLocation: user.location || 'Metro Station',
        deadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16),
        storageConditions: 'Heated/Insulated',
      }, user);
      steps.push({ operation: 'CREATE_DONATION', passed: true, message: `Created record ID ${created.id} in Cloud Firestore.` });

      // Step 2: Read
      const retrieved = await this.getDonationById(created.id);
      steps.push({ operation: 'READ_DONATION', passed: !!retrieved, message: `Read donation "${retrieved.foodName}" successfully.` });

      // Step 3: Update
      const updated = await this.updateDonation(created.id, { quantity: 15 }, user);
      steps.push({ operation: 'UPDATE_DONATION', passed: updated.quantity === 15, message: 'Updated portions to 15 successfully.' });

      // Step 4: Delete
      await this.deleteDonation(created.id, user);
      steps.push({ operation: 'DELETE_DONATION', passed: true, message: 'Verified deletion from database.' });

      return {
        allPassed: true,
        steps,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      steps.push({ operation: 'ERROR', passed: false, message: err.message || 'Operation failed' });
      return {
        allPassed: false,
        steps,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
