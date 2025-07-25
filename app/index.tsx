import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { saveItem, getItem, deleteItem } from './utils/authToken';

export default function IndexPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {

    const validateToken = async () => {
      try {
        const storedToken = await getItem('authToken');
        if (!storedToken) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/validate-token`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { status, role } = await response.json();
        if (status === 'logged') {
          router.push(role === 'admin' ? '/admin' : role === 'chercheur' ? '/chercheur' : '/auth');
        } else {
          await Promise.all([
            deleteItem('authToken'),
            deleteItem('id'),
            deleteItem('fullName'),
          ]);
          router.push('/auth');
        }
      } catch {
        await Promise.all([
          deleteItem('authToken'),
          deleteItem('id'),
          deleteItem('fullName'),
        ]);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    const simulateProgress = () => {
      let count = 0;
      const interval = setInterval(() => {
        count += 5;
        setProgress(count);
        if (count >= 100) clearInterval(interval);
      }, 50);
    };

    simulateProgress();
    validateToken();
  }, [router]);

  return (
    <View style={styles.container}>
      {loading && (
        <>
          <ActivityIndicator size="large" color="#48bb78" />
          <Text style={styles.progressText}>{progress}%</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48bb78',
  },
});
