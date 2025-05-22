import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import User from '../models/User';

export default function Inscription(props) {
    const url = "https://lorieau.alwaysdata.net/memotrip/api/register";
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [mot_de_passe, setMotDePasse] = useState("");

    function handlerAdd(u) {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "application/json");
        const fetchOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(u.toJSON()),
        };

        fetch(url, fetchOptions)
            .then((response) => {
                return response.json().then(data => ({ status: response.status, body: data }));
            })
            .then((data) => {
                if (data.status === 201) {
                    setPrenom("");
                    setNom("");
                    setEmail("");
                    setMotDePasse("");
                    Alert.alert("Inscription réussie", "Votre compte a bien été créé.");
                    props.navigation.navigate('Connexion', { message: "Votre compte a bien été créé." });
                } else {
                    Alert.alert("Erreur", data.body.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
                }
            })
            .catch((error) => {
                console.error("Fetch Error:", error);
                Alert.alert("Erreur", "Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
            });
    }

    function handleSubmit() {
        if (prenom !== "" && nom !== "" && email !== "" && mot_de_passe !== "") {
            let u = new User(null, prenom, nom, email, mot_de_passe, 0);
            handlerAdd(u);
        } else {
            Alert.alert("Champs requis", "Veuillez remplir tous les champs correctement.");
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.block}>
                <Text style={styles.header}>Inscrivez-vous</Text>
                <TextInput
                    label="Prénom"
                    value={prenom}
                    onChangeText={setPrenom}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Nom"
                    value={nom}
                    onChangeText={setNom}
                    style={styles.input}
                    mode="outlined"
                />
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
                    value={mot_de_passe}
                    onChangeText={setMotDePasse}
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
                    S'inscrire
                </Button>
                <Text style={styles.footerText}>
                    Vous avez déjà un compte ?{' '}
                    <Text
                        style={styles.link}
                        onPress={() => props.navigation.navigate('Connexion')}
                    >
                        Connectez-vous ici
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
        backgroundColor: "#f5f5f5", // Fond neutre, gris très clair
        padding: 20,
    },
    block: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff', // Fond blanc pour la carte
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
        backgroundColor: "#34495e", // Accent de couleur neutre (bleu)
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
});
