import React from 'react';
import {useAuth} from './auth/AuthContext';
import { PaymentHistory } from './components/PaymentHistory';
import { View, Text } from 'react-native';

export const PaymentDetails = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <View>
                <Text>No estás autenticado. Por favor, inicia sesión.</Text>
            </View>
        );
    }

    return (
        <PaymentHistory currentUser={currentUser} />
    );
};