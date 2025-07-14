import React, { 
  Suspense, 
  useEffect, 
  useRef, 
  useState
} from 'react';
import type { ComponentType } from 'react';
import { useLazyComponent } from '../../hooks/useLazyComponent';

interface LazyAnimationWrapperProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  animationFactory: () => Promise<{ default: ComponentType<any> }>;
  componentProps?: Record<string, any>;
}

const DefaultLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const LazyAnimationWrapper: React.FC<LazyAnimationWrapperProps> = ({
  children,
  fallback = <DefaultLoadingSpinner />,
  threshold = 0.1,
  rootMargin = '50px',
  animationFactory,
  componentProps = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const LazyAnimationComponent = useLazyComponent(animationFactory, {
    preload: false,
    retries: 3
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log('Intersection observed:', entry.isIntersecting, 'shouldLoad:', shouldLoad);
        if (entry.isIntersecting && !shouldLoad) {
          console.log('Loading component...');
          setShouldLoad(true);
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      console.log('Observer attached to element');
    }

    return () => {
      console.log('Observer disconnected');
      observer.disconnect();
    };
  }, [shouldLoad, threshold, rootMargin]);

  return (
    <div 
      ref={containerRef}
      className={`transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {shouldLoad ? (
        <Suspense fallback={fallback}>
          <LazyAnimationComponent {...componentProps} />
          {children}
        </Suspense>
      ) : (
        <div className="min-h-[400px] flex items-center justify-center">
          {fallback}
        </div>
      )}
    </div>
  );
};

export default LazyAnimationWrapper;