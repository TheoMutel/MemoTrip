import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";

const API_URL = "https://lorieau.alwaysdata.net/memotrip/api";

const getUserSuccess = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/success/${userId}`);
        const text = await response.text();
        console.log("Réponse API brute :", text);

        if (!response.ok || text.startsWith("<")) {
            console.error("Erreur API : ", text);
            return { photoCount: 0, success: [] };
        }

        const data = JSON.parse(text);
        return data; // On attend { photoCount: number, success: Array }
    } catch (error) {
        console.error("Erreur récupération succès :", error);
        return { photoCount: 0, success: [] };
    }
};

const successImages = {
    "Débutant": require("../assets/BadgeBase.png"),
    "Amateur": require("../assets/BadgePetitJoueur.png"),
    "Pro": require("../assets/BadgePremium.png"),
    "Expert": require("../assets/BadgeGod.png"),
    "Légende": require("../assets/BadgeOr.png"),
};

const successThresholds = {
    "Débutant": 5,
    "Amateur": 10,
    "Pro": 20,
    "Expert": 50,
    "Légende": 100,
};

const SuccessList = ({ userId }) => {
    const [photoCount, setPhotoCount] = useState(0);
    const [successList, setSuccessList] = useState([]);
    const numColumns = 2;

    useEffect(() => {
        const fetchSuccess = async () => {
            const result = await getUserSuccess(userId);
            setPhotoCount(result.photoCount);
            let successes = result.success;
            // Si le nombre d'éléments est impair, ajouter un élément "placeholder"
            if (successes.length % numColumns !== 0) {
                successes.push({ empty: true, title: "placeholder" });
            }
            setSuccessList(successes);
        };

        fetchSuccess();
    }, [userId]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mes Succès</Text>
            <FlatList
                data={successList}
                keyExtractor={(item, index) => index.toString()}
                numColumns={numColumns}
                columnWrapperStyle={styles.row}
                scrollEnabled={false}
                renderItem={({ item }) => {
                    if (item.empty) {
                        return <View style={[styles.card, styles.cardPlaceholder]} />;
                    }

                    const threshold = successThresholds[item.title];
                    const displayedCount = photoCount >= threshold ? threshold : photoCount;

                    return (
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <Image
                                    source={
                                        item.unlocked
                                            ? successImages[item.title]
                                            : require("../assets/BadgeBloque.png")
                                    }
                                    style={styles.icon}
                                />
                                <View style={styles.infoContainer}>
                                    <Title style={styles.cardTitle}>{item.title}</Title>
                                    <Paragraph style={styles.counter}>
                                        {displayedCount} / {threshold}
                                    </Paragraph>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }}
            />
        </View>
    );
};

export default SuccessList;

const { width } = Dimensions.get("window");
const cardWidth = (width -  75) / 2; // Calcul tenant compte du padding global et de l'espacement

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 15,
        textAlign: "center",
    },
    row: {
        justifyContent: "center", // Centrage des éléments de chaque ligne
        marginBottom: 20,
    },
    card: {
        width: cardWidth,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginHorizontal: 10,
        marginBottom: 20,
    },
    cardContent: {
        flexDirection: "column",
        alignItems: "center", // Centrage horizontal du contenu dans la carte
        justifyContent: "center",
    },
    icon: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        marginBottom: 5,
    },
    infoContainer: {
        alignItems: "center", // Centre le titre et le compteur
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#2C3E50",
        textAlign: "center",
    },
    counter: {
        fontSize: 16,
        color: "#34495E",
        marginTop: 4,
        textAlign: "center",
    },
    cardPlaceholder: {
        backgroundColor: "transparent",
        elevation: 0,
        shadowOpacity: 0,
    },
});
