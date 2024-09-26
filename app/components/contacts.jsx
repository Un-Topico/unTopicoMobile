import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert} from "react-native";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { TextInput } from "react-native";
import { Picker } from '@react-native-picker/picker'; // Importar Picker
import { ActivityIndicator } from "react-native-paper";

const Contacts = ({ currentUser, onContactSelect, setError, setSuccess }) => {
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactAlias, setNewContactAlias] = useState("");
  const [selectedContact, setSelectedContact] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [db, currentUser.uid, setError]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddContact = async () => {

    if (!newContactEmail.trim() || !newContactAlias.trim()) {
      setError("El correo y el alias del contacto no pueden estar vacíos o completados por espacios.");
      return;
    }
  
    if (!validateEmail(newContactEmail)) {
      setError("El formato del correo no es válido.");
      return;
    }
  
    try {
      // Verificar si ya existe un contacto con el mismo correo
      const emailQuery = query(
        collection(db, "contacts"),
        where("ownerId", "==", currentUser.uid),
        where("email", "==", newContactEmail)
      );
  
      const emailSnapshot = await getDocs(emailQuery);
  
      if (!emailSnapshot.empty) {
        setError("Ya existe un contacto con ese correo.");
        return;
      }
  
      // Verificar si ya existe un contacto con el mismo alias
      const aliasQuery = query(
        collection(db, "contacts"),
        where("ownerId", "==", currentUser.uid),
        where("alias", "==", newContactAlias)
      );
  
      const aliasSnapshot = await getDocs(aliasQuery);
  
      if (!aliasSnapshot.empty) {
        setError("Ya existe un contacto con ese alias.");
        return;
      }
  
      // Si pasa las verificaciones, agregar el nuevo contacto      
      const docRef = await addDoc(collection(db, "contacts"), {
        ownerId: currentUser.uid,
        email: newContactEmail,
        alias: newContactAlias,
      });

      setContacts([...contacts, { id: docRef.id, email: newContactEmail, alias: newContactAlias }]);
      setNewContactEmail("");
      setNewContactAlias("");
      setShowAddContact(false);
      setSuccess("Contacto añadido con éxito.");
    } catch (error) {
      setError(`Error al añadir el contacto: ${error.message}`);
    }
  };
  
  const handleDeleteContact = async (contactId) => {
    try {
      await deleteDoc(doc(db, "contacts", contactId));
      setContacts(contacts.filter(contact => contact.id !== contactId));
      setSuccess("Contacto eliminado con éxito");
    } catch (error) {
      setError(`Error al eliminar el contacto: ${error.message}`);
    }
  };

  const confirmDeleteContact = (contactId) => {
    Alert.alert(
      "Eliminar contacto",
      "¿Estás seguro de que deseas eliminar este contacto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => handleDeleteContact(contactId),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
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
          <Text>Alias del Contacto</Text>
          <TextInput
            value={newContactAlias}
            onChangeText={(text) => setNewContactAlias(text)}
            placeholder="Ingresa el alias del contacto"
            style={{ borderColor: "gray", borderWidth: 1, marginBottom: 8 }}
          />
          <Button title="Agregar Contacto" onPress={handleAddContact} disabled={loading} />
        </View>
      )}

      <Button 
        title={showContacts ? "Ocultar contactos":"Mostrar contactos"}
        onPress={() => setShowContacts(!showContacts)}
      />

      {showContacts && (
        <View>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View>
              <Text>Selecciona un Contacto</Text>
              <Picker
                selectedValue={selectedContact}
                onValueChange={(itemValue) => {
                  setSelectedContact(itemValue);
                  onContactSelect(itemValue);
                }}
              >
                <Picker.Item label="Seleccione un contacto" value="" />
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <Picker.Item
                      key={contact.id}
                      label={`${contact.alias} (${contact.email})`}
                      value={contact.email}
                    />
                  ))
                ) : (
                  <Picker.Item label="No hay contactos" value="" />
                )}
              </Picker>

              <Text>Eliminar Contacto</Text>
              {contacts.map((contact) => (
                <View key={contact.id}>
                  <Text>{contact.alias} ({contact.email})</Text>
                  <Button
                    title="Eliminar"
                    onPress={() => confirmDeleteContact(contact.id)}
                    color="red"
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Contacts;
