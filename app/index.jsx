import { useRouter } from 'expo-router';
import { View, Button } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Login" onPress={() => router.push('/login')} />
      <Button title="Register" onPress={() => router.push('/register')} />
    </View>
  );
}