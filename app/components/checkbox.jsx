import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

const CustomCheckbox = ({ isCheckedInitially = false, onChange }) => {
  const [isChecked, setIsChecked] = useState(isCheckedInitially);

  const handlePress = () => {
    setIsChecked(!isChecked);
    if (onChange) {
      onChange(!isChecked); // Llama a la función callback para notificar cambios
    }
  };

  return (
    <TouchableOpacity
      style={[styles.checkbox, isChecked && styles.checkedCheckbox]}
      onPress={handlePress}
    >
      {isChecked}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#DDE1E5',
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  checkedCheckbox: {
    backgroundColor: '#4FD290',
    borderColor: '#4FD290',
  },
});

export default CustomCheckbox;