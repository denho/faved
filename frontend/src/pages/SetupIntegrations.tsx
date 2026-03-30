import { Button } from '@/components/ui/button.tsx';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Onboarding } from '@/layouts/Onboarding.tsx';
import { SettingsIntegrations } from '@/components/Settings/SettingsIntegrations.tsx';

export const SetupIntegrations = () => {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);

  const handleSuccess = useCallback(() => {
    setIsInstalled(true);
  }, []);

  return (
    <Onboarding currentStepIndex={1}>
      <SettingsIntegrations onSuccess={handleSuccess} source="setup" />

      <>
        {isInstalled ? (
          <Button className="w-full" onClick={() => navigate('/setup/import')}>
            Next: Import Bookmarks
          </Button>
        ) : (
          <Button variant="link" onClick={() => navigate('/setup/import')}>
            Skip for now
          </Button>
        )}
      </>
    </Onboarding>
  );
};
