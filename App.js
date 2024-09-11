import { AuthProvider } from './app/context/authContext';
import { Slot } from 'expo-router';

export default function App() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
