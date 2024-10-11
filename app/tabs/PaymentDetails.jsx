import React from 'react';
import {View, StyleSheet } from 'react-native';
import PaymentHistory from './PaymentHistory';

const PaymentDetails = () => {

    return (
        <View style={styles.container}>
            <PaymentHistory/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
});

export default PaymentDetails;