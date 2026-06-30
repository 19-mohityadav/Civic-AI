import React from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface MapProps {
  center?: { lat: number; lng: number };
  issues?: any[];
  selectedIssue?: any;
  onSelectIssue?: (issue: any) => void;
}

export default function Map({ 
  center = { lat: 37.7749, lng: -122.4194 }, 
  issues = [], 
  selectedIssue, 
  onSelectIssue 
}: MapProps) {
  if (!API_KEY) {
    return (
      <div className="w-full h-[450px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden">
        {/* Modern styled Interactive Mock Map when API Key is absent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Mocking a beautiful vector map grid */}
        <svg className="absolute inset-0 w-full h-full text-slate-800" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="90%" y1="0" x2="90%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="20%" x2="100%" y2="20%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="currentColor" strokeWidth="0.5" />
          
          {/* Mock Roads */}
          <path d="M 0,150 Q 200,100 400,250 T 800,150" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
          <path d="M 150,0 Q 250,200 100,400" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
        </svg>

        {/* Dynamic Mock Markers */}
        <div className="absolute inset-0">
          {issues.map((issue, idx) => {
            // Distribute mockup dots on our beautiful vector canvas
            const mockX = 15 + (idx * 22) % 70;
            const mockY = 20 + (idx * 27) % 65;
            const isSelected = selectedIssue?.id === issue.id;

            return (
              <button
                key={issue.id}
                onClick={() => onSelectIssue?.(issue)}
                style={{ left: `${mockX}%`, top: `${mockY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-10`}
              >
                <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping ${
                  isSelected ? 'bg-red-400' : 'bg-blue-400'
                }`} />
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform ${
                  isSelected 
                    ? 'bg-red-500 scale-125 z-20' 
                    : 'bg-blue-600 hover:scale-110'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                
                {/* Popover label on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-800 text-white rounded-xl py-1.5 px-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] font-black shadow-xl z-30">
                  {issue.title}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center p-6 bg-slate-950/90 border border-slate-800 rounded-2xl relative z-20 max-w-xs mx-auto shadow-2xl">
          <p className="text-white font-black text-sm">Interactive Live Map HUD</p>
          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
            Configure GOOGLE_MAPS_PLATFORM_KEY to render Google Maps. Currently using fully-interactive Live Geospatial Mockup representing all real-time reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="w-full h-[450px] rounded-3xl overflow-hidden shadow-inner border border-gray-100">
        <GoogleMap
          defaultCenter={center}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {issues.map((issue) => {
            const isSelected = selectedIssue?.id === issue.id;
            return (
              <AdvancedMarker 
                key={issue.id}
                position={{ lat: issue.location.lat, lng: issue.location.lng }}
                onClick={() => onSelectIssue?.(issue)}
              >
                <Pin 
                  background={isSelected ? '#dc2626' : '#2563eb'} 
                  borderColor={isSelected ? '#991b1b' : '#1e40af'} 
                  glyphColor={'#fff'} 
                />
              </AdvancedMarker>
            );
          })}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}
