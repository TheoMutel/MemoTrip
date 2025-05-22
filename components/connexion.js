import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Connexion(props) {
    const { signIn } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (validateEmail(email) && password !== '') {
            envoiedonnees(email, password);
        } else {
            console.log('Email or password is invalid');
        }
    }

    async function envoiedonnees(email, password) {
        const url = "https://lorieau.alwaysdata.net/memotrip/api/login";
        const user = { email, mot_de_passe: password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            const data = await response.json();
            console.log(data);
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                signIn(data.token, data.user);
                props.navigation.navigate("Accueil");
            } else {
                setError('Échec de la connexion. Vérifiez vos informations d\'identification.');
            }
        } catch (error) {
            console.log(error);
            setError('Échec de la connexion. Vérifiez vos informations d\'identification.');
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.block}>
                {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                <Text style={styles.header}>Connectez-vous</Text>
                <TextInput
                    label="Adresse mail"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    placeholder="votre.adresse.mail@company.com"
                    mode="outlined"
                />
                <TextInput
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    mode="outlined"
                />
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                    labelStyle={styles.buttonText}
                >
                    Se connecter
                </Button>
                <Text style={styles.footerText}>
                    Vous n'avez pas de compte ?{' '}
                    <Text
                        style={styles.link}
                        onPress={() => props.navigation.navigate('Inscription')}
                    >
                        Créez-en un ici
                    </Text>
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#f5f5f5", // Fond très clair et neutre
        padding: 20,
    },
    block: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff', // Fond blanc, propre, neutre
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // Ombre plus subtile
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#333333",
        textAlign: 'center',
    },
    input: {
        width: "100%",
        marginBottom: 15,
        backgroundColor: "#ffffff",
    },
    button: {
        width: "100%",
        marginTop: 20,
        backgroundColor: "#34495e", // Un bleu neutre, moderne
        borderRadius: 8,
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    footerText: {
        marginTop: 20,
        fontSize: 16,
        color: "#333333",
        textAlign: 'center',
    },
    link: {
        color: "#34495e",
        textDecorationLine: 'underline',
    },
    errorMessage: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    }
});
