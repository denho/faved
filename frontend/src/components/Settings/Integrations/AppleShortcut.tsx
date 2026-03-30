import * as React from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { buildGoLinkURL } from '@/lib/utils.ts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import { observer } from 'mobx-react-lite';
import { InstallStep } from './InstallStep.tsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet } from '@tabler/icons-react';
import { ChevronRightIcon, Layers2, ArrowDownToLine } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile.ts';

export const AppleShortcut = observer(({ onSuccess, source }: { onSuccess?: () => void; source: string }) => {
  const store = React.useContext(StoreContext);
  const isMobile = useIsMobile();
  const defaultOpenTab = isMobile ? 'ios' : 'macos';

  const buildLink = (path: string) => {
    return buildGoLinkURL(path, {
      app_version: store?.appInfo?.installed_version ?? 'unknown',
      utm_campaign: `${source}_integrations_page_link`,
    });
  };

  return (
    <Card className="gap-5">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="bg-muted mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Layers2 className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <CardTitle className="text-lg">Apple Shortcut (Mac / iPhone / iPad)</CardTitle>
          <CardDescription>
            Save links directly from the iPhone, iPad and Mac share sheet and Mac services menu.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-start gap-4">
          <a
            href={buildLink('shortcut-apple-os')}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'default', className: 'w-full sm:w-auto' })}
            onClick={onSuccess}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Install Shortcut
          </a>
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
              <Tabs defaultValue={defaultOpenTab} className="w-full">
                <TabsList className="flex w-full">
                  <TabsTrigger value="macos" className="flex-2/5 gap-2 md:flex-1">
                    <IconDeviceDesktop className="h-4 w-4" />
                    <span className="font-medium">Mac</span>
                  </TabsTrigger>
                  <TabsTrigger value="ios" className="flex-3/5 gap-2 md:flex-1">
                    <IconDeviceMobile className="h-4 w-4 shrink-0" /> iPhone /
                    <IconDeviceTablet className="h-4 w-4 shrink-0" /> iPad
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="macos" className="space-y-6 pt-4">
                  <div className="space-y-2">
                    {[
                      <>
                        Click <span className="font-semibold">Install Shortcut</span> button above and then{' '}
                        <span className="font-semibold">Get Shortcut</span> on the Apple website.
                      </>,
                      <>
                        Click <span className="font-semibold">Add Shortcut...</span> in the Apple Shortcuts app.
                      </>,
                      <>
                        Provide your Faved URL (
                        <input
                          type="text"
                          readOnly
                          value={window.location.origin}
                          size={window.location.origin.length}
                          className="bg-background inline-block field-sizing-content cursor-text rounded border px-2 py-0.5 font-mono text-sm select-all"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        ) when prompted.
                      </>,
                      <>
                        The <span className="font-semibold">Add to Faved</span> action will now appear in your Share
                        Sheet and Services menu.
                      </>,
                    ].map((text, index) => (
                      <InstallStep key={index} text={text} index={index} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="ios" className="space-y-2 pt-4">
                  <div className="space-y-2">
                    {[
                      <>
                        Click <span className="font-semibold">Install Shortcut</span> button above.
                      </>,
                      <>
                        Click <span className="font-semibold">Set Up Shortcut</span> in the Apple Shortcuts app.
                      </>,
                      <>
                        Provide your Faved URL (
                        <input
                          type="text"
                          readOnly
                          value={window.location.origin}
                          size={window.location.origin.length}
                          className="bg-background inline-block field-sizing-content cursor-text rounded border px-2 py-0.5 font-mono text-sm select-all"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        ) when prompted.
                      </>,
                      <>
                        The <span className="font-semibold">Add to Faved</span> action will now appear in your Share
                        Sheet.
                      </>,
                    ].map((text, index) => (
                      <InstallStep key={index} text={text} index={index} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <p className="text-muted-foreground mt-4 space-y-2 border-t pt-4 text-xs leading-relaxed">
                <b>Tip:</b> Ensure iCloud sync is enabled for the Shortcuts app to have it available on all your Apple
                devices.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="data-[state=open]:border-border data-[state=open]:bg-muted/40 rounded-md border border-transparent">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full justify-start">
                <ChevronRightIcon className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                How to use?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 p-4">
              <Tabs defaultValue={defaultOpenTab} className="w-full">
                <TabsList className="flex w-full">
                  <TabsTrigger value="macos" className="flex-2/5 gap-2 md:flex-1">
                    <IconDeviceDesktop className="h-4 w-4" />
                    <span className="font-medium">Mac</span>
                  </TabsTrigger>
                  <TabsTrigger value="ios" className="flex-3/5 gap-2 md:flex-1">
                    <IconDeviceMobile className="h-4 w-4 shrink-0" /> iPhone /
                    <IconDeviceTablet className="h-4 w-4 shrink-0" /> iPad
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="macos" className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <h4 className="mb-4 text-sm font-semibold">Using the Services menu</h4>
                    {[
                      'Highlight any visible URL in an app, or right-click a selected link in your browser.',
                      <>
                        Open the <span className="font-semibold">Services</span> menu.
                      </>,
                      <>
                        Select <span className="text-foreground font-medium">Add to Faved</span> to send the selected
                        link to Faved.
                      </>,
                      <>
                        Optionally, add notes and tags, then click <span className="font-semibold">Save</span>.
                      </>,
                      'The selected link will be stored and available in Faved.',
                    ].map((text, index) => (
                      <InstallStep key={index} text={text} index={index} />
                    ))}
                  </div>

                  <div className="space-y-2 pt-4">
                    <h4 className="mb-4 text-sm font-semibold">Using the Share menu</h4>
                    {[
                      <>Open the webpage you want to save in Safari or another browser on your Mac.</>,
                      <>
                        Open the app's <span className="font-semibold">File</span> →{' '}
                        <span className="font-semibold">Share</span> menu, or use the browser's Share button if it is
                        available.
                      </>,
                      <>
                        Select <span className="font-semibold">Shortcuts</span> first, then choose{' '}
                        <span className="text-foreground font-medium">Add to Faved</span>.
                      </>,
                      <>Optionally, add notes and tags, then click Save.</>,
                      <>The webpage will be stored and available in Faved.</>,
                    ].map((text, index) => (
                      <InstallStep key={index} text={text} index={index} />
                    ))}
                    <p className="text-muted-foreground mt-4 space-y-2 border-t pt-4 text-xs leading-relaxed">
                      If the shortcut doesn't appear in the Share menu, check System Settings → Privacy & Security →
                      Extensions → Sharing and ensure Shortcuts is enabled.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="ios" className="space-y-2 pt-4">
                  {[
                    'Open the webpage you want to save in Safari or another browser on your iPhone or iPad.',
                    <>
                      Tap the browser's <span className="font-semibold">Share</span> button.
                    </>,
                    <>
                      Select <span className="font-semibold">Add to Faved</span> to send the current page or link to
                      Faved.
                    </>,
                    <>
                      Optionally, add notes and tags, then click <span className="font-semibold">Save</span>.
                    </>,
                    'The webpage will be stored and available in Faved.',
                  ].map((text, index) => (
                    <InstallStep key={index} text={text} index={index} />
                  ))}
                </TabsContent>
              </Tabs>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
});
