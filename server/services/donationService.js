/**
 * FoodLoop - Donation & Reservation Business Logic Service
 * Enforces transaction-safe reservations, quantity validations,
 * expiration checks, and status state transitions.
 */

// In-memory persistent state store for instant response and fallback
class FoodLoopDataStore {
  constructor() {
    // Seed data removed: starts fresh with empty real-time collections
    this.donations = [];
    this.requests = [];
    this.organizations = [];
    this.messages = [];
    this.reports = [];
  }

  // 1. DONATIONS CRUD
  listDonations({ search, category, status, storage, location }) {
    let result = [...this.donations];

    // Auto-update expired items
    const now = new Date();
    result.forEach(d => {
      if (new Date(d.deadline) <= now && d.status === 'Available') {
        d.status = 'Expired';
      }
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.foodName.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.pickupLocation.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      result = result.filter(d => d.category === category);
    }

    if (status && status !== 'All') {
      result = result.filter(d => d.status === status);
    }

    if (storage && storage !== 'All') {
      result = result.filter(d => d.storageConditions === storage);
    }

    if (location && location !== 'All') {
      result = result.filter(d => d.pickupLocation.toLowerCase().includes(location.toLowerCase()));
    }

    return result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  getDonationById(id) {
    return this.donations.find(d => d.id === id);
  }

  createDonation(data, user) {
    // Role Integrity Check: Only food donors are permitted to enter surplus food details
    if (user && user.role !== 'donor' && user.role !== 'admin') {
      throw new Error('Integrity Check Failed: Recipient organizations cannot enter new surplus food details. Surplus food can only be listed by verified Food Donors.');
    }

    if (!data.foodName || !data.quantity || !data.deadline || !data.category) {
      throw new Error('Validation failed: Missing required donation fields (foodName, quantity, deadline, category).');
    }

    const qty = parseFloat(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Validation failed: Quantity must be greater than zero.');
    }

    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      throw new Error('Validation failed: Pickup deadline must be set in the future.');
    }

    const newDonation = {
      id: `don_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      donorId: user?.uid || 'usr_donor_bistro',
      donorName: user?.displayName || user?.organizationName || 'Community Food Donor',
      donorType: user?.donorType || 'Restaurant / Donor',
      foodName: data.foodName.trim(),
      description: data.description ? data.description.trim() : '',
      category: data.category,
      quantity: qty,
      originalQuantity: qty,
      unit: data.unit || 'portions',
      pickupLocation: data.pickupLocation ? data.pickupLocation.trim() : 'Central Bay',
      pickupAddressDetails: data.pickupAddressDetails ? data.pickupAddressDetails.trim() : (data.pickupLocation ? data.pickupLocation.trim() : 'Pickup Hub'),
      prepTime: data.prepTime || new Date().toISOString(),
      deadline: deadlineDate.toISOString(),
      storageConditions: data.storageConditions || 'Room Temperature',
      allergens: data.allergens ? data.allergens.trim() : 'None declared',
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.donations.unshift(newDonation);
    return newDonation;
  }

  updateDonation(id, updates, user) {
    const donation = this.getDonationById(id);
    if (!donation) throw new Error('Donation not found.');

    if (user && donation.donorId !== user.uid && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only edit your own donations.');
    }

    // Check if reserved
    const activeRequests = this.requests.filter(r => r.donationId === id && ['Pending', 'Accepted'].includes(r.status));
    if (activeRequests.length > 0 && updates.quantity && parseFloat(updates.quantity) < donation.quantity) {
      throw new Error('Cannot reduce quantity below currently pending/accepted reservations.');
    }

    Object.assign(donation, updates, { updatedAt: new Date().toISOString() });
    return donation;
  }

  deleteDonation(id, user) {
    const idx = this.donations.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Donation not found.');

    const donation = this.donations[idx];
    if (user && donation.donorId !== user.uid && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only delete your own donations.');
    }

    const hasActiveReservations = this.requests.some(
      r => r.donationId === id && ['Accepted', 'Collected'].includes(r.status)
    );
    if (hasActiveReservations) {
      throw new Error('Cannot delete a donation with accepted or in-progress reservations.');
    }

    this.donations.splice(idx, 1);
    return { success: true, deletedId: id };
  }

  // 2. DONATION REQUESTS & RESERVATIONS
  listRequests(user) {
    if (!user) return this.requests;
    if (user.role === 'donor') {
      return this.requests.filter(r => r.donorId === user.uid);
    }
    if (user.role === 'recipient') {
      return this.requests.filter(r => r.recipientId === user.uid);
    }
    if (user.role === 'volunteer') {
      // Volunteers can see accepted requests ready for collection or assigned to them
      return this.requests.filter(r => r.status === 'Accepted' || r.volunteerId === user.uid || r.status === 'Collected');
    }
    return this.requests;
  }

  getRequestById(id) {
    return this.requests.find(r => r.id === id);
  }

  createRequest(data, user) {
    // Role Integrity Check: Donors cannot request their own surplus food
    if (user && user.role === 'donor') {
      throw new Error('Integrity Check Failed: Food Donors cannot request surplus food. Only registered Recipient Organizations (shelters, orphanages, NGOs) can submit requests.');
    }

    const donation = this.getDonationById(data.donationId);
    if (!donation) throw new Error('Target donation not found.');

    if (donation.status === 'Expired' || new Date(donation.deadline) <= new Date()) {
      throw new Error('This surplus food listing has expired and cannot be reserved.');
    }

    if (donation.status === 'Completed' || donation.status === 'Reserved' || donation.quantity <= 0) {
      throw new Error('This donation is currently unavailable or has reached full reservation.');
    }

    const requestedQty = parseFloat(data.requestedQuantity);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      throw new Error('Invalid requested quantity: Must be greater than 0.');
    }

    if (requestedQty > donation.quantity) {
      throw new Error(`Requested quantity (${requestedQty} ${donation.unit}) exceeds available quantity (${donation.quantity} ${donation.unit}).`);
    }

    // Deadline Constraint: Pickup must be within safe deadline
    if (data.pickupTime && new Date(data.pickupTime) > new Date(donation.deadline)) {
      throw new Error(`Integrity Check Failed: Intended pickup time cannot be after the food safety deadline (${new Date(donation.deadline).toLocaleTimeString()}).`);
    }

    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      donationId: donation.id,
      foodName: donation.foodName,
      donorId: donation.donorId,
      donorName: donation.donorName,
      donorPhone: data.donorPhone || '+1 (555) 234-5678',
      recipientId: user?.uid || 'usr_recipient_orphanage',
      recipientName: user?.displayName || user?.organizationName || 'Registered Recipient NGO',
      recipientPhone: user?.phone || data.recipientPhone || '+1 (555) 987-6543',
      recipientOrgType: user?.organizationType || 'Shelter / NGO',
      requestedQuantity: requestedQty,
      unit: donation.unit,
      pickupTime: data.pickupTime || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      notes: data.notes ? data.notes.trim() : 'Pickup scheduled via MealMitra platform.',
      status: 'Pending',
      volunteerId: '',
      volunteerName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.requests.unshift(newRequest);

    // Add initial status note in message history
    this.messages.push({
      id: `msg_sys_${Date.now()}`,
      requestId: newRequest.id,
      senderId: 'system',
      senderName: 'MealMitra Coordinator',
      senderRole: 'system',
      text: `Request submitted for ${requestedQty} ${donation.unit} with intended pickup at ${new Date(newRequest.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      createdAt: new Date().toISOString()
    });

    return newRequest;
  }

  updateRequestStatus(id, newStatus, user, notes = '') {
    const validStatuses = ['Accepted', 'Declined', 'Cancelled', 'Collected', 'Completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition to "${newStatus}".`);
    }

    const request = this.getRequestById(id);
    if (!request) throw new Error('Request not found.');

    const donation = this.getDonationById(request.donationId);
    if (!donation) throw new Error('Associated donation listing not found.');

    const previousStatus = request.status;

    // Concurrency & Reservation math:
    if (newStatus === 'Accepted' && previousStatus !== 'Accepted') {
      if (donation.quantity < request.requestedQuantity) {
        throw new Error(`Cannot accept request: Only ${donation.quantity} ${donation.unit} remain, but ${request.requestedQuantity} were requested.`);
      }
      donation.quantity = Math.max(0, donation.quantity - request.requestedQuantity);
      if (donation.quantity === 0) {
        donation.status = 'Reserved';
      }
    } else if (['Declined', 'Cancelled'].includes(newStatus) && previousStatus === 'Accepted') {
      // Restore inventory if an accepted reservation is cancelled
      donation.quantity += request.requestedQuantity;
      if (donation.status === 'Reserved') {
        donation.status = 'Available';
      }
    } else if (newStatus === 'Completed') {
      // Mark donation as completed if all quantity is used up
      if (donation.quantity === 0) {
        donation.status = 'Completed';
      }
    }

    request.status = newStatus;
    request.updatedAt = new Date().toISOString();

    // Log status message
    this.messages.push({
      id: `msg_sys_${Date.now()}`,
      requestId: request.id,
      senderId: user?.uid || 'system',
      senderName: user?.displayName || 'MealMitra System',
      senderRole: user?.role || 'system',
      text: `Request status changed from ${previousStatus} to "${newStatus}". ${notes ? `Note: ${notes}` : ''}`,
      createdAt: new Date().toISOString()
    });

    return request;
  }

  assignVolunteer(requestId, volunteerUser) {
    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Request not found.');

    request.volunteerId = volunteerUser.uid;
    request.volunteerName = volunteerUser.displayName;
    request.updatedAt = new Date().toISOString();

    this.messages.push({
      id: `msg_sys_${Date.now()}`,
      requestId: request.id,
      senderId: volunteerUser.uid,
      senderName: volunteerUser.displayName,
      senderRole: 'volunteer',
      text: `Volunteer ${volunteerUser.displayName} assigned for pickup and transit assistance.`,
      createdAt: new Date().toISOString()
    });

    return request;
  }

  // 3. MESSAGING
  getMessagesForRequest(requestId) {
    return this.messages.filter(m => m.requestId === requestId);
  }

  addMessage(requestId, text, user) {
    if (!text || !text.trim()) {
      throw new Error('Message text cannot be empty.');
    }

    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Request not found.');

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requestId,
      senderId: user?.uid || 'usr_anonymous',
      senderName: user?.displayName || 'Community Member',
      senderRole: user?.role || 'recipient',
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    this.messages.push(newMsg);
    return newMsg;
  }

  // 4. ORGANIZATIONS
  getOrganizations() {
    return this.organizations;
  }

  createOrganization(data) {
    const newOrg = {
      ...data,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    this.organizations.push(newOrg);
    return newOrg;
  }

  // 5. REPORTS
  submitReport(donationId, reason, details, user) {
    const report = {
      id: `rep_${Date.now()}`,
      donationId,
      reporterId: user?.uid || 'usr_anonymous',
      reason,
      details,
      createdAt: new Date().toISOString()
    };
    this.reports.push(report);
    return report;
  }

  // 6. DASHBOARD STATISTICS (Calculated from actual database records)
  getDashboardStats() {
    const now = new Date();
    // Auto mark expired
    this.donations.forEach(d => {
      if (new Date(d.deadline) <= now && d.status === 'Available') {
        d.status = 'Expired';
      }
    });

    const availableDonations = this.donations.filter(d => d.status === 'Available');
    const activeRequests = this.requests.filter(r => ['Pending', 'Accepted'].includes(r.status));
    const completedHandovers = this.requests.filter(r => ['Collected', 'Completed'].includes(r.status));
    
    // Calculate total quantity redistributed (from accepted, collected and completed requests)
    const totalRedistributedMeals = this.requests
      .filter(r => ['Accepted', 'Collected', 'Completed'].includes(r.status))
      .reduce((sum, r) => sum + (parseFloat(r.requestedQuantity) || 0), 0);

    const expiringSoon = this.donations.filter(d => {
      if (d.status !== 'Available') return false;
      const diffMs = new Date(d.deadline).getTime() - now.getTime();
      return diffMs > 0 && diffMs <= 3 * 3600 * 1000; // Less than 3 hours
    });

    return {
      availableCount: availableDonations.length,
      activeRequestsCount: activeRequests.length,
      completedHandoversCount: completedHandovers.length,
      totalRedistributedMeals: Math.round(totalRedistributedMeals * 10) / 10,
      expiringSoonCount: expiringSoon.length,
      recentDonations: this.donations.slice(0, 4),
      recentActivity: this.messages.slice(-5).reverse()
    };
  }

  // 7. REAL-TIME DATA TESTING & OPERATIONS VERIFICATION
  clearAllData() {
    this.donations = [];
    this.requests = [];
    this.messages = [];
    this.reports = [];
    return {
      success: true,
      message: 'All surplus donations and requests have been wiped. Database is completely fresh with 0 items.',
      timestamp: new Date().toISOString()
    };
  }

  seedTestDonation(user) {
    const testDonation = {
      foodName: `Fresh Prepared Meal Batch #${Math.floor(100 + Math.random() * 900)}`,
      category: 'Cooked Meals',
      quantity: 25,
      unit: 'portions',
      deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      pickupLocation: user?.location || 'Central Community Hub, Bay 2',
      pickupAddressDetails: user?.location || 'Main Gate Pickup, Contact Kitchen Manager',
      storageConditions: 'Hot Held (>60°C)',
      description: 'Hot nutritious meal prepared today. Verified safe, hygienic surplus portions.',
      allergens: 'None'
    };
    return this.createDonation(testDonation, user);
  }

  verifyCrudOperations(user) {
    const steps = [];
    try {
      // Step 1: CREATE operation
      const createPayload = {
        foodName: `CRUD Verification Test (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
        category: 'Cooked Meals',
        quantity: 20,
        unit: 'portions',
        deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        pickupLocation: 'Test Station Point A',
        pickupAddressDetails: '100 Test St, Facility 1',
        storageConditions: 'Room Temperature',
        description: 'Automated test surplus entry to verify real-time persistence.',
        allergens: 'None'
      };
      const created = this.createDonation(createPayload, user);
      steps.push({
        operation: 'CREATE',
        passed: true,
        message: `Successfully created listing "${created.foodName}" (ID: ${created.id}) with ${created.quantity} ${created.unit}.`
      });

      // Step 2: READ operation
      const readBack = this.getDonationById(created.id);
      if (!readBack || readBack.id !== created.id) {
        throw new Error('READ failed: Record could not be retrieved from real-time store after creation.');
      }
      steps.push({
        operation: 'READ',
        passed: true,
        message: `Successfully queried record by ID. Food: "${readBack.foodName}", Status: "${readBack.status}".`
      });

      // Step 3: UPDATE operation
      const updated = this.updateDonation(created.id, {
        quantity: 25,
        description: 'Updated quantity during automated operations verification.'
      }, user);
      if (updated.quantity !== 25) {
        throw new Error('UPDATE failed: Quantity was not properly updated in store.');
      }
      steps.push({
        operation: 'UPDATE',
        passed: true,
        message: `Successfully updated donation quantity to ${updated.quantity} ${updated.unit}.`
      });

      // Step 4: RESERVATION & INVENTORY DEDUCTION (WORKFLOW TEST)
      const recipientUser = {
        uid: 'usr_recipient_tester',
        displayName: 'Verification Shelter Test NGO',
        role: 'recipient',
        organizationName: 'Community Children Home',
        organizationType: 'Orphanage'
      };
      const testReq = this.createRequest({
        donationId: created.id,
        requestedQuantity: 10,
        pickupTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
        notes: 'Verification test request'
      }, recipientUser);
      steps.push({
        operation: 'REQUEST',
        passed: true,
        message: `Recipient successfully placed request for 10 ${created.unit}.`
      });

      // Step 5: ACCEPT & INVENTORY DEDUCTION
      this.updateRequestStatus(testReq.id, 'Accepted', user);
      const postAccept = this.getDonationById(created.id);
      if (postAccept.quantity !== 15) {
        throw new Error(`Inventory deduction failed: Expected 15 remaining, got ${postAccept.quantity}`);
      }
      steps.push({
        operation: 'STATUS & INVENTORY',
        passed: true,
        message: `Donor accepted request. Remaining inventory automatically deducted from 25 to ${postAccept.quantity} ${postAccept.unit}.`
      });

      // Step 6: DELETE & CLEANUP
      // Cancel request to allow clean deletion
      this.updateRequestStatus(testReq.id, 'Cancelled', user);
      const deleteResult = this.deleteDonation(created.id, user);
      if (!deleteResult.success) {
        throw new Error('DELETE failed: Unable to remove test donation.');
      }
      steps.push({
        operation: 'DELETE',
        passed: true,
        message: `Successfully deleted test donation (${deleteResult.deletedId}). Clean-up complete.`
      });

      return {
        allPassed: true,
        steps,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      steps.push({
        operation: 'ERROR',
        passed: false,
        message: err.message
      });
      return {
        allPassed: false,
        steps,
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const foodLoopDataStore = new FoodLoopDataStore();
