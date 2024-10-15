import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query, 
  where
} from "firebase/firestore";
import { app } from "../utils/firebaseConfig";

const Settings = () => {
  const iconSize = 30;
  const iconColor = "#000000";
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { currentUser } = auth;
  const [userName, setUserName] = useState("");
  const [userImageURL, setUserImageURL] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const accountsRef = collection(db, "accounts");
          const accountQuery = query(accountsRef, where("ownerId", "==", currentUser.uid));
          const querySnapshot = await getDocs(accountQuery);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            if (userDoc) {
              const userData = userDoc.data();
              setUserName(userData.name);
              setUserImageURL(userData.profileImage);
            }
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario: ", error);
        }
      }
    };

    fetchUserData();
  }, [currentUser, db]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const screenOptions = {
    Información_Personal: {
      displayName: 'Información Personal',
      iconName: 'address-book-o',
      onPress: () => router.push('/personal_Info'),
    },
    Notifications: {
      displayName: ' Notificaciones',
      iconName: 'barcode',
      onPress: () => router.push('/Notifications'),
    },
    Cambiar_NIP: {
      displayName: 'Cambiar NIP',
      iconName: 'circle',
      onPress: () => router.push('/changeNIP'),
    },
    Cerrar_Sesión: {
      displayName: 'Cerrar Sesión',
      iconName: 'sign-out',
      onPress: handleLogout,
    },
  };

  const screenOptions_Settings = {
    Preguntas_Frecuentes: {
      displayName: 'Preguntas Frecuentes',
      iconName: 'question-circle-o',
      onPress: () => router.push('/FAQ'),
    },
    Chat_Soporte: {
      displayName: 'Chat con Soporte',
      iconName: 'commenting-o',
      onPress: () => router.push('/chat'),
    },
  };

  const renderOptions = (options) => {
    return Object.entries(options).map(([screenName, { displayName, iconName, onPress }]) => (
      <TouchableOpacity key={screenName} style={styles.button} onPress={onPress}>
        <View style={styles.option}>
          <Icon name={iconName} size={iconSize} color={iconColor} style={styles.optionIcon} />
          <Text style={styles.optionText}>{displayName}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title0}>Settings</Text>

        <View style={styles.ViewProfImage}>
          {userImageURL ? (
            <Image 
              source={{ uri: userImageURL }} 
              style={styles.ImageProfile} 
              resizeMode="cover"
            />
          ) : (
            <Icon name="user-circle-o" size={100} color={iconColor} style={styles.ImageProfile} />
          )}
          <Text style={styles.title}>{userName}</Text>
        </View>

        <View style={styles.ViewSettings}>
          <Text style={styles.title2}>Profile</Text>
          {renderOptions(screenOptions)}
        </View>

        <View style={styles.ViewSupport}>
          <Text style={styles.title2}>Soporte</Text>
          {renderOptions(screenOptions_Settings)}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 70, // Para agregar un pequeño espacio al final
  },
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  ImageProfile: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    marginLeft: 20,
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

export default Settings;
