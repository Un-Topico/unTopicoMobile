import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importa GestureHandlerRootView
import { CardProvider } from '../context/CardContext'; // Importa el proveedor del contexto de tarjeta

export default function TabLayout() {
  const iconSize = 30; // Tamaño global para los íconos
  const labelSize = 12; // Tamaño global para el texto

  return (
    // Envuelve con GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Envuelve las Tabs con el proveedor del contexto */}
      <CardProvider>
        <Tabs
          initialRouteName="home" // Define la pantalla inicial
          screenOptions={{
            tabBarActiveTintColor: 'blue',
            tabBarLabelStyle: {
              fontSize: labelSize, // Ajusta el tamaño del texto aquí
            },
          }}
        >
          <Tabs.Screen
            name="cards"
            options={{
              title: 'Mis Tarjetas',
              tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="credit-card" color={color} />,
              headerShown: false,
            }}
          />

          {/* Pestaña de inicio (Home) */}
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="home" color={color} />,
              headerShown: false,
            }}
          />

          <Tabs.Screen
            name="servicios"
            options={{
              title: 'Servicios',
              tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="list-alt" color={color} />,
              headerShown: false,
            }}
          />

          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="cog" color={color} />,
              headerShown: false,
            }}
          />

          {/* Pestañas ocultas */}
          <Tabs.Screen
            name="deposit"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="transfer"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="withdraw"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="reportes"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="personal_Info"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="changeNIP"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="FAQ"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="Notifications"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="PaymentDetails"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="PaymentHistory"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="qrDepositForm"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="qrScanForm"
            options={{
              href: null,
              headerShown: false,
            }}
          />
        </Tabs>
      </CardProvider>
    </GestureHandlerRootView>
  );
}
