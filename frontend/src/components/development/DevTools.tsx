import React, { useState, useEffect } from 'react';
import { PerformanceWidget, performanceMonitor } from '../../utils/performance';

const DevTools: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [buildInfo, setBuildInfo] = useState<any>(null);

  useEffect(() => {
    // Show dev tools only in development
    if (__DEV__) {
      // Listen for keyboard shortcut (Ctrl/Cmd + Shift + D)
      const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
          setIsVisible(!isVisible);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      
      // Load build information
      fetch('/package.json')
        .then(res => res.json())
        .then(setBuildInfo)
        .catch(() => {});

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [isVisible]);

  if (!__DEV__) return null;

  return (
    <>
      {/* Performance widget disabled - user preference */}
      
      {isVisible && (
        <div className="fixed top-4 left-4 bg-black/90 text-white p-6 rounded-lg text-sm font-mono z-50 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary font-bold">KatalisApp DevTools</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-green-400 mb-1">Build Info</h4>
              <div className="text-xs space-y-1">
                <div>Version: {buildInfo?.version || 'Unknown'}</div>
                <div>React: {buildInfo?.dependencies?.react || 'Unknown'}</div>
                <div>Vite: {buildInfo?.devDependencies?.vite || 'Unknown'}</div>
                <div>Mode: {import.meta.env.MODE}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-blue-400 mb-1">Environment</h4>
              <div className="text-xs space-y-1">
                <div>NODE_ENV: {import.meta.env.NODE_ENV}</div>
                <div>DEV: {__DEV__.toString()}</div>
                <div>Base URL: {import.meta.env.BASE_URL}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-yellow-400 mb-1">Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => performanceMonitor.logMetrics()}
                  className="block w-full text-left px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Log Performance Metrics
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full text-left px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Force Reload
                </button>
                <button
                  onClick={() => {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations()
                        .then(registrations => {
                          registrations.forEach(sw => sw.unregister());
                          console.log('Service workers cleared');
                        });
                    }
                  }}
                  className="block w-full text-left px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Clear Service Workers
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
            Press Ctrl/Cmd + Shift + D to toggle
          </div>
        </div>
      )}
    </>
  );
};

export default DevTools;