export type UserRole = 'donor' | 'recipient' | 'volunteer' | 'admin';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Bakery & Bread'
  | 'Fresh Produce'
  | 'Dairy & Packaged'
  | 'Beverages'
  | 'Desserts & Snacks';

export type StorageCondition =
  | 'Refrigerated'
  | 'Room Temperature'
  | 'Heated/Insulated'
  | 'Frozen';

export type ListingStatus = 'Available' | 'Reserved' | 'Completed' | 'Expired';

export type RequestStatus =
  | 'Pending'
  | 'Accepted'
  | 'Declined'
  | 'Cancelled'
  | 'Collected'
  | 'Completed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationName?: string;
  organizationType?: string;
  phone?: string;
  location?: string;
  photoURL?: string;
  registrationNumber?: string;
  beneficiaries?: number;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorType: string;
  foodName: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  originalQuantity: number;
  unit: string;
  pickupLocation: string;
  pickupAddressDetails?: string;
  prepTime?: string;
  deadline: string;
  storageConditions: StorageCondition;
  allergens?: string;
  status: ListingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationRequest {
  id: string;
  donationId: string;
  foodName: string;
  donorId: string;
  donorName: string;
  donorPhone?: string;
  recipientId: string;
  recipientName: string;
  recipientPhone?: string;
  recipientOrgType: string;
  requestedQuantity: number;
  unit: string;
  pickupTime: string;
  notes?: string;
  status: RequestStatus;
  volunteerId?: string;
  volunteerName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: 'donor' | 'recipient' | 'volunteer' | 'system';
  text: string;
  createdAt: string;
}

export interface OrganizationInfo {
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  isVerified: boolean;
  beneficiaries?: number;
  description?: string;
}

export interface DashboardStats {
  availableCount: number;
  activeRequestsCount: number;
  completedHandoversCount: number;
  totalRedistributedMeals: number;
  expiringSoonCount: number;
  recentDonations: Donation[];
  recentActivity: ChatMessage[];
}
