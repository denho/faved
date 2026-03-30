import * as React from 'react';
import { InstallStep } from '@/components/Settings/Integrations/InstallStep.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandChrome,
  IconBrandEdge,
  IconBrandFirefox,
  IconBrandOpera,
  IconBrandSafari,
} from '@tabler/icons-react';
import { CheckIcon, ChevronRightIcon, ArrowDownToLine } from 'lucide-react';
import { useInstallExperience } from '@/hooks/use-install-experience';
import { type InstallEnvironment } from '@/lib/install-env';

type InstallOptionId =
  | 'ios'
  | 'android'
  | 'safari_macos'
  | 'chrome_desktop'
  | 'edge_desktop'
  | 'opera_desktop'
  | 'firefox_desktop';

type InstallOption = {
  id: InstallOptionId;
  label: string;
  icon: React.ElementType;
  steps: React.ReactNode[];
  footnote?: React.ReactNode;
};

const INSTALL_OPTIONS: InstallOption[] = [
  {
    id: 'ios',
    label: 'iPhone / iPad',
    icon: IconBrandApple,
    steps: [
      <>
        Open the <span className="font-semibold">Share</span> menu (tap the button with an arrow pointing up).
      </>,
      <>
        Choose <span className="font-semibold">Add to Home Screen</span> from the list of options.
      </>,
      <>
        Confirm the name and tap <span className="font-semibold">Add</span> in the top right corner.
      </>,
    ],
    footnote:
      'On iPhone/iPad (iOS/iPadOS 16.4+), you can install from Safari, Chrome, Firefox, or Edge. On older versions (16.3 and earlier), you must use Safari.',
  },
  {
    id: 'android',
    label: 'Android',
    icon: IconBrandAndroid,
    steps: [
      <>
        In <span className="font-semibold">Chrome</span>, <span className="font-semibold">Edge</span>,{' '}
        <span className="font-semibold">Opera</span>, or <span className="font-semibold">Samsung Internet</span>: Open
        the menu and tap <span className="font-semibold">Install app</span> or{' '}
        <span className="font-semibold">Add to Home screen</span>.
      </>,
      <>
        In <span className="font-semibold">Firefox</span>: Tap the <span className="font-semibold">...</span> menu and
        select <span className="font-semibold">Install</span>.
      </>,
      'Confirm the installation in the browser dialog.',
      <>
        Launch <span className="font-semibold">Faved</span> from your home screen or app drawer.
      </>,
    ],
    footnote:
      'All major Android browsers support installation, though the menu label might vary (Install, Add to Home screen, etc.).',
  },
  {
    id: 'safari_macos',
    label: 'Safari on Mac',
    icon: IconBrandSafari,
    steps: [
      <>
        Open the <span className="font-semibold">File</span> menu in Safari.
      </>,
      <>
        Choose <span className="font-semibold">Add to Dock...</span>
      </>,
      'Confirm the app name and icon in the dialog.',
      <>
        Launch <span className="font-semibold">Faved</span> from your Dock or Applications folder.
      </>,
    ],
    footnote: 'This feature requires macOS Sonoma (Safari 17) or later.',
  },
  {
    id: 'chrome_desktop',
    label: 'Chrome (Desktop)',
    icon: IconBrandChrome,
    steps: [
      <>
        Click the <span className="font-semibold">Install</span> icon in the right side of the address bar.
      </>,
      <>
        Alternatively, open the <span className="font-semibold">Chrome menu</span> (three dots) &rarr;{' '}
        <span className="font-semibold">Cast, save and share</span> &rarr;{' '}
        <span className="font-semibold">Install Faved...</span> or{' '}
        <span className="font-semibold">Install page as app...</span>
      </>,
      'Confirm the installation in the dialog.',
      <>
        Launch <span className="font-semibold">Faved</span> from your taskbar, Dock, start menu, or app launcher.
      </>,
    ],
  },
  {
    id: 'edge_desktop',
    label: 'Edge (Desktop)',
    icon: IconBrandEdge,
    steps: [
      <>
        Click the <span className="font-semibold">App available</span> icon in the address bar.
      </>,
      <>
        Alternatively, open the <span className="font-semibold">Edge menu</span> &rarr;{' '}
        <span className="font-semibold">Apps</span> &rarr;{' '}
        <span className="font-semibold">Install this site as an app</span>.
      </>,
      'Confirm the installation in the dialog.',
      <>
        Launch <span className="font-semibold">Faved</span> from your taskbar, Dock, start menu, or app launcher.
      </>,
    ],
  },
  {
    id: 'opera_desktop',
    label: 'Opera (Desktop)',
    icon: IconBrandOpera,
    steps: [
      <>
        Open the <span className="font-semibold">Opera menu</span> and look for{' '}
        <span className="font-semibold">Apps</span> &rarr; <span className="font-semibold">Install app</span>.
      </>,
      <>
        Alternatively, look for the <span className="font-semibold">Install</span> icon in the address bar.
      </>,
      'Confirm the installation in the dialog.',
      <>
        Launch <span className="font-semibold">Faved</span> from your taskbar, Dock, start menu, or app launcher.
      </>,
    ],
  },
  {
    id: 'firefox_desktop',
    label: 'Firefox (Desktop)',
    icon: IconBrandFirefox,
    steps: [
      "Firefox desktop doesn't support PWA installation, but you can still enjoy a seamless experience by using Faved as a regular website.",
      'For quick access, add a shortcut to Faved on your New Tab page or save it as a bookmark on your Bookmarks Bar.',
    ],
  },
];

