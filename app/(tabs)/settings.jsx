import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";
import { app } from "../utils/firebaseConfig";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar Firebase Storage

const Settings = () => {
  const iconSize = 30;
  const iconColor = "#000000";
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app); // Inicializar Firebase Storage
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
              setUserImageURL(userData.profileImage); // Cargar la URL de la imagen desde Firestore
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

  const uploadImageToFirebase = async (imageUri) => {
    try {
      const response = await fetch(imageUri); // Obtener el archivo de la URI
      const blob = await response.blob(); // Convertir la respuesta en blob
      
      // Crear una referencia a Firebase Storage con el UID del usuario
      const storageRef = ref(storage, `profileImages/${currentUser.uid}.jpg`);
      
      // Subir la imagen a Firebase Storage
      await uploadBytes(storageRef, blob);

      // Obtener la URL pública de la imagen subida
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL; // Retornar la URL para guardarla en Firestore
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  const changeProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permiso para acceder a la galería es necesario.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const selectedImageUri = pickerResult.assets[0].uri;

      if (!selectedImageUri) {
        Alert.alert("Error", "No se puede obtener la imagen seleccionada.");
        return;
      }

      try {
        // Subir la imagen a Firebase Storage y obtener la URL pública
        const imageUrl = await uploadImageToFirebase(selectedImageUri);

        setUserImageURL(imageUrl); // Actualizar la imagen en la pantalla con la nueva URL

        // Actualizar la URL de la imagen en Firestore
        const accountsRef = collection(db, "accounts");
        const accountQuery = query(accountsRef, where("ownerId", "==", currentUser.uid));
        const querySnapshot = await getDocs(accountQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userDocRef = doc(db, "accounts", userDoc.id);

          await updateDoc(userDocRef, { profileImage: imageUrl });
          Alert.alert("Imagen de perfil actualizada exitosamente");
        }
      } catch (error) {
        console.error("Error al actualizar la imagen de perfil:", error);
        Alert.alert("Error", "Hubo un problema al actualizar la imagen de perfil.");
      }
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
        <View style={styles.datosPerfil}>
          
        <TouchableOpacity onPress={changeProfilePicture} style={styles.ViewProfImage}>
            {userImageURL ? (
              <Image
                source={{ uri: userImageURL }}
                style={styles.ImageProfile}
                resizeMode="cover"
              />
            ) : (
              <Icon name="user-circle-o" size={100} color={iconColor} style={styles.ImageProfile} />
            )}
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>{userName}</Text>
          </View>
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
    paddingBottom: 70, 
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
  datosPerfil: {
    flexDirection: 'row',
    alignItems: 'center',    
    marginVertical: 20,
    marginHorizontal: 10, 
  },
  ViewProfImage: {
    marginRight: 15,
    left: 10,
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
    width: '75%',
    flexWrap: 'wrap',
  },
  ViewSettings: {
    position: 'relative',
    top: '6%',
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
