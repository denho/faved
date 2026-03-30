import { observer } from 'mobx-react-lite';
import { InstallApp } from '@/components/Settings/Integrations/InstallApp.tsx';
import { AppleShortcut } from '@/components/Settings/Integrations/AppleShortcut.tsx';
import { Bookmarklet } from '@/components/Settings/Integrations/Bookmarklet.tsx';
import { BrowserExtension } from '@/components/Settings/Integrations/BrowserExtension.tsx';
export const SettingsIntegrations = observer(({ onSuccess, source }: { onSuccess?: () => void; source: string }) => {
  return (
    <div className="mx-auto w-full space-y-4">
      <InstallApp />
      <Bookmarklet onSuccess={onSuccess} />
      <AppleShortcut onSuccess={onSuccess} source={source} />
      <BrowserExtension />
    </div>
  );
});
