// import { Tabs } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// export default function TabLayout() {
//   const iconSize = 30; // Tamaño global para los íconos
//   const labelSize = 12; // Tamaño global para el texto

//   return (
//     <Tabs
//       initialRouteName="Home" // Define la pantalla inicial
//       screenOptions={{
//         tabBarActiveTintColor: 'blue',
//         tabBarLabelStyle: {
//           fontSize: labelSize, // Ajusta el tamaño del texto aquí
//         },
//       }}
//     >
//       {/* Pestaña de Transferir */}
//       <Tabs.Screen
//         name="Transferir"
//         options={{
//           title: 'Transferir',
//           tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="money" color={color} />,
//         }}
//       />

//       {/* Pestaña de inicio (Home) */}
//       <Tabs.Screen
//         name="Home"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="home" color={color} />,
//           headerShown: false,
//         }}
//       />

//       {/* Pestaña de Perfil */}
//       <Tabs.Screen
//         name="Perfil"
//         options={{
//           title: 'Perfil',
//           tabBarIcon: ({ color }) => <FontAwesome size={iconSize} name="user" color={color} />,
//           headerShown: false,
//         }}
//       />

//       {/* Ocultar pestañas de Retirar, Depositar y Reportes */}
//       <Tabs.Screen
//         name="Retirar"
//         options={{ href: null }} // Oculta la pestaña de "Retirar"
//       />
//       <Tabs.Screen
//         name="Depositar"
//         options={{ href: null }} // Oculta la pestaña de "Depositar"
//       />
//       <Tabs.Screen
//         name="Reportes"
//         options={{ href: null }} // Oculta la pestaña de "Reportes"
//       />
//     </Tabs>
//   );
// }
