import * as React from 'react';
import { detectInstallEnvironment, isStandaloneMode, type InstallEnvironment } from '@/lib/install-env';

export function useInstallExperience() {
  const [environment, setEnvironment] = React.useState<InstallEnvironment>(() => detectInstallEnvironment());
  const [isStandalone, setIsStandalone] = React.useState(isStandaloneMode());

  React.useEffect(() => {
    const syncEnvironment = () => {
      setEnvironment(detectInstallEnvironment());
      setIsStandalone(isStandaloneMode());
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncEnvironment();
      }
    };

    window.addEventListener('appinstalled', syncEnvironment);
    window.addEventListener('focus', syncEnvironment);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('appinstalled', syncEnvironment);
      window.removeEventListener('focus', syncEnvironment);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return {
    environment,
    isStandalone,
  };
}
