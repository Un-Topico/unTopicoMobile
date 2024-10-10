import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentDetails = () => {
    const navigation = useNavigation();

    return (
        <View>
            <Text>Detalles de Pago</Text>
            <Button
                title="Ver Historial de Pagos"
                onPress={() => navigation.navigate('PaymentHistory')}
            />
        </View>
    );
};

export default PaymentDetails;