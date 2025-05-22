import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import {
  Text,
  Button,
  Dialog,
  Portal,
  Provider,
  IconButton,
} from "react-native-paper";
import { AuthContext } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import SuccessList from "./SuccessList"; // Assurez-vous que ceci est importé

export default function Profil(props) {
  const { user, signOut, updateUser } = useContext(AuthContext);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [newFirstName, setNewFirstName] = useState(user.prenom);
  const [newLastName, setNewLastName] = useState(user.nom);
  const navigation = useNavigation();

  // Déconnexion via l'icône en haut à droite
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch("https://lorieau.alwaysdata.net/memotrip/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      await signOut();
      props.navigation.navigate("Connexion");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se déconnecter");
      console.log(error);
    }
  };

  // Fonction de suppression de compte
  const handleDeleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
          "https://lorieau.alwaysdata.net/memotrip/api/deleteacc",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
      );
      if (response.ok) {
        Alert.alert("Succès", "Votre compte a été supprimé avec succès.");
        await signOut();
        props.navigation.navigate("Connexion");
      } else {
        Alert.alert("Erreur", "Impossible de supprimer le compte.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la suppression du compte.");
    }
  };

  const handleEditProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
          "https://lorieau.alwaysdata.net/memotrip/api/updateprofile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prenom: newFirstName, nom: newLastName }),
          }
      );
      if (response.ok) {
        const data = await response.json();
        Alert.alert("Succès", "Votre profil a été mis à jour avec succès.");
        updateUser({ prenom: data.user.prenom, nom: data.user.nom });
        setEditDialogVisible(false);
      } else {
        Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la mise à jour du profil.");
    }
  };

  return (
      <Provider>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Carte Profil avec header contenant l'icône logout en haut à droite */}
          <View style={styles.block}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Profil de l'utilisateur</Text>
              <IconButton
                  icon="exit-to-app"
                  size={24}
                  onPress={handleLogout}
                  style={styles.logoutIcon}
              />
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Prénom :</Text>
              <Text style={styles.value}> {user.prenom}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Nom :</Text>
              <Text style={styles.value}> {user.nom}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}> {user.email}</Text>
            </View>

            {/* Rangée : Voyages et Modifier Profil */}
            <View style={styles.buttonRow}>
              <Button
                  mode="contained"
                  onPress={() => navigation.navigate("Voyages")}
                  style={styles.button}
                  labelStyle={styles.buttonText}
              >
                Voyages
              </Button>
              <Button
                  mode="contained"
                  onPress={() => setEditDialogVisible(true)}
                  style={styles.button}
                  labelStyle={styles.buttonText}
              >
                Modifier Profil
              </Button>
            </View>
            {/* Bouton Supprimer le compte */}
            <View style={styles.buttonRow}>
              <Button
                  mode="contained"
                  onPress={() => {
                    Alert.alert(
                        "Confirmation",
                        "Êtes-vous sûr de vouloir supprimer votre compte ?",
                        [
                          { text: "Annuler", style: "cancel" },
                          { text: "Supprimer", onPress: handleDeleteAccount, style: "destructive" },
                        ]
                    );
                  }}
                  style={[styles.button, styles.deleteButton]}
                  labelStyle={styles.deleteButtonText}
              >
                Supprimer le compte
              </Button>
            </View>

          </View>

          <Portal>
            <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
              <Dialog.Title>Modifier le Profil</Dialog.Title>
              <Dialog.Content>
                <TextInput
                    label="Prénom"
                    value={newFirstName}
                    onChangeText={setNewFirstName}
                    style={styles.input}
                />
                <TextInput
                    label="Nom"
                    value={newLastName}
                    onChangeText={setNewLastName}
                    style={styles.input}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setEditDialogVisible(false)}>Annuler</Button>
                <Button onPress={handleEditProfile}>Sauvegarder</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          {/* Succès affiché en dehors de la carte profil */}
          <SuccessList userId={user.id} />
        </ScrollView>
      </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Fond neutre et clair
    padding: 20,
  },
  block: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff", // Fond blanc et propre pour la carte profil
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    position: "relative",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
  },
  logoutIcon: {
    // Vous pouvez ajuster le style de l'icône ici si besoin
  },
  infoBlock: {
    marginBottom: 10,
    flexDirection: "row",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  value: {
    fontSize: 18,
    color: "#333333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
    marginVertical: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#34495e",
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
});
