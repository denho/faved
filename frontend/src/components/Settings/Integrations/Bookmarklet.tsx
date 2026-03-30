import React, { useRef, useState } from 'react';
import { ChevronRightIcon, Copy, Eye, EyeOff, Feather, GitCompare, Bookmark, Shield, Move } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useIsMobile } from '@/hooks/use-mobile.ts';
import { cn } from '@/lib/utils.ts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';
import { IconDeviceDesktop, IconDeviceMobile } from '@tabler/icons-react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { toast } from 'sonner';
import { InstallStep } from './InstallStep.tsx';

export const Bookmarklet = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [isCodeShown, setIsCodeShown] = React.useState(false);
  const bookmarkletRef = React.useRef<HTMLAnchorElement>(null);
  const codeTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const defaultOpenTab = isMobile ? 'manual' : 'drag';

  const bookmarkletFunction = () => {
    const urlParams = new URLSearchParams();
    urlParams.append('url', window.location.href);
    urlParams.append('title', document.title);
    const meta_description = document.querySelector('meta[name="description"]');
    if (meta_description) {
      urlParams.append('description', meta_description.getAttribute('content') || '');
    }

    const imageUrl =
      document.querySelector('meta[property="og:image"]')?.getAttribute('content') ??
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ??
      Array.from(document.querySelectorAll('img'))
        .find((img) => img.naturalWidth >= 200 && img.naturalHeight >= 200)
        ?.getAttribute('src');

    if (imageUrl) {
      const resolveUrl = (url) => {
        if (url.startsWith('http')) {
          return url;
        }

        // Handle protocol-relative URLs
        if (url.startsWith('//')) {
          return (window.location.protocol || 'https') + url;
        }

        // Handle absolute paths
        if (url.startsWith('/')) {
          return window.location.origin + url;
        }

        // Handle relative paths
        let path = window.location.pathname || '/';
        path = path.substring(0, path.lastIndexOf('/'));

        return window.location.origin + path + '/' + url;
      };

      urlParams.append('image', resolveUrl(imageUrl));
    }

    const windowWidth = 700;
    const windowHeight = 800;
    const leftPos = Math.floor((screen.width - windowWidth) / 2);
    const topPos = Math.floor((screen.height - windowHeight) / 2);
    const windowProps = {
      width: windowWidth,
      height: windowHeight,
      left: leftPos,
      top: topPos,
      noopener: 0,
      noreferrer: 0,
      popup: 1,
    };

    window.open(
      `<<BASE_PATH>>?${urlParams.toString()}`,
      '_blank',
      Object.entries(windowProps)
        .map(([key, value]) => key + '=' + value.toString())
        .join(',')
    );
  };

  const code = React.useMemo(() => {
    const basePath = window.location.origin + '/create-item';
    return `javascript:(${bookmarkletFunction.toString()})();`.replace('<<BASE_PATH>>', basePath);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);

      if (onSuccess) {
        onSuccess();
      }
      return () => clearTimeout(timeout);
    }
  }, [copied, onSuccess]);

  React.useEffect(() => {
    if (isCodeShown) {
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isCodeShown, onSuccess]);

  const copyBookmarkletCode = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
    } else {
      setIsCodeShown(true);
      toast.error('Failed to copy to clipboard. Please copy it manually.', {
        position: 'top-center',
      });
    }
  };

  React.useEffect(() => {
    const bookmarkletElement = bookmarkletRef.current;
    if (bookmarkletElement) {
      bookmarkletElement.setAttribute('href', code);
    }
  }, [code]);

  return (
    <Card className="gap-5">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="bg-muted mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Bookmark className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <CardTitle className="text-lg">Browser Bookmarklet</CardTitle>
          <CardDescription> Quickly save links from any browser.</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="min-w-0 space-y-4">
        <div className="flex flex-col items-center justify-end gap-2 sm:flex-row">
          <a
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'me-auto w-full cursor-move gap-2 border-2 border-dashed sm:w-auto'
            )}
            href="#"
            title="Drag to your bookmarks bar"
            ref={bookmarkletRef}
            draggable="true"
            onDragEnd={() => {
              if (onSuccess) {
                onSuccess();
              }
            }}
          >
            <Move className="h-4 w-4" />
            Add to Faved
          </a>

          <Button onClick={copyBookmarkletCode} variant="outline" className="w-full gap-2 sm:w-auto">
            <Copy className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy Code'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsCodeShown(!isCodeShown);
            }}
            className={cn('w-full gap-2 sm:w-auto', isCodeShown ? '' : '')}
          >
            {!isCodeShown ? (
              <>
                <Eye className="h-4 w-4" />
                Show Code
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" /> Hide Code
              </>
            )}
          </Button>
        </div>
        <div className="w-full min-w-0">
          <Textarea
            ref={codeTextAreaRef}
            value={code}
            readOnly
            className={cn('h-60 break-all', isCodeShown ? '' : 'hidden')}
            onClick={(e) => e.currentTarget.select()}
          />
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="drag" className="gap-2">
                    <IconDeviceDesktop className="h-4 w-4" />
                    <span className="font-medium">Desktop</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <IconDeviceMobile className="h-4 w-4" />
                    <span className="font-medium">Mobile</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="drag" className="space-y-2 pt-4">
                  {[
                    <>
                      Drag the <b>Add to Faved</b> button above to your browser's Bookmarks Bar to install.
                    </>,
                    <>
                      Alternatively, if drag-and-drop doesn't work or you prefer not to use the Bookmarks Bar in your
                      browser, follow the <b>Mobile</b> tab instructions to install manually.
                    </>,
                  ].map((text, index) => (
                    <InstallStep key={index} text={text} index={index} />
                  ))}
                  <p className="text-muted-foreground mt-4 space-y-2 border-t pt-4 text-xs leading-relaxed">
                    If your bookmarks bar is not visible, enable it in your browser settings (usually found under View →
                    Bookmarks Bar or Favourites Bar).
                  </p>
                </TabsContent>
                <TabsContent value="manual" className="space-y-2 pt-4">
                  {[
                    <>
                      Click the <b>Copy Code</b> button above. If the code isn't copied, click <b>Show Code</b> and copy
                      it manually.
                    </>,
                    'Add a new bookmark in your browser.',
                    'Paste the copied code in the URL field.',
                    'Specify a name for the bookmark, for example "Add to Faved".',
                    'Save the bookmark.',
                  ].map((text, index) => (
                    <InstallStep key={index} text={text} index={index} />
                  ))}
                </TabsContent>
              </Tabs>
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
              {[
                <>
                  Click the <b>Add to Faved</b> bookmarklet on any page you'd like to save.
                </>,
                'A window will appear, allowing you to add the page to your bookmarks.',
                <>
                  Optionally, add notes and tags, then click <b>Save</b>.
                </>,
                'The page will be stored and available in Faved.',
              ].map((text, index) => (
                <InstallStep key={index} text={text} index={index} />
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="data-[state=open]:border-border data-[state=open]:bg-muted/40 rounded-md border border-transparent">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full justify-start">
                <ChevronRightIcon className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                What is a bookmarklet?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 p-4">
              <div className="text-foreground space-y-3 text-sm leading-relaxed">
                <p>
                  A bookmarklet is a bookmark stored in a web browser that contains JavaScript commands. Unlike browser
                  extensions, they are lightweight and only access the page when you click them.
                </p>
                <p>
                  Faved bookmarklet allows you to quickly save any webpage to your Faved collection with a single click.
                </p>
              </div>
              <div className="flex flex-wrap justify-around gap-6 text-sm">
                <div className="flex flex-col items-center text-center">
                  <GitCompare className="text-primary mb-3 h-8 w-8" />
                  <h4 className="text-foreground mb-2 font-semibold">Compatible</h4>
                  <p className="text-muted-foreground max-w-[200px] leading-relaxed">
                    Works in all modern desktop and mobile browsers
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Shield className="text-primary mb-3 h-8 w-8" />
                  <h4 className="text-foreground mb-2 font-semibold">Secure</h4>
                  <p className="text-muted-foreground max-w-[200px] leading-relaxed">
                    No access to your page data until activated
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Feather className="text-primary mb-3 h-8 w-8" />
                  <h4 className="text-foreground mb-2 font-semibold">Lightweight</h4>
                  <p className="text-muted-foreground max-w-[200px] leading-relaxed">No browser extension is needed</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
