import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function AccountSetup() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Configura tu cuenta</Text>
      <Button title="Guardar y continuar" onPress={() => router.push('/profile')} />
    </View>
  );
}
