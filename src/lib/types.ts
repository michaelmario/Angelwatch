
export type UserRole = 'client' | 'driver' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'suspended';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  vehicle?: string;
  rating?: number;
  reviewCount?: number;
  verificationStatus?: VerificationStatus;
  createdAt?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface DriverStatus {
  id: string;
  name: string;
  location: Location;
  isAvailable: boolean;
  updatedAt?: string;
}

export type RequestStatus = 'awaiting' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  driverId?: string;
  driverName?: string;
  status: RequestStatus;
  destination: string;
  destinationCoords?: Location;
  pickupAddress?: string;
  pickupCoords?: Location;
  eta?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Tip {
  id: string;
  requestId: string;
  driverId: string;
  driverName: string;
  clientId: string;
  clientName: string;
  amount: number; // in EUR
  createdAt: string;
}

export interface Payout {
  id: string;
  driverId: string;
  driverName: string;
  amount: number; // in EUR
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount?: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface SosAlert {
  id: string;
  clientId: string;
  clientName: string;
  requestId?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  resolved: boolean;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  motivation: string;
  drivingLicenseUrl?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface QuickBooking {
  id: string;
  name: string;
  pickupLocation: string;
  desiredTime: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}
