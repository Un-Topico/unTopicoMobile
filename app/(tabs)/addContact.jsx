import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';

const AddContact_Screen = () => {
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContactEmail, setNewContactEmail] = useState("");
    const [newContactAlias, setNewContactAlias] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setErrorMessage] = useState("");
    const [contacts, setContacts] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

    const router = useRouter();
    const db = getFirestore();
    console.log(db);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        setErrorMessage("Debes estar autenticado para añadir un contacto.");
        return;
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const normalizeAlias = (alias) => {
        return alias.replace(/\s+/g, "");
    };

    const handleAddContact = async () => {
        const normalizedEmail = newContactEmail.trim();
        const normalizedAlias = normalizeAlias(newContactAlias);

        if (!normalizedEmail || !normalizedAlias) {
            setErrorMessage("El correo y el alias del contacto no pueden estar vacíos o completados por espacios.");
            return;
        }

        if (!validateEmail(normalizedEmail)) {
            setErrorMessage("El formato del correo no es válido.");
            return;
        }
        setLoading(true);
        try {
            // Verificar si ya existe un contacto con el mismo correo
            const emailQuery = query(
                collection(db, "contacts"),
                where("ownerId", "==", currentUser.uid),
                where("email", "==", normalizedEmail)
            );

            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                setErrorMessage("Ya existe un contacto con ese correo.");
                return;
            }

            // Verificar si ya existe un contacto con el mismo alias
            const aliasQuery = query(
                collection(db, "contacts"),
                where("ownerId", "==", currentUser.uid),
                where("alias", "==", normalizedAlias)
            );

            const aliasSnapshot = await getDocs(aliasQuery);

            if (!aliasSnapshot.empty) {
                setErrorMessage("Ya existe un contacto con ese alias.");
                return;
            }

            // Si pasa las verificaciones, agregar el nuevo contacto      
            const docRef = await addDoc(collection(db, "contacts"), {
                ownerId: currentUser.uid,
                email: normalizedEmail,
                alias: normalizedAlias,
            });

            setContacts([...contacts, { id: docRef.id, email: newContactEmail, alias: newContactAlias }]);
            setNewContactEmail("");
            setNewContactAlias("");
            setShowAddContact(false);
            setSuccessMessage("Contacto añadido con éxito.");

            router.push('/transfer');
        } catch (error) {
            setErrorMessage(`Error al añadir el contacto: ${error.message}`);
        } finally {
            setLoading(false);
        }

    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Button title="X" onPress={() => router.navigate('/transfer')}></Button>
                    <Text>¿Cómo quieres transferir el dinero?</Text>
                    <Text>Tipo de transferencia</Text>
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
                    {success && <Text style={{ color: "green" }}>{success}</Text>}
                    {error && <Text style={{ color: "red" }}>{error}</Text>}
                </View>

            </TouchableWithoutFeedback>


        </KeyboardAvoidingView>

    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 100,
    },
    button: {
        padding: 15,
        backgroundColor: '#007bff',
        borderRadius: 5,
        marginVertical: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default AddContact_Screen;
