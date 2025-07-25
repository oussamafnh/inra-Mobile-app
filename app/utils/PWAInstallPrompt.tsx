import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      return;
    }

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setShowInstallPrompt(true);
    } else {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowInstallPrompt(true);
      };

      const handleAppInstalled = () => {
        console.log('PWA installée');
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstallPrompt(false);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(outcome === 'accepted' ? 'L’utilisateur a accepté l’installation' : 'L’utilisateur a refusé l’installation');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (Platform.OS !== 'web' || !showInstallPrompt) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.content}>
          {isIOS && (
            <Image
              source={{ uri: '/tutorial.png' }}
              style={styles.tutorialImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.title}>Installer l’application</Text>
          <Text style={styles.description}>
            {isIOS
              ? 'Pour installer cette application, touchez le bouton Partager dans Safari, puis sélectionnez "Ajouter à l’écran d’accueil".'
              : 'Installez cette application sur votre appareil pour une meilleure expérience !'}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.dismissButton]} onPress={handleDismiss}>
            <Text style={styles.dismissText}>Plus tard</Text>
          </TouchableOpacity>
          {!isIOS && (
            <TouchableOpacity style={[styles.button, styles.installButton]} onPress={handleInstallClick}>
              <Text style={styles.installText}>Installer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
    }),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  content: {
    marginBottom: 16,
    alignItems: 'center',
  },
  tutorialImage: {
    width: '100%',
    height: 350,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  installButton: {
    backgroundColor: '#007AFF',
  },
  dismissText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  installText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PWAInstallPrompt;
