/**
 * Geoapify Maps & Geocoding Service for CivicSync
 */

export const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

export const GEOAPIFY_TILE_STYLES = {
  bright: {
    name: 'Standard Crisp (OSM Bright)',
    url: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
  },
  smooth: {
    name: 'Modern Soft (Bright Smooth)',
    url: `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
  },
  positron: {
    name: 'Minimal Light (Positron)',
    url: `https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
  },
};

export const GEOAPIFY_ATTRIBUTION = 
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/**
 * Perform reverse geocoding via Geoapify API to get clean street/locality address
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{ formatted: string, locality: string, city: string, full: object }>}
 */
export async function reverseGeocodeGeoapify(lat, lon) {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geoapify reverse geocode failed');
    const data = await res.json();

    if (data && data.features && data.features.length > 0) {
      const prop = data.features[0].properties;
      const locality = prop.suburb || prop.quarter || prop.neighbourhood || prop.district || prop.street || 'Bengaluru Urban';
      const city = prop.city || prop.county || 'Bengaluru';
      const formatted = prop.formatted || `${locality}, ${city}`;
      return {
        formatted,
        locality,
        city,
        street: prop.street || '',
        full: prop,
      };
    }
    return {
      formatted: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      locality: 'Local Vicinity',
      city: 'Unknown Area',
      full: null,
    };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return {
      formatted: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      locality: 'Current Coordinates',
      city: 'Your Location',
      full: null,
    };
  }
}

/**
 * Autocomplete address/street search using Geoapify
 * @param {string} text - Search text
 * @param {{ lat: number, lng: number }|null} proximity - Optional location bias
 * @returns {Promise<Array<{ label: string, lat: number, lng: number, locality: string }>>}
 */
export async function searchAddressGeoapify(text, proximity = null) {
  if (!text || text.trim().length < 2) return [];
  try {
    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text.trim())}&filter=countrycode:in&apiKey=${GEOAPIFY_API_KEY}`;
    if (proximity && proximity.lat && proximity.lng) {
      // Use user's actual location as bias for relevant results
      url += `&bias=proximity:${proximity.lng},${proximity.lat}`;
    }
    // No hardcoded location bias — let Geoapify return results based on query relevance

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.features || []).map((f) => ({
      label: f.properties.formatted,
      lat: f.properties.lat,
      lng: f.properties.lon,
      locality: f.properties.suburb || f.properties.quarter || f.properties.city || f.properties.name,
      street: f.properties.street || '',
    }));
  } catch (err) {
    console.warn('Geoapify search error:', err);
    return [];
  }
}

/**
 * Haversine distance formula between two coordinate points
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a kilometer distance into user-friendly string
 * @param {number} distanceKm
 * @returns {string}
 */
export function formatVicinityDistance(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
