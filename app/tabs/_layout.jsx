import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importa GestureHandlerRootView

export default function TabLayout() {
  const iconSize = 30; // Tamaño global para los íconos
  const labelSize = 12; // Tamaño global para el texto

  return (
    // Envuelve con GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        initialRouteName="profile" // Define la pantalla inicial
        screenOptions={{
          tabBarActiveTintColor: 'blue',
          tabBarLabelStyle: {
            fontSize: labelSize, // Ajusta el tamaño del texto aquí
          },
        }}
      >


        {/* Pestaña de profile (Home de Alexis) */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'profile Alexis',
            tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="home" color={color} />,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="cards"
          options={{
            title: 'Mis Tarjetas',
            tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="credit-card" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Soporte',
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
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="cog" color={color} />,
            headerShown: false,
          }}
        />


        {/* OCULTAR PESTAÑAS (options...) 
        <Tabs.Screen
          name="Retirar"
          options={{ href: null }} // Oculta la pestaña de "Retirar"
        />
        */}
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
          }} // Oculta la pestaña de "Reportes"
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

        {/* <Tabs.Screen
          name="chat"
          options={{
            href: null,
            headerShown: false,
          }}
        /> */}

      </Tabs>
    </GestureHandlerRootView>
  );
}