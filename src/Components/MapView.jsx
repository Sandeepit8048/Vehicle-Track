import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import routeData from '../Data/dummy-route.json';
import day from '../Data/day.json';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const vehicleIcon = L.divIcon({
  html: `<div style="font-size: 24px; color: red;">🚗</div>`,
  iconSize: [32, 32],
  className: '',
});

const MapView = () => {
  const coords = routeData.map((p) => [p.latitude, p.longitude]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [destinationIndex, setDestinationIndex] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [playing, setPlaying] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showTrack, setShowTrack] = useState(true);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef(null);

  const handlePlay = () => {
    if (destinationIndex !== null && destinationIndex !== currentIndex) {
      setPlaying(true);
      setShowPanel(false);
    }
  };

  const handleStop = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };

  const handleSpeedUp = () => {
    if (speed > 200) {
      setSpeed((prev) => prev - 200);
    }
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setPlaying(true);
    setShowPanel(false);
  };

  const handleCarClick = () => {
    setShowPanel(true);
  };

  useEffect(() => {
    if (playing && destinationIndex != null) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < destinationIndex) return prev + 1;
          if (prev > destinationIndex) return prev - 1;
          clearInterval(intervalRef.current);
          setPlaying(false);
          return prev;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, destinationIndex, speed]);

  const currentPos = coords[currentIndex];

  return (
    <div className="relative w-full h-screen bg-white p-2">
      {/* Top Controls */}
      <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 flex-wrap px-2">
        <h2 className="text-lg sm:text-xl font-semibold">Vehicle Tracking</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handlePlay}
            disabled={destinationIndex === null}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            ▶ Play
          </button>
          <button
            onClick={handleStop}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            ⏹ Stop
          </button>
          <button
            onClick={handleReplay}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            🔁 Replay
          </button>
          <button
            onClick={() => setShowTrack((prev) => !prev)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            {showTrack ? 'Hide Track' : 'Show Track'}
          </button>
          <button
            onClick={handleSpeedUp}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ⏩ Speed Up
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-[80vh] sm:h-[85vh]">
        <MapContainer center={coords[0]} zoom={13} className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={currentPos}
            icon={vehicleIcon}
            eventHandlers={{ click: handleCarClick }}
          />
          {showTrack && (
            <Polyline positions={coords.slice(0, currentIndex + 1)} color="green" />
          )}
        </MapContainer>
      </div>

      {/* Speed Info */}
      <div className="mt-2 text-sm text-gray-600 font-bold px-2">
        ⚡ Current Speed: {(1000 / speed).toFixed(1)}x
      </div>

      {/* Info Panel */}
      {showPanel && (
        <div className="absolute z-[1000] bg-white shadow-lg border rounded-lg p-4 w-[90%] max-w-[300px] sm:w-[300px] sm:right-8 sm:top-24 top-[30%] left-1/2 transform -translate-x-1/2 sm:transform-none">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">🚗 Vehicle Info</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-black text-sm"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600">📍 Location: {routeData[currentIndex]?.name || 'Unknown'}</p>
          <p className="text-sm">🔋 Battery: 16%</p>
          <p className="text-sm">🛣️ Distance: 834.89 km</p>
          <p className="text-sm">🚦 Speed: {(1000 / speed).toFixed(1)}x</p>

          <div className="my-2">
            <label htmlFor="dest" className="block text-sm font-medium">Select Destination:</label>
            <select
              id="dest"
              className="w-full mt-1 border rounded px-2 py-1"
              value={destinationIndex ?? ''}
              onChange={(e) => setDestinationIndex(Number(e.target.value))}
            >
              <option value="">-- Select --</option>
              {coords.map((_, idx) => (
                <option key={idx} value={idx}>Point {idx}</option>
              ))}
            </select>

            <label htmlFor="day" className="block text-sm font-medium mt-2">Today:</label>
            <select
              id="day"
              className="w-full mt-1 border rounded px-2 py-1"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            >
              <option value="">-- Select --</option>
              {day.map((item, idx) => (
                <option key={idx} value={item.day}>{item.day}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePlay}
            disabled={destinationIndex === null}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            ▶ Play Movement
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;
