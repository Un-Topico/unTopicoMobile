import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import { useRouter } from 'expo-router';
export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Estado del usuario:', user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Navegación controlada después de que el estado del usuario haya sido cargado
      if (user) {
        router.replace('/home');
      } 
    }
  }, [user, loading, router]);

  

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="depositar" options={{ headerShown: false }} />
      <Stack.Screen name="retirar" options={{ headerShown: false }} />
      <Stack.Screen name="transferir" options={{ headerShown: false }} />
      <Stack.Screen name="reportes" options={{ headerShown: false }} />
      
    </Stack>
  );
}
