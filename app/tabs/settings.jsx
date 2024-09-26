import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from "firebase/auth"; // Importa signOut
import { app } from "../utils/firebaseConfig";


const settings = () => {
  const iconSize = 30;
  const iconColor = "#000000";
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Definiciones de los nombres de las opciones con sus íconos correspondientes
  const screenOptions = {
    Información_Personal: {
      displayName: 'Información Personal',
      iconName: 'address-book-o',
      onPress: () => router.push('./personal_Info'),
    },
    Cambiar_NIP: {
      displayName: 'Cambiar NIP',
      iconName: 'circle',
      onPress: () => Alert.alert('Navegando a Cambiar NIP'),
    },
    Cerrar_Sesión: {
      displayName: 'Cerrar Sesión',
      iconName: 'sign-out',
      onPress: handleLogout,
    },
    // Se pueden agregar más elementos aquí
  };

  const screenOptions_Settings = {
    Preguntas_Frecuentes: {
      displayName: 'Preguntas Frecuentes',
      iconName: 'question-circle-o',
      onPress: () => Alert.alert('Mostrando Preguntas Frecuentes'),
    },
    Chat_Soporte: {
      displayName: 'Chat con Soporte',
      iconName: 'commenting-o',
      onPress: () => Alert.alert('Iniciando chat con soporte'),
    },
  };

  // Renderiza cada opción de configuración de manera dinámica
  const renderProfileOptions = () => {
    return Object.entries(screenOptions).map(([screenName, { displayName, iconName, onPress }]) => (
      <TouchableOpacity key={screenName} style={styles.button} onPress={onPress}>
        <View style={styles.option}>
          <Icon name={iconName} size={iconSize} color={iconColor} style={styles.optionIcon} />
          <Text style={styles.optionText}>{displayName}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  // Renderiza cada opción de configuración de manera dinámica
  const renderSettingsOptions = () => {
    return Object.entries(screenOptions_Settings).map(([screenName, { displayName, iconName, onPress }]) => (
      <TouchableOpacity key={screenName} style={styles.button} onPress={onPress}>
        <View style={styles.option}>
          <Icon name={iconName} size={iconSize} color={iconColor} style={styles.optionIcon} />
          <Text style={styles.optionText}>{displayName}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title0}>Settings</Text>

      <View style={styles.ViewProfImage}>
        <Icon name="user-circle-o" size={100} color={iconColor} style={styles.ImageProfile} />
        <Text style={styles.title}>Juancho Pérez</Text>
      </View>

      <View style={styles.ViewSettings}>
        <Text style={styles.title2}>Profile</Text>
        {renderProfileOptions()}
      </View>

      <View style={styles.ViewSupport}>
        <Text style={styles.title2}>Soporte</Text>
        {renderSettingsOptions()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  title0: {
    fontSize: 40,
    marginTop: '20%',
    left: '10%',
    fontWeight: 'bold',
  },
  ViewProfImage: {
    position: 'relative',
    top: '4%',
    left: '10%',
    width: '100%',
  },
  ImageProfile: {
    width: 100,
    height: 100,
  },
  title: {
    position: 'absolute',
    fontSize: 20,
    marginTop: '10%',
    left: '30%',
    fontWeight: 'bold',
  },
  ViewSettings: {
    position: 'relative',
    top: '8%',
    left: '10%',
  },
  ViewSupport: {
    position: 'relative',
    top: '8%',
    left: '10%',
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  optionIcon: {
    marginRight: 10,
    marginLeft: 10,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 8,
  },
});

export default settings;
