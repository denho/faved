import { useCallback, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';

const messages = [
  {
    id: 'onboarding',
    text: 'Onboarding was skipped for the demo',
    action: (
      <Link
        to="/setup/auth"
        className="bg-primary-foreground text-primary rounded px-3 py-1 text-sm font-medium text-nowrap transition-opacity hover:opacity-90"
      >
        Test it out
      </Link>
    ),
  },
  {
    id: 'cloud',
    text: 'Start organizing your links instantly',
    action: (
      <a
        href="https://faved.cloud/signup?cta=demo-banner"
        rel="noopener noreferrer"
        className="bg-primary-foreground text-primary rounded px-3 py-1 text-sm font-medium text-nowrap transition-opacity hover:opacity-90"
      >
        Sign up
      </a>
    ),
  },
];

export const BannerRotator = observer(() => {
  const store = useContext(StoreContext);
  const [isVisible, setIsVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const visibleMessages = messages.filter((m) => !(m.id === 'onboarding' && store.hideOnboardingBanner));

  const advance = useCallback(
    (dir: 'left' | 'right') => {
      if (animating) {
        return;
      }
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setIndex((prev) => {
          const len = visibleMessages.length;
          return dir === 'left' ? (prev + 1) % len : (prev - 1 + len) % len;
        });
        setAnimating(false);
      }, 300);
    },
    [animating, visibleMessages]
  );

  useEffect(() => {
    if (visibleMessages.length < 2) return;
    const interval = setInterval(() => advance('left'), 20000);
    return () => clearInterval(interval);
  }, [visibleMessages.length, advance]);

  if (!isVisible || visibleMessages.length === 0) return null;

  const safeIndex = index % visibleMessages.length;
  const current = visibleMessages[safeIndex];

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 sm:right-auto sm:left-1/2 sm:w-max sm:-translate-x-1/2">
      <div className="bg-primary text-primary-foreground justify flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg px-4 py-3 shadow-lg sm:w-auto">
        <button
          onClick={() => setIsVisible(false)}
          className="text-primary-foreground transition-opacity hover:opacity-70"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>

        <div
          className="flex items-center gap-3 transition-all duration-300"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? `translateX(${direction === 'left' ? '-12px' : '12px'})` : 'translateX(0)',
          }}
        >
          <span className="text-sm font-medium">{current.text}</span>
          {current.action}
        </div>

        <div className="flex items-center gap-1">
          {visibleMessages.length > 1 && (
            <div className="flex items-center gap-1" role="tablist" aria-label="Banner messages">
              {visibleMessages.map((m, i) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={i === safeIndex}
                  onClick={() => advance(i > safeIndex ? 'left' : 'right')}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === safeIndex
                      ? 'bg-primary-foreground w-4 opacity-100'
                      : 'bg-primary-foreground w-1.5 opacity-40 hover:opacity-70'
                  }`}
                  aria-label={`Go to message ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
