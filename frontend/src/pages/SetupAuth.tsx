import { Button } from '@/components/ui/button.tsx';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { Navigate, useNavigate } from 'react-router-dom';

import { UserCreate } from '@/components/Settings/Auth/UserCreate.tsx';
import { Onboarding } from '@/layouts/Onboarding.tsx';

export const SetupAuth = observer(() => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const nextStep = '/setup/integrations';

  if (store.user) {
    return <Navigate to={nextStep} replace={true} />;
  }

  return (
    <Onboarding currentStepIndex={0}>
      <UserCreate onSuccess={() => navigate(nextStep)} />

      <Button variant="link" onClick={() => navigate(nextStep)}>
        Skip for now
      </Button>
    </Onboarding>
  );
});
