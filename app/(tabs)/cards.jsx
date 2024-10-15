import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../components/card';
import { ScrollView } from 'react-native-gesture-handler';

// Constantes para los textos
const TITLE = 'Mis Tarjetas';
const BUTTON_TEXT = 'Agregar Nueva Tarjeta';
const BUTTON_TEXT2 = 'Eliminar Tarjeta';

const MisTarjetas = () => {

    function handleAddCard() {

    }

    function handleDropCard() {

    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{TITLE}</Text>

            {/* Botón para Agregar Tarjetas */}
            <TouchableOpacity style={styles.button} onPress={handleAddCard}>
                <Text style={styles.buttonText}>{BUTTON_TEXT}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleDropCard}>
                <Text style={styles.buttonText}>{BUTTON_TEXT2}</Text>
            </TouchableOpacity>

            <ScrollView>
                <Card />
            </ScrollView>
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

});

export default MisTarjetas;