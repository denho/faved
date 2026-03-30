export type BrowserFamily = 'chrome' | 'edge' | 'firefox' | 'opera' | 'safari' | 'samsung' | 'other';
export type PlatformFamily = 'android' | 'ios' | 'linux' | 'macos' | 'other' | 'windows';

export type InstallEnvironment = {
  browser: BrowserFamily;
  browserLabel: string;
  platform: PlatformFamily;
  platformLabel: string;
};

export const BROWSER_LABELS: Record<BrowserFamily, string> = {
  chrome: 'Chrome',
  edge: 'Edge',
  firefox: 'Firefox',
  opera: 'Opera',
  safari: 'Safari',
  samsung: 'Samsung Internet',
  other: 'Browser',
};

export const PLATFORM_LABELS: Record<PlatformFamily, string> = {
  android: 'Android',
  ios: 'iPhone or iPad',
  linux: 'Linux desktop',
  macos: 'Mac',
  other: 'This device',
  windows: 'Windows PC',
};

const BROWSER_RULES: { family: BrowserFamily; re: RegExp }[] = [
  { family: 'edge', re: /edg\// },
  { family: 'opera', re: /opr\/|opera/ },
  { family: 'samsung', re: /samsungbrowser/ },
  { family: 'firefox', re: /firefox|fxios/ },
  { family: 'chrome', re: /chrome|crios|chromium/ },
  { family: 'safari', re: /safari/ },
];

const PLATFORM_RULES: { family: PlatformFamily; test: (ua: string, touchMac: boolean) => boolean }[] = [
  { family: 'ios', test: (ua, touchMac) => /iphone|ipad|ipod/.test(ua) || touchMac },
  { family: 'android', test: (ua) => /android/.test(ua) },
  { family: 'macos', test: (ua) => /macintosh|mac os x/.test(ua) },
  { family: 'windows', test: (ua) => /windows/.test(ua) },
  { family: 'linux', test: (ua) => /linux/.test(ua) },
];

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const displayModes = ['standalone', 'minimal-ui', 'fullscreen'];

  return displayModes.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches) || navigatorStandalone;
}

export function detectInstallEnvironment(): InstallEnvironment {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'other',
      browserLabel: BROWSER_LABELS.other,
      platform: 'other',
      platformLabel: PLATFORM_LABELS.other,
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const touchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  const platform = PLATFORM_RULES.find((rule) => rule.test(ua, touchMac))?.family ?? 'other';
  const browser = BROWSER_RULES.find((rule) => rule.re.test(ua))?.family ?? 'other';

  return {
    browser,
    browserLabel: BROWSER_LABELS[browser],
    platform,
    platformLabel: PLATFORM_LABELS[platform],
  };
}
