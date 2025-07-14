import React from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  bundleSize: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    bundleSize: 0
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private rafId: number | null = null;

  constructor() {
    if (__DEV__) {
      this.startMonitoring();
    }
  }

  private startMonitoring() {
    this.measureFPS();
    this.measureMemory();
    this.measureBundleSize();
  }

  private measureFPS() {
    const tick = () => {
      const currentTime = performance.now();
      this.frameCount++;

      if (currentTime - this.lastTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private measureMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
    }
  }

  private async measureBundleSize() {
    try {
      const response = await fetch('/dist/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        let totalSize = 0;
        
        Object.values(manifest).forEach((file: any) => {
          if (file.file && file.file.endsWith('.js')) {
            totalSize += file.file.length; // Approximation
          }
        });
        
        this.metrics.bundleSize = Math.round(totalSize / 1024); // Convert to KB
      }
    } catch (error) {
      console.warn('Could not measure bundle size:', error);
    }
  }

  public measureRenderTime<T>(fn: () => T, componentName?: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.metrics.renderTime = end - start;
    
    if (__DEV__ && componentName) {
      console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }

  public getMetrics(): PerformanceMetrics {
    this.measureMemory();
    return { ...this.metrics };
  }

  public logMetrics() {
    if (__DEV__) {
      console.table(this.getMetrics());
    }
  }

  public destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React component wrapper for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceWrappedComponent(props: P) {
    return performanceMonitor.measureRenderTime(
      () => React.createElement(Component, props),
      componentName || Component.displayName || Component.name
    );
  };
}

// Hook for performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(
    performanceMonitor.getMetrics()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Development performance widget
export const PerformanceWidget: React.FC = () => {
  const metrics = usePerformanceMetrics();

  if (!__DEV__) return null;

  return React.createElement('div', {
    className: 'fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50'
  }, React.createElement('div', {
    className: 'grid grid-cols-2 gap-2'
  }, [
    React.createElement('div', { key: 'fps' }, ['FPS: ', React.createElement('span', {
      className: metrics.fps < 30 ? 'text-red-400' : 'text-green-400'
    }, metrics.fps)]),
    React.createElement('div', { key: 'memory' }, ['Memory: ', React.createElement('span', {
      className: metrics.memoryUsage > 100 ? 'text-yellow-400' : 'text-green-400'
    }, `${metrics.memoryUsage}MB`)]),
    React.createElement('div', { key: 'render' }, ['Render: ', React.createElement('span', {
      className: metrics.renderTime > 16 ? 'text-red-400' : 'text-green-400'
    }, `${metrics.renderTime.toFixed(1)}ms`)]),
    React.createElement('div', { key: 'bundle' }, `Bundle: ${metrics.bundleSize}KB`)
  ]));
};

declare global {
  const __DEV__: boolean;
}