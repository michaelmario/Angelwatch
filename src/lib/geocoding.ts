import { Location } from '@/lib/types';

const GEOCODING_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address string to lat/lng coordinates using Google Geocoding API.
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  if (!address.trim()) return null;

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GEOCODING_API_KEY}`
    );

    if (!response.ok) {
      console.error('Geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding no results:', data.status);
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

/**
 * Reverse geocode lat/lng to a formatted address.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!GEOCODING_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GEOCODING_API_KEY}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) return null;

    return data.results[0].formatted_address;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
}

/**
 * Calculate distance between two points in kilometers using Haversine formula.
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Sort drivers by distance from a given location.
 */
export function sortDriversByDistance<T extends { location: Location }>(
  drivers: T[],
  fromLocation: Location
): T[] {
  return [...drivers].sort((a, b) => {
    const distA = calculateDistance(fromLocation, a.location);
    const distB = calculateDistance(fromLocation, b.location);
    return distA - distB;
  });
}
