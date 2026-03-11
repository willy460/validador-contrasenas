import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const validatePassword = () => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (hasMinLength && hasUpperCase && hasNumber) {
      setMessage('✅ Contraseña segura');
    } else {
      setMessage('❌ No cumple los requisitos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Validador de Contraseñas</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.requirements}>
        <Text style={styles.requirement}>
          {password.length >= 8 ? '✅' : '❌'} Mínimo 8 caracteres
        </Text>

        <Text style={styles.requirement}>
          {/[A-Z]/.test(password) ? '✅' : '❌'} Al menos una mayúscula
        </Text>

        <Text style={styles.requirement}>
          {/[0-9]/.test(password) ? '✅' : '❌'} Al menos un número
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={validatePassword}>
        <Text style={styles.buttonText}>Validar</Text>
      </TouchableOpacity>

      {message !== '' && (
        <Text style={styles.result}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },

  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },

  requirements: {
    width: '100%',
    marginBottom: 30,
  },

  requirement: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },

  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  result: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  }
});