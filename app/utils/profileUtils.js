import { getStorage, ref, deleteObject } from "firebase/storage";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "./firebaseConfig";

export const deleteProfilePicture = async (userId) => {
  const db = getFirestore(app);
  const storage = getStorage(app);

  try {
    // Obtener el documento de la cuenta del usuario
    const accountsRef = collection(db, "accounts");
    const accountQuery = query(accountsRef, where("ownerId", "==", userId));
    const querySnapshot = await getDocs(accountQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userDocRef = doc(db, "accounts", userDoc.id);

      // Verificar si existe la imagen de perfil
      if (userData.profileImage) {
        const imageRef = ref(storage, userData.profileImage);

        // Eliminar la imagen de Firebase Storage
        await deleteObject(imageRef);

        // Actualizar Firestore para eliminar la URL de la imagen
        await updateDoc(userDocRef, { profileImage: "" });

        return { success: true, message: "Imagen eliminada exitosamente" };
      } else {
        return { success: false, message: "No se encontró imagen para eliminar" };
      }
    }
  } catch (error) {
    console.error("Error al eliminar la imagen de perfil:", error);
    return { success: false, message: error.message };
  }
};
