import { Donation, DonationRequest, ChatMessage, OrganizationInfo, DashboardStats, UserProfile } from '../types';

const BASE_URL = '/api';

function getHeaders(currentUser?: UserProfile | null): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentUser) {
    headers['x-simulated-user'] = JSON.stringify(currentUser);
    headers['Authorization'] = `Bearer ${currentUser.uid}`;
  }
  return headers;
}

export const api = {
  // 1. DASHBOARD
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard statistics.');
    const json = await res.json();
    return json.data;
  },

  // 2. DONATIONS CRUD
  async getDonations(params?: { search?: string; category?: string; status?: string; storage?: string; location?: string }): Promise<Donation[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.storage) query.set('storage', params.storage);
    if (params?.location) query.set('location', params.location);

    const res = await fetch(`${BASE_URL}/donations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch donations.');
    const json = await res.json();
    return json.data;
  },

  async getDonationById(id: string): Promise<Donation> {
    const res = await fetch(`${BASE_URL}/donations/${id}`);
    if (!res.ok) throw new Error('Failed to retrieve donation details.');
    const json = await res.json();
    return json.data;
  },

  async createDonation(data: Partial<Donation>, user: UserProfile): Promise<Donation> {
    const res = await fetch(`${BASE_URL}/donations`, {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create donation.');
    return json.data;
  },

  async updateDonation(id: string, data: Partial<Donation>, user: UserProfile): Promise<Donation> {
    const res = await fetch(`${BASE_URL}/donations/${id}`, {
      method: 'PUT',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update donation.');
    return json.data;
  },

  async deleteDonation(id: string, user: UserProfile): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/donations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(user),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete donation.');
    return json;
  },

  // 3. REQUESTS & WORKFLOW
  async getRequests(user: UserProfile): Promise<DonationRequest[]> {
    const res = await fetch(`${BASE_URL}/requests`, {
      headers: getHeaders(user),
    });
    if (!res.ok) throw new Error('Failed to fetch donation requests.');
    const json = await res.json();
    return json.data;
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
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit request.');
    return json.data;
  },

  async updateRequestStatus(
    id: string,
    status: DonationRequest['status'],
    notes?: string,
    user?: UserProfile
  ): Promise<DonationRequest> {
    const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify({ status, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update request status.');
    return json.data;
  },

  async assignVolunteer(requestId: string, user: UserProfile): Promise<DonationRequest> {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/assign-volunteer`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to assign volunteer.');
    return json.data;
  },

  // 4. MESSAGES & IN-APP COMMUNICATION
  async getMessages(requestId: string, user: UserProfile): Promise<ChatMessage[]> {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/messages`, {
      headers: getHeaders(user),
    });
    if (!res.ok) throw new Error('Failed to retrieve messages.');
    const json = await res.json();
    return json.data;
  },

  async sendMessage(requestId: string, text: string, user: UserProfile): Promise<ChatMessage> {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/messages`, {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send message.');
    return json.data;
  },

  // 5. ORGANIZATIONS
  async getOrganizations(): Promise<OrganizationInfo[]> {
    const res = await fetch(`${BASE_URL}/organizations`);
    if (!res.ok) throw new Error('Failed to fetch organizations.');
    const json = await res.json();
    return json.data;
  },

  // 6. REPORTS
  async submitReport(donationId: string, reason: string, details: string, user?: UserProfile): Promise<any> {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify({ donationId, reason, details }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit report.');
    return json.data;
  },

  // 7. REAL-TIME DATA & SYSTEM OPERATIONS
  async getSystemStatus(): Promise<{
    isRealTime: boolean;
    donationsCount: number;
    requestsCount: number;
    messagesCount: number;
    reportsCount: number;
    databaseType: string;
    timestamp: string;
  }> {
    const res = await fetch(`${BASE_URL}/system/status`);
    if (!res.ok) throw new Error('Failed to retrieve system status.');
    const json = await res.json();
    return json.data;
  },

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/system/clear-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to clear real-time database.');
    return json;
  },

  async seedTestDonation(user: UserProfile): Promise<Donation> {
    const res = await fetch(`${BASE_URL}/system/seed-test`, {
      method: 'POST',
      headers: getHeaders(user),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add test surplus donation.');
    return json.data;
  },

  async verifyCrudOperations(user: UserProfile): Promise<{
    allPassed: boolean;
    steps: Array<{ operation: string; passed: boolean; message: string }>;
    error?: string;
    timestamp: string;
  }> {
    const res = await fetch(`${BASE_URL}/system/verify-crud`, {
      method: 'POST',
      headers: getHeaders(user),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Operations verification run failed.');
    return json.data;
  },
};
