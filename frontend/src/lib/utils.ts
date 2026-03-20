import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemType, LayoutType } from '@/lib/types.ts';
import { VisibilityState } from '@tanstack/react-table';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const colorMap = {
  gray: 'bg-gray-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
  aqua: 'bg-blue-600',
  'white ': 'bg-neutral-300',
  black: 'bg-neutral-950',
};

export const getColorClass = (color: string | undefined) => {
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
};

export const normalizeQuery = (val) => {
  return val
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')
    .trim();
};

export const getSavedLayoutPreference = (): LayoutType => {
  return (localStorage.getItem('layout') as LayoutType) || 'list';
};

export const saveLayoutPreference = (value: LayoutType): void => {
  try {
    localStorage.setItem('layout', value);
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};

export const getSavedLayoutColumnVisibilityPreference = (
  layout: LayoutType
): Partial<Record<keyof ItemType, boolean>> => {
  const defaultPref = {
    updated_at: false,
  };
  try {
    const stored = localStorage.getItem(`column-visibility-${layout}`);
    return stored ? JSON.parse(stored) : defaultPref;
  } catch {
    return defaultPref;
  }
};

export const saveLayoutColumnVisibilityPreference = (layout: LayoutType, columnVisibility: VisibilityState): void => {
  try {
    localStorage.setItem(`column-visibility-${layout}`, JSON.stringify(columnVisibility));
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};

export const getCookie = (name: string) => {
  // Add a semicolon to the beginning of the cookie string to handle the first cookie
  const cookieString = '; ' + document.cookie;

  // Split the string at the specified cookie name
  const parts = cookieString.split('; ' + name + '=');

  // If the cookie was found (the array has more than one part)
  if (parts.length === 2) {
    // Return the value, which is everything after the '=' and before the next ';'
    return parts.pop().split(';').shift();
  }
  // If the cookie was not found
  return null;
};

export const safeDecodeURIComponent = (encodedURI: string): string => {
  try {
    return encodedURI ? decodeURIComponent(encodedURI) : '';
  } catch {
    return encodedURI || '';
  }
};

export const safeDecodeURI = (encodedURI: string): string => {
  try {
    return encodedURI ? decodeURI(encodedURI) : '';
  } catch {
    return encodedURI || '';
  }
};
