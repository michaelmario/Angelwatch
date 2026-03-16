
export type UserRole = 'client' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
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
}

export type RequestStatus = 'awaiting' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  driverId?: string;
  driverName?: string;
  status: RequestStatus;
  destination: string;
  createdAt: string;
}
