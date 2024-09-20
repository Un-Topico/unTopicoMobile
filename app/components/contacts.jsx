import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { TextInput } from "react-native";

const Contacts = ({ currentUser, onContactSelect, setError, setSuccess }) => {
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState("");

  const db = getFirestore();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const q = query(
          collection(db, "contacts"),
          where("ownerId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const contactsData = [];
        querySnapshot.forEach((doc) => {
          contactsData.push({ ...doc.data(), id: doc.id });
        });
        setContacts(contactsData);
      } catch (error) {
        setError("Error al obtener los contactos.");
      }
    };

    fetchContacts();
  }, [db, currentUser.uid, setError]);

  const handleAddContact = async () => {
    try {
      if (!newContactEmail) {
        setError("El correo del contacto no puede estar vacío.");
        return;
      }

      await addDoc(collection(db, "contacts"), {
        ownerId: currentUser.uid,
        email: newContactEmail,
      });

      setContacts([...contacts, { email: newContactEmail }]);
      setNewContactEmail("");
      setShowAddContact(false);
      setSuccess("Contacto añadido con éxito.");
    } catch (error) {
      setError("Error al añadir el contacto.");
    }
  };

  return (
    <View>
      <Button
        title={showAddContact ? "Ocultar Formulario" : "Añadir Contacto"}
        onPress={() => setShowAddContact(!showAddContact)}
      />

      {showAddContact && (
        <View>
          <Text>Correo Electrónico del Contacto</Text>
          <TextInput
            value={newContactEmail}
            onChangeText={(text) => setNewContactEmail(text)}
            placeholder="Ingresa el correo del contacto"
            style={{ borderColor: "gray", borderWidth: 1, marginBottom: 8 }}
          />
          <Button title="Agregar Contacto" onPress={handleAddContact} />
        </View>
      )}

      <Text>Selecciona un Contacto</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <Text>{item.email}</Text>
            <Button title="Seleccionar" onPress={() => onContactSelect(item.email)} />
          </View>
        )}
      />
    </View>
  );
};

export default Contacts;