function defaultTabForEnvironment(environment: InstallEnvironment): InstallOptionId {
  if (environment.platform === 'ios') {
    return 'ios';
  }

  if (environment.platform === 'android') {
    return 'android';
  }

  if (environment.browser === 'firefox') {
    return 'firefox_desktop';
  }

  if (environment.browser === 'safari' && environment.platform === 'macos') {
    return 'safari_macos';
  }

  if (environment.browser === 'edge') {
    return 'edge_desktop';
  }

  if (environment.browser === 'opera') {
    return 'opera_desktop';
  }

  return 'chrome_desktop';
}

function launchLocationLabel(environment: InstallEnvironment) {
  if (environment.platform === 'ios' || environment.platform === 'android') {
    return 'your home screen';
  }

  if (environment.platform === 'macos') {
    return 'your Dock or Applications folder';
  }

  return 'your taskbar, start menu, or app launcher';
}

export function InstallApp() {
  const { environment, isStandalone } = useInstallExperience();
  const isInstalled = isStandalone;
  const isInstallationAvailable = React.useMemo(() => {
    return !(environment.browser === 'firefox' && environment.platform !== 'ios' && environment.platform !== 'android');
  }, [environment]);

  const defaultTab = React.useMemo(() => defaultTabForEnvironment(environment), [environment]);

  const [activeTab, setActiveTab] = React.useState<InstallOptionId>(defaultTab);

  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const activeOption = React.useMemo(() => INSTALL_OPTIONS.find((o) => o.id === activeTab), [activeTab]);
  const isSuccess = isInstalled || isInstallationAvailable;

  return (
    <Card className="gap-5">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="bg-muted mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <ArrowDownToLine className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <CardTitle className="text-lg">Install App</CardTitle>
          <CardDescription>
            Besides being accessible via browser, Faved can also be installed as a Progressive Web App (PWA). Choose
            your device in <span className="font-semibold">How to install?</span> section below to see installation
            instructions.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isSuccess ? 'bg-green-600/10 text-green-600' : 'bg-amber-600/10 text-amber-600'}`}
            >
              {isInstalled ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <div className={`h-1.5 w-1.5 rounded-full ${isSuccess ? 'bg-green-600' : 'bg-amber-600'}`} />
              )}
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">
                {isInstalled
                  ? 'Already installed'
                  : !isInstallationAvailable
                    ? 'Installation limited'
                    : 'Installation available'}
              </p>
              <p className="text-muted-foreground text-xs">
                Detected: {environment.browserLabel} on {environment.platformLabel}
              </p>
            </div>
          </div>

          {isInstalled && (
            <div className="border-t pt-2">
              <p className="text-muted-foreground text-xs italic">Launch from {launchLocationLabel(environment)}</p>
            </div>
          )}

          {!isInstallationAvailable && !isInstalled && (
            <div className="border-t pt-2">
              <p className="text-muted-foreground text-xs italic">
                PWA installation is not supported by your browser on this platform.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Collapsible className="data-[state=open]:border-border data-[state=open]:bg-muted/40 rounded-md border border-transparent">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full justify-start">
                <ChevronRightIcon className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                How to install?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 p-4">
              <div className="space-y-6">
                <Select value={activeTab} onValueChange={(value) => setActiveTab(value as InstallOptionId)}>
                  <SelectTrigger className="bg-background w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTALL_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4 shrink-0" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeOption && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {activeOption.steps.map((step, index) => (
                        <div key={`${activeOption.id}-${index}`}>
                          <InstallStep index={index} text={step} />
                        </div>
                      ))}
                    </div>

                    {activeOption.footnote ? (
                      <p className="text-muted-foreground mt-4 space-y-2 border-t pt-4 text-xs leading-relaxed">
                        {activeOption.footnote}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="data-[state=open]:border-border data-[state=open]:bg-muted/40 rounded-md border border-transparent">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full justify-start">
                <ChevronRightIcon className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                Is installation available on my device?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 p-4">
              <div className="text-foreground space-y-3 text-sm leading-relaxed">
                <div className="space-y-2">
                  <h4 className="text-foreground mb-4 font-semibold">Desktop Support</h4>
                  <ul className="text-foreground list-disc space-y-1 pl-4">
                    <li>
                      <span>Chromium Browsers</span> (<span className="font-semibold">Chrome</span>,{' '}
                      <span className="font-semibold">Edge</span>, <span className="font-semibold">Opera</span>) are
                      supported on Windows, Mac, and Linux.
                    </li>
                    <li>
                      <span className="font-semibold">Safari</span> supports installation (Add to Dock) on Mac (macOS
                      Sonoma 17) and later.
                    </li>
                    <li>
                      <span className="font-semibold">Firefox</span> on desktop currently does not support PWA
                      installation.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-4">
                  <h4 className="text-foreground mb-4 font-semibold">Mobile Support</h4>
                  <ul className="text-foreground list-disc space-y-1 pl-4">
                    <li>
                      <span className="font-semibold">Android:</span> <span className="font-semibold">Chrome</span>,{' '}
                      <span className="font-semibold">Firefox</span>, <span className="font-semibold">Edge</span>,{' '}
                      <span className="font-semibold">Opera</span>, and{' '}
                      <span className="font-semibold">Samsung Internet</span> all support installation.
                    </li>
                    <li>
                      <span className="font-semibold">iOS/iPadOS (16.4 and later):</span> Support for installation via
                      the Share menu is available in <span className="font-semibold">Safari</span>,{' '}
                      <span className="font-semibold">Chrome</span>, <span className="font-semibold">Edge</span>, and{' '}
                      <span className="font-semibold">Firefox</span>.
                    </li>
                    <li>
                      <span className="font-semibold">iOS/iPadOS (16.3 and earlier):</span> Only{' '}
                      <span className="font-semibold">Safari</span> supports installation.
                    </li>
                  </ul>
                </div>

                <p className="text-muted-foreground mt-4 space-y-2 border-t pt-4 text-xs leading-relaxed">
                  If installation is not supported, you can still enjoy a great experience by accessing Faved as a
                  regular website and adding it as a bookmark for quick access.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="data-[state=open]:border-border data-[state=open]:bg-muted/40 rounded-md border border-transparent">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full justify-start">
                <ChevronRightIcon className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                What is a Progressive Web App (PWA)?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 p-4">
              <div className="text-foreground space-y-3 text-sm leading-relaxed">
                <p>
                  A Progressive Web App (PWA) is a website that can be installed on your device, providing a native-like
                  experience with its own icon on the home screen or dock.
                </p>
                <p>
                  By installing Faved, you can launch it quickly without browser toolbars, enjoy more screen space, and
                  switch between apps more easily. It uses very little storage and always stays up to date.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
