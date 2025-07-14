import { lazy } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';

interface LazyLoadOptions {
  preload?: boolean;
  retries?: number;
  delay?: number;
}

const lazyComponentCache = new Map<string, LazyExoticComponent<any>>();

export function useLazyComponent<T extends ComponentType<any>>(
  componentFactory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { preload = false, retries = 3, delay = 1000 } = options;
  
  const cacheKey = componentFactory.toString();
  
  if (lazyComponentCache.has(cacheKey)) {
    return lazyComponentCache.get(cacheKey)!;
  }

  const retryableFactory = async (): Promise<{ default: T }> => {
    let lastError: Error | undefined;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const module = await componentFactory();
        return module;
      } catch (error) {
        lastError = error as Error;
        
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  };

  const LazyComponent = lazy(retryableFactory);
  
  if (preload) {
    // Preload the component in the background
    componentFactory().catch(() => {
      // Silently fail preloading
    });
  }
  
  lazyComponentCache.set(cacheKey, LazyComponent);
  return LazyComponent;
}

export function preloadComponent(
  componentFactory: () => Promise<{ default: ComponentType<any> }>
): Promise<void> {
  return componentFactory().then(() => {}).catch(() => {});
}