import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Home Screen */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="accountSetup" />
    </Stack>
  );
}
