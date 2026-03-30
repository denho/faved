import { Button } from '@/components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';

import { SettingsImport } from '../components/Settings/SettingsImport.tsx';
import { Onboarding } from '@/layouts/Onboarding.tsx';

export const SetupImport = () => {
  const navigate = useNavigate();

  return (
    <Onboarding currentStepIndex={2}>
      <SettingsImport onSuccess={() => navigate('/')} />

      <Button variant="link" className="" onClick={() => navigate('/')}>
        Skip for now
      </Button>
    </Onboarding>
  );
};
