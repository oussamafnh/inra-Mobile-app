import React, { useEffect } from 'react';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { Slot, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import PWAInstallPrompt from './utils/PWAInstallPrompt';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        input:focus, textarea:focus, select:focus {
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = '/manifest.json';
      document.head.appendChild(manifest);

      const theme = document.createElement('meta');
      theme.name = 'theme-color';
      theme.content = '#007AFF';
      document.head.appendChild(theme);

      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = '/icons/icon-192.png';
      document.head.appendChild(appleIcon);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(() => console.log('Service Worker registered'))
          .catch((err) => console.error('Service Worker registration failed:', err));
      }
    }

    router.push('/');
  }, [router]);

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Slot />
      {Platform.OS === 'web' && <PWAInstallPrompt />}
    </ApplicationProvider>
  );
}
