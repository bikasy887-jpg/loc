import React, { useState } from 'react';
import './LocationShare.css'; // Import the stylesheet here

const LocationShare = () => {
  const [inputValue, setInputValue] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractCoordsFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const qParam = urlObj.searchParams.get('q');
      if (qParam) {
        const parts = qParam.split(',');
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
        }
      }

      const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = url.match(regex);
      if (match && match[1] && match[2]) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    } catch (e) {}
    return null;
  };

  const handleProcessLocation = () => {
    setError(null);
    setLocation(null);

    if (inputValue.trim().startsWith('http')) {
      const coords = extractCoordsFromUrl(inputValue.trim());
      if (coords) {
        setLocation({
          lat: coords.lat,
          lng: coords.lng,
          mapUrl: `https://google.com{coords.lat},${coords.lng}`
        });
      } else {
        setError('Could not extract coordinates from this URL. Make sure it contains lat/lng values.');
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          mapUrl: `https://google.com{latitude},${longitude}`
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError('Failed to retrieve browser GPS coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="location-container">
      <h2 className="location-title">Share Your Location</h2>
      <p className="location-description">
        Paste a Google Maps link to extract coordinates, or type a text label to look up your live GPS location.
      </p>
      
      <div className="input-group">
        <label htmlFor="location-input" className="input-label">
          Maps Link or Location Label
        </label>
        <input
          id="location-input"
          className="location-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste URL or type e.g., My Office"
        />
      </div>

      <button 
        className="action-button"
        onClick={handleProcessLocation} 
        disabled={loading}
      >
        {loading ? 'Fetching Location...' : inputValue.trim().startsWith('http') ? 'Extract from Link' : 'Get Location & Create Link'}
      </button>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {location && (
        <div className="result-card">
          <h3 className="result-title">Processed Location Data</h3>
          {inputValue && !inputValue.trim().startsWith('http') && (
            <p className="result-text"><strong>Label:</strong> {inputValue}</p>
          )}
          <p className="result-text"><strong>Latitude:</strong> {location.lat}</p>
          <p className="result-text"><strong>Longitude:</strong> {location.lng}</p>
          <a className="maps-link" href={location.mapUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationShare;
