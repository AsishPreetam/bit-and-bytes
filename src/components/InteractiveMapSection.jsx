import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Search, 
  MapPin, 
  Navigation, 
  ChevronRight, 
  SlidersHorizontal,
  Compass,
  AlertCircle,
  LocateFixed,
  RefreshCw,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  Calendar,
  Eye
} from 'lucide-react';
import ProjectDetailModal from './ProjectDetailModal';
import { 
  GEOAPIFY_API_KEY, 
  GEOAPIFY_TILE_STYLES, 
  GEOAPIFY_ATTRIBUTION,
  reverseGeocodeGeoapify,
  searchAddressGeoapify,
  calculateHaversineDistance,
  formatVicinityDistance
} from '../services/geoapify';

// Preset sample localities across Bengaluru for instant testing or fallback
const PRESET_LOCALITIES = [
  { name: 'MG Road / Central', lat: 12.9752, lng: 77.6080 },
  { name: 'Indiranagar', lat: 12.9733, lng: 77.6405 },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'North Arterial', lat: 12.9980, lng: 77.5850 },
  { name: 'Old Town Heritage', lat: 12.9640, lng: 77.5750 },
  { name: 'Outer Ring Bypass', lat: 12.9105, lng: 77.6155 }
];

export default function InteractiveMapSection({ projects, onSelectProject, onReportIssue }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [mapStyleKey, setMapStyleKey] = useState('bright'); // 'bright', 'smooth', 'positron'

  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('idle'); // 'idle', 'requesting', 'granted', 'denied'
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedModalProject, setSelectedModalProject] = useState(null);
  const [showAllCards, setShowAllCards] = useState(false);

  const filterOptions = [
    { label: 'All Projects', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Planned', value: 'Approved/Planned' },
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Completed', value: 'Completed' },
  ];

  // Request browser geolocation permission & reverse geocode via Geoapify
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermissionStatus('denied');
      return;
    }

    setLocationPermissionStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationPermissionStatus('granted');

        // Reverse geocode via Geoapify
        const geoInfo = await reverseGeocodeGeoapify(coords.lat, coords.lng);
        setLocationAddress(geoInfo);

        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([coords.lat, coords.lng], 13.5, {
            animate: true,
            duration: 1.2
          });
        }
      },
      (err) => {
        console.warn('Geolocation denied or error:', err);
        setLocationPermissionStatus('denied');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Set preset locality as current center & reverse geocode
  const handleSelectPresetLocality = async (preset) => {
    const coords = { lat: preset.lat, lng: preset.lng };
    setUserLocation(coords);
    setLocationPermissionStatus('granted');

    const geoInfo = await reverseGeocodeGeoapify(preset.lat, preset.lng);
    setLocationAddress(geoInfo);

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([preset.lat, preset.lng], 13.5, {
        animate: true,
        duration: 1.2
      });
    }
  };

  // Reset location filter
  const handleResetLocation = () => {
    setUserLocation(null);
    setLocationAddress(null);
    setLocationPermissionStatus('idle');
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([12.965, 77.61], 12);
    }
  };

  // Handle address autocomplete search as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingAddress(true);
      const results = await searchAddressGeoapify(searchQuery, userLocation);
      setSearchResults(results.slice(0, 5));
      setSearchingAddress(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, userLocation]);

  const handleSelectSearchResult = (result) => {
    setSearchQuery(result.label);
    setSearchResults([]);
    const coords = { lat: result.lat, lng: result.lng };
    setUserLocation(coords);
    setLocationPermissionStatus('granted');
    setLocationAddress({
      formatted: result.label,
      locality: result.locality || 'Searched Corridor',
      city: 'Bengaluru'
    });

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([result.lat, result.lng], 14, {
        animate: true,
        duration: 1.2
      });
    }
  };

  // Calculate distances and filter projects
  const processedProjects = (projects || []).map((p) => {
    let distanceKm = null;
    if (userLocation && p.lat && p.lng) {
      distanceKm = calculateHaversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
    }
    return {
      ...p,
      distanceKm
    };
  });

  const filteredProjects = processedProjects.filter((p) => {
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Approved/Planned') {
        if (p.status !== 'Approved/Planned' && p.status !== 'Proposed') return false;
      } else if (p.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name && p.name.toLowerCase().includes(q);
      const matchRoad = p.roadSegment && p.roadSegment.toLowerCase().includes(q);
      const matchDept = p.department && p.department.toLowerCase().includes(q);
      const matchCont = p.contractorName && p.contractorName.toLowerCase().includes(q);
      if (!matchName && !matchRoad && !matchDept && !matchCont) return false;
    }

    if (userLocation && p.distanceKm != null && radiusKm !== 'all') {
      if (p.distanceKm > Number(radiusKm)) return false;
    }

    return true;
  });

  // Sort by vicinity distance if user location is active
  if (userLocation) {
    filteredProjects.sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  // Initialize Leaflet Map with Geoapify Raster Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const defaultCenter = [12.965, 77.61];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    const activeTileUrl = GEOAPIFY_TILE_STYLES[mapStyleKey]?.url || GEOAPIFY_TILE_STYLES.bright.url;

    const tileLayer = L.tileLayer(activeTileUrl, {
      attribution: GEOAPIFY_ATTRIBUTION,
      maxZoom: 20,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update tile layer style when mapStyleKey changes
  useEffect(() => {
    if (!leafletMapRef.current || !tileLayerRef.current) return;
    const newUrl = GEOAPIFY_TILE_STYLES[mapStyleKey]?.url || GEOAPIFY_TILE_STYLES.bright.url;
    tileLayerRef.current.setUrl(newUrl);
  }, [mapStyleKey]);

  // Update Map Markers & User Location Radar Beacon
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    // Render User Location with animated Radar beacon icon
    if (userLocation) {
      const userBeaconIcon = L.divIcon({
        className: 'geoapify-user-beacon',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(2, 132, 199, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 2;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const uMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userBeaconIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      const addressText = locationAddress?.formatted || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
      uMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <strong style="color: #0284c7; display: block; margin-bottom: 2px;">📍 Your Location (Geoapify Verified)</strong>
          <span style="color: #334155;">${addressText}</span>
        </div>
      `);

      userMarkerRef.current = uMarker;

      // Vicinity radius circle
      if (radiusKm !== 'all') {
        const radMeters = Number(radiusKm) * 1000;
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: radMeters,
          color: '#0284c7',
          weight: 1.5,
          fillColor: '#0284c7',
          fillOpacity: 0.05,
          dashArray: '5, 5',
        }).addTo(map);
        radiusCircleRef.current = circle;
      }
    }

    // Render Project Markers
    filteredProjects.forEach((proj) => {
      if (!proj.lat || !proj.lng) return;

      const getMarkerColor = (st) => {
        if (st === 'Active') return '#059669';
        if (st === 'Approved/Planned') return '#0284c7';
        if (st === 'Delayed') return '#e11d48';
        if (st === 'Completed') return '#10b981';
        return '#d97706';
      };

      const color = getMarkerColor(proj.status);

      const customIcon = L.divIcon({
        className: 'clean-leaflet-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.18);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([proj.lat, proj.lng], { icon: customIcon }).addTo(map);

      const distanceBadgeHtml = proj.distanceKm != null 
        ? `<div style="font-size: 10px; color: #0284c7; font-weight: 700; margin-bottom: 2px;">⚡ ${formatVicinityDistance(proj.distanceKm)}</div>`
        : '';

      const popupHtml = `
        <div style="min-width: 190px; padding: 2px; font-family: inherit;">
          <div style="font-size: 10px; color: ${color}; font-weight: 700; text-transform: uppercase; margin-bottom: 1px;">
            ${proj.status}
          </div>
          ${distanceBadgeHtml}
          <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 3px 0; color: #0f172a; line-height: 1.3;">
            ${proj.name}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            ${proj.roadSegment}
          </p>
          <div style="display: flex; gap: 4px;">
            <button id="marker-view-${proj.id}" style="
              flex: 1;
              background: #0f172a;
              color: #ffffff;
              border: none;
              padding: 5px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              View Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-view-${proj.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedModalProject(proj);
          };
        }
      });

      markersRef.current.push(marker);
    });
  }, [filteredProjects, userLocation, radiusKm, locationAddress]);

  const handleCardClick = (proj) => {
    setSelectedModalProject(proj);
    if (leafletMapRef.current && proj.lat && proj.lng) {
      leafletMapRef.current.flyTo([proj.lat, proj.lng], 14.5, {
        animate: true,
        duration: 1
      });
    }
  };

  const displayedCards = showAllCards ? filteredProjects : filteredProjects.slice(0, 4);

  return (
    <section id="explore-projects" className="py-20 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Geoapify Maps & Vicinity Detection</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Interactive Map & Nearby Projects
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Explore public works scheduled across your city. Allow location access to view active excavation permits in your immediate vicinity.
            </p>
          </div>

          {/* Quick Tile Style Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <span className="text-[11px] text-slate-500 px-2">Map Style:</span>
            {Object.keys(GEOAPIFY_TILE_STYLES).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setMapStyleKey(k)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  mapStyleKey === k
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Location Permission / Vicinity Banner */}
        <div className="mb-6 p-4 rounded-2xl border transition-all duration-300 bg-gradient-to-r from-sky-50/70 via-white to-emerald-50/50 border-sky-200/80 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                userLocation ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700'
              }`}>
                <LocateFixed className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {userLocation 
                      ? `Your Vicinity: ${locationAddress?.locality || 'Current Area'}`
                      : 'Discover Roadworks Near Your Location'
                    }
                  </h3>
                  {userLocation && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      GPS Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  {userLocation 
                    ? `Displaying ${filteredProjects.length} infrastructure projects within ${radiusKm === 'all' ? 'All' : `${radiusKm} km`} of ${locationAddress?.formatted || 'your location'}.`
                    : 'Grant location permission to automatically measure distance to active trenching and resurfacing sites in your neighborhood.'
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {userLocation ? (
                <>
                  <button
                    type="button"
                    onClick={handleRequestLocation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh GPS</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLocation}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Reset Filter
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={locationPermissionStatus === 'requesting'}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{locationPermissionStatus === 'requesting' ? 'Requesting GPS...' : 'Allow Location & Find Nearby'}</span>
                </button>
              )}
            </div>

          </div>

          {/* Quick 1-Click Locality Chips (Great for testing & when GPS is blocked) */}
          <div className="mt-3 pt-3 border-t border-sky-100/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Or jump to neighborhood:</span>
            {PRESET_LOCALITIES.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleSelectPresetLocality(loc)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
              >
                📍 {loc.name}
              </button>
            ))}
          </div>

        </div>

        {/* Search & Filters */}
        <div className="clean-card p-4 bg-slate-50/70 border border-slate-200/80 mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input with Geoapify Autocomplete */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search road corridor, neighborhood, or agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 text-slate-900"
              />

              {/* Geoapify Live Autocomplete Suggestions */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs max-h-60 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Geoapify Matching Places
                  </div>
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold block text-slate-900 truncate">{res.locality || res.street}</span>
                        <span className="text-[11px] text-slate-500 truncate block">{res.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Pills */}
            <div className="md:col-span-6 flex flex-wrap items-center gap-1.5 justify-start md:justify-end">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedStatus === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

          </div>

          {/* Vicinity Radius Filter */}
          {userLocation && (
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                <span className="font-medium">Filter by Distance from You:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '2 km', value: 2 },
                  { label: '5 km', value: 5 },
                  { label: '10 km', value: 10 },
                  { label: '25 km', value: 25 },
                  { label: 'All', value: 'all' },
                ].map((rad) => (
                  <button
                    key={rad.label}
                    type="button"
                    onClick={() => setRadiusKm(rad.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      radiusKm === rad.value
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {rad.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map & Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Leaflet Map (Left) */}
          <div className="lg:col-span-7">
            <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <div ref={mapContainerRef} className="w-full h-full" />
              
              {/* Soft Legend */}
              <div className="absolute top-3 right-3 z-[400] p-3 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 text-[11px] space-y-1 shadow-sm font-medium">
                <div className="text-slate-400 font-bold mb-1 text-[10px] uppercase">Status Legend</div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Active Works
                </div>
                <div className="flex items-center gap-1.5 text-sky-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Planned / Approved
                </div>
                <div className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Delayed
                </div>
                <div className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Awaiting Inspection
                </div>
                {userLocation && (
                  <div className="flex items-center gap-1.5 text-sky-800 pt-1 border-t border-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" /> Your Location
                  </div>
                )}
              </div>

              {/* Geoapify Attribution Watermark */}
              <div className="absolute bottom-1 left-2 z-[400] bg-white/80 px-2 py-0.5 rounded text-[10px] text-slate-500 font-medium">
                Geoapify Maps Engine
              </div>
            </div>
          </div>

          {/* Project Cards (Right) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>{filteredProjects.length} Projects in Area</span>
              <span>{userLocation ? 'Sorted by Proximity' : selectedStatus}</span>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs font-medium text-slate-600">No projects found in this vicinity radius or category.</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setRadiusKm('all'); setSelectedStatus('All'); setSearchQuery(''); }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    View All Bengaluru Works
                  </button>
                </div>
              </div>
            ) : (
              displayedCards.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => handleCardClick(proj)}
                  className="clean-card p-4 bg-white flex flex-col justify-between cursor-pointer group hover:border-emerald-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          proj.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          proj.status === 'Approved/Planned' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                          proj.status === 'Delayed' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {proj.status}
                        </span>

                        {proj.distanceKm != null && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5 text-sky-600" />
                            {formatVicinityDistance(proj.distanceKm)}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {proj.id}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{proj.roadSegment}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                      <span>Agency: <strong className="text-slate-600">{proj.department}</strong></span>
                      <span>Target: <strong className="text-slate-600 font-mono">{proj.endDate}</strong></span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(proj);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Focus on Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalProject(proj);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                    >
                      Full Details →
                    </button>
                  </div>
                </div>
              ))
            )}

            {filteredProjects.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllCards(!showAllCards)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {showAllCards ? 'Show Fewer Cards' : `View All ${filteredProjects.length} Projects in List`}
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedModalProject}
        isOpen={!!selectedModalProject}
        onClose={() => setSelectedModalProject(null)}
        onReportIssue={(proj) => {
          setSelectedModalProject(null);
          if (onReportIssue) onReportIssue(proj);
        }}
      />

    </section>
  );
}
