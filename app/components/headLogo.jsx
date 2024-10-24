import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const HeadLogo = () => {
  const appName = "Untopico";
  const logoSource = require('../../assets/images/logo.png');

  return (
    <View style={styles.head}>
      <Image style={styles.logo} source={logoSource} />
      <Text style={styles.headtitle}>{appName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  head: {
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    flexDirection: 'row',
  },
  logo: {
    width: 25,
    height: 25,
    marginBottom: 5,
    marginRight: 10,
  },
  headtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default HeadLogo;