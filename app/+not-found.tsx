import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.message}>Page Not Found</Text>
      <Button
        title="Go Back Home"
        onPress={() => router.replace('/')} // Redirige a la página de inicio
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
});
