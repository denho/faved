import { Logo } from '@/components/Logo.tsx';
import { BookOpen, Bug, ExternalLink, FileText, Lightbulb, Mail, Newspaper, Server } from 'lucide-react';
import { IconBrandGithub, IconBrandX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as React from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { buildGoLinkURL } from '@/lib/utils.ts';

const buildLink = (path: string) => {
  return buildGoLinkURL(path, {
    utm_campaign: 'about_page_link',
  });
};

const links = [
    {
      icon: Server,
      label: 'Faved Cloud',
      url: buildLink('cloud'),
      description: 'Secure managed hosting for Faved with automated backups and updates',
    },
    {
      icon: Newspaper,
      label: 'Blog',
      url: buildLink('blog'),
      description: 'Latest news, announcements and tutorials',
    },
    {
      icon: BookOpen,
      label: 'Documentation',
      url: buildLink('docs'),
      description: 'Learn how to use Faved',
    },
    {
      icon: FileText,
      label: 'Changelog',
      url: buildLink('changelog'),
      description: 'Stay updated with the latest changes',
    },
  ],
  socialLinks = [
    { icon: IconBrandGithub, label: 'Star on GitHub', url: 'https://github.com/denho/faved' },
    { icon: IconBrandX, label: 'Follow on X (Twitter)', url: 'https://x.com/FavedTool' },
  ],
  supportLinks = [
    { icon: Lightbulb, label: 'Open a feature request', url: buildLink('open-feature-request') },
    { icon: Bug, label: 'Report a bug', url: buildLink('open-bug-report') },
    { icon: Mail, label: 'Contact us', url: 'mailto:contact@faved.dev' },
  ];

export const SettingsAbout = observer(() => {
  const store = React.useContext(StoreContext);
  const installedVersion = store.appInfo?.installed_version ?? null;
  const latestVersion = store.appInfo?.latest_version ?? null;
  const updateAvailable = store.appInfo?.update_available ?? null;

  const releaseNotesURL = buildLink('changelog');
  const updateDocsUrl = buildLink('docs-update');

  useEffect(() => {
    store.getAppInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center justify-center gap-4 py-5">
        <Logo />

        <div className="flex flex-col items-center justify-center gap-2 text-sm">
          <div className="flex flex-row gap-2 text-base font-medium">Version {installedVersion || '<unknown>'}</div>

          {(() => {
            if (updateAvailable === true) {
              return <span className="text-yellow-700 dark:text-yellow-400">Latest version: {latestVersion}</span>;
            } else if (updateAvailable === false) {
              return <span className="text-green-700 dark:text-green-400">Faved is up to date!</span>;
            } else if (latestVersion === null) {
              return <span className="text-muted-foreground">Unable to check for updates</span>;
            } else if (installedVersion === null) {
              return <span>Latest version: {latestVersion}</span>;
            }
          })()}

          {updateAvailable === true ? (
            <div className="flex flex-row gap-2">
              <a href={releaseNotesURL} target="_blank" rel="noopener noreferrer" className="underline">
                See what's new
              </a>
              |
              <a href={updateDocsUrl} target="_blank" rel="noopener noreferrer" className="underline">
                Learn how to update
              </a>
            </div>
          ) : (
            <a href={releaseNotesURL} target="_blank" rel="noopener noreferrer" className="underline">
              See release notes
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Resources & Links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Button key={link.label} variant="ghost" className="h-auto w-full justify-start py-2 sm:py-3" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-start">
                    <Icon className="mt-1.5 mr-2 h-4 w-4 flex-shrink-0 sm:mr-3" />
                    <div className="flex-1 space-y-1 text-left text-wrap">
                      <div className="text-sm font-medium">{link.label}</div>
                      <div className="text-muted-foreground text-xs">{link.description}</div>
                    </div>
                    <ExternalLink className="mt-1.5 ml-2 h-3 w-3 flex-shrink-0 opacity-50" />
                  </a>
                </Button>
              );
            })}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Get Help & Contribute</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.label}
                    variant="outline"
                    className="flex w-full items-center justify-start gap-3 py-5 text-sm"
                    asChild
                  >
                    <a
                      href={link.url}
                      target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                      rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </a>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Stay Connected on Social Media</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.label}
                    variant="outline"
                    className="flex items-center justify-center gap-2 text-sm"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </a>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});
