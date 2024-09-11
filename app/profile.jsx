import { useAuth } from './context/authContext';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.replace('/');
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenido, {user.email}</Text>
      <Button title="Cerrar sesión" onPress={() => {
        logout();
        router.push('/');
      }} />
    </View>
  );
}
