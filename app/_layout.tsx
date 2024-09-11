import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Home Screen */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }}/>
      <Stack.Screen name="accountSetup" options={{ headerShown: false }}/>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="depositar" options={{ headerShown: false }} />
      <Stack.Screen name="retirar" options={{ headerShown: false }} />
      <Stack.Screen name="transferir" options={{ headerShown: false }} />
      <Stack.Screen name="reportes" options={{ headerShown: false }} />

    </Stack>
  );
}
