import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Card from '../components/card';
import { CreditCardForm } from '../components/CreditCardForm';
import { DeleteCreditCard } from '../components/DeleteCreditCard';

// Constantes para los textos
const TITLE = 'Mis Tarjetas';
const BUTTON_TEXT = 'Agregar Nueva Tarjeta';
const BUTTON_TEXT2 = 'Eliminar Tarjeta';

const MisTarjetas = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleCardSaved = (saved) => {
        if (saved) {
            console.log('Tarjeta guardada exitosamente');
        } else {
            console.log('No se pudo guardar la tarjeta');
        }
        setModalVisible(false);
    };

    const handleDeleteCard = (deleted) => {
        if (deleted) {
            console.log('Tarjeta eliminada exitosamente');
        } else {
            console.log('No se pudo eliminar la tarjeta');
        }
        setDeleteModalVisible(false);
    };

    function handleAddCard() {
        setModalVisible(true);
    }

    function handleDropCard() {
        setDeleteModalVisible(true);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{TITLE}</Text>

            <TouchableOpacity style={styles.button} onPress={handleAddCard}>
                <Text style={styles.buttonText}>{BUTTON_TEXT}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleDropCard}>
                <Text style={styles.buttonText}>{BUTTON_TEXT2}</Text>
            </TouchableOpacity>

            <ScrollView>
                <Card />
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        <ScrollView contentContainerStyle={styles.formContainer}>
                            <CreditCardForm onCardSaved={handleCardSaved} />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}  // Cerrar el modal manualmente
                        >
                            <Text style={styles.buttonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModalVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>¿Estás seguro de eliminar la tarjeta?</Text>

                        <ScrollView contentContainerStyle={styles.deleteFormContainer}>
                            <DeleteCreditCard onDeleteCard={handleDeleteCard} />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setDeleteModalVisible(false)}  
                        >
                            <Text style={styles.buttonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4FD290',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    formContainer: {
        flexGrow: 1,
        justifyContent: 'center',  
    },
    closeButton: {
        backgroundColor: '#FF5252',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteFormContainer: {
        flexGrow: 1,
        justifyContent: 'center',  
        height: 400,
    }
});

export default MisTarjetas;
