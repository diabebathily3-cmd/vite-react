import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";

const BAMAKO_POPULAR = [
  { name: "ACI 2000", lat: 12.6461, lng: -7.9925 },
  { name: "Hamdallaye", lat: 12.6234, lng: -8.0156 },
  { name: "Badalabougou", lat: 12.6178, lng: -7.9845 },
  { name: "Hippodrome", lat: 12.6512, lng: -8.0234 },
  { name: "Kalaban Coura", lat: 12.5823, lng: -8.0012 },
  { name: "Magnambougou", lat: 12.5956, lng: -7.9567 },
  { name: "Sotuba", lat: 12.6734, lng: -7.9234 },
  { name: "Quartier du Fleuve", lat: 12.6456, lng: -7.9923 },
  { name: "Lafiabougou", lat: 12.6345, lng: -8.0456 },
  { name: "Faladié", lat: 12.5890, lng: -7.9678 },
  { name: "Sebenikoro", lat: 12.6567, lng: -8.0567 },
  { name: "Missabougou", lat: 12.6012, lng: -7.9345 },
  { name: "Niamakoro", lat: 12.5734, lng: -7.9890 },
  { name: "Djicoroni Para", lat: 12.5945, lng: -8.0234 },
  { name: "Torokorobougou", lat: 12.6189, lng: -8.0389 },
  { name: "Banconi", lat: 12.6678, lng: -8.0123 },
  { name: "Médina Coura", lat: 12.6489, lng: -7.9978 },
  { name: "Niarela", lat: 12.6523, lng: -7.9856 },
  { name: "Baco-Djicoroni", lat: 12.6012, lng: -8.0089 },
  { name: "Sabalibougou", lat: 12.6098, lng: -8.0145 },
  { name: "Kati", lat: 12.7445, lng: -8.0720 },
  { name: "Aéroport Bamako", lat: 12.5335, lng: -7.9499 },
  { name: "Gare routière Sogoniko", lat: 12.5812, lng: -7.9756 },
  { name: "Grand Marché", lat: 12.6478, lng: -8.0012 },
];

const LocationSearch = ({ label, placeholder, value, onChange, testId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
        setShowPopular(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchNominatim = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", Bamako, Mali")}&limit=6&addressdetails=1&viewbox=-8.2,-7.85,12.5,12.8&bounded=0`
      );
      const data = await res.json();
      const mapped = data.map((item) => ({
        name: item.display_name.split(",").slice(0, 3).join(", "),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        full: item.display_name,
      }));
      setResults(mapped);
      setShowDropdown(true);
      setShowPopular(false);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => searchNominatim(val), 400);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (loc) => {
    onChange({ lat: loc.lat, lng: loc.lng, address: loc.name });
    setQuery(loc.name);
    setShowDropdown(false);
    setShowPopular(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setResults([]);
    setShowDropdown(false);
    setShowPopular(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query.length >= 2 && results.length > 0) {
      setShowDropdown(true);
    } else if (query.length < 2) {
      setShowPopular(true);
    }
  };

  // Filter popular locations based on query
  const filteredPopular = query.length > 0
    ? BAMAKO_POPULAR.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      )
    : BAMAKO_POPULAR;

  return (
    <div className="relative mb-3">
      <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="brutalist-input w-full pl-10 pr-10 p-3"
          data-testid={testId}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {(query || value) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            data-testid={`${testId}-clear`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nominatim search results */}
      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-h-48 overflow-y-auto"
          data-testid={`${testId}-results`}
        >
          {results.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-3 py-2.5 hover:bg-[#FFBE00] flex items-center gap-2 border-b border-gray-100 last:border-0 text-sm"
              data-testid={`${testId}-result-${i}`}
            >
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{loc.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular locations */}
      {showPopular && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-h-56 overflow-y-auto"
          data-testid={`${testId}-popular`}
        >
          <div className="px-3 py-2 bg-gray-50 border-b border-black">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quartiers populaires</span>
          </div>
          {filteredPopular.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-3 py-2.5 hover:bg-[#FFBE00] flex items-center gap-2 border-b border-gray-100 last:border-0 text-sm"
              data-testid={`${testId}-popular-${loc.name}`}
            >
              <MapPin className="w-4 h-4 text-[#FFBE00] flex-shrink-0" />
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
