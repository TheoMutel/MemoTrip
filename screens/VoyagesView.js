import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// Ajout de l'import pour le composant Video
import { Video } from "expo-av";

const VoyagesView = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  // Les photos récupérées (pour les statistiques et le récit)
  const [photos, setPhotos] = useState([]);
  // Nouveaux états pour les vidéos et la fusion des médias
  const [videos, setVideos] = useState([]);
  const [media, setMedia] = useState([]);
  const [distances, setDistances] = useState([]);
  const [stats, setStats] = useState({ totalDistance: 0, averageDistance: 0 });
  const [travelStory, setTravelStory] = useState("");

  // Calcule la distance entre deux points (en km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (
      typeof lat1 !== "number" ||
      typeof lon1 !== "number" ||
      typeof lat2 !== "number" ||
      typeof lon2 !== "number"
    ) {
      console.error("Valeurs invalides pour le calcul des distances :", {
        lat1,
        lon1,
        lat2,
        lon2,
      });
      return 0;
    }
    const R = 6371; // Rayon de la Terre en kilomètres
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // en km
  };

  const processDistances = (photos) => {
    let totalDistance = 0;
    const calculatedDistances = [];
    for (let i = 1; i < photos.length; i++) {
      const prevPhoto = photos[i - 1];
      const currentPhoto = photos[i];
      const lat1 = parseFloat(prevPhoto.latitude);
      const lon1 = parseFloat(prevPhoto.longitude);
      const lat2 = parseFloat(currentPhoto.latitude);
      const lon2 = parseFloat(currentPhoto.longitude);
      if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error("Valeurs invalides pour le calcul des distances :", {
          lat1,
          lon1,
          lat2,
          lon2,
        });
        continue;
      }
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      calculatedDistances.push(distance);
      totalDistance += distance;
    }
    setDistances(calculatedDistances);
    setStats({
      totalDistance: totalDistance,
      averageDistance: calculatedDistances.length
        ? totalDistance / calculatedDistances.length
        : 0,
    });
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  // Fonction pour récupérer les photos
  const fetchPhotos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token récupéré :", token);
      if (!token) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      const formatDate = (date) => date.toISOString().split("T")[0];
      const startDateStr = formatDate(lastMonth);
      const endDateStr = formatDate(today);
      const response = await fetch(
        `https://lorieau.alwaysdata.net/memotrip/api/photos?start_date=${startDateStr}&end_date=${endDateStr}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("Données API photos reçues :", data);
      if (data && data.length > 0) {
        setPhotos(data);
        processDistances(data);
        const story = await generateTravelStoryWithAI(data);
        setTravelStory(story);
      } else {
        Alert.alert("Aucune photo trouvée", "Aucune photo pour cette période.");
        setPhotos([]);
        setDistances([]);
        setStats({ totalDistance: 0, averageDistance: 0 });
        setTravelStory("");
      }
    } catch (error) {
      console.error("Erreur API photos :", error.message);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les photos. Vérifiez la console."
      );
    }
  };

  // Fonction pour récupérer les vidéos
  const fetchVideos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token récupéré (vidéos) :", token);
      if (!token) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      const formatDate = (date) => date.toISOString().split("T")[0];
      const startDateStr = formatDate(lastMonth);
      const endDateStr = formatDate(today);
      const response = await fetch(
        `https://lorieau.alwaysdata.net/memotrip/api/videos?start_date=${startDateStr}&end_date=${endDateStr}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("Données API vidéos reçues :", data);
      if (data && data.length > 0) {
        // Ajouter la propriété isVideo à chaque vidéo
        data.forEach((video) => {
          video.isVideo = true;
        });
        setVideos(data);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Erreur API vidéos :", error.message);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les vidéos. Vérifiez la console."
      );
    }
  };

  // Fusionner photos et vidéos dans un seul tableau (pour affichage)
  useEffect(() => {
    setMedia([...photos, ...videos]);
  }, [photos, videos]);

  // Fonction de génération du récit (inchangée)
  const createTravelStoryPrompt = (photos) => {
    const coordinatesList = photos
      .map(
        (photo, index) =>
          `Étape ${index + 1}: ${photo.latitude}, ${photo.longitude}`
      )
      .join("\n");
    return `[CONSIGNES ABSOLUES - RÉPONSE EN FRANÇAIS UNIQUEMENT]
      1. Langue : Français littéraire impératif (tu seras pénalisé sinon)
      2. Format : 5 phrases maximum, ponctuation française correcte
      3. Structure narrative :
         "L'aventure débute...[contexte géographique]
         Au [moment], [paysage/action]...
         [Élément inattendu/transition]...
         [Émotion forte/rencontre]...
         [Conclusion métaphorique]"
    
      4. Contraintes techniques :
         → Utiliser des termes géographiques français (lacustre, chaume, etc.)
         → Verbes de mouvement variés (serpenter, dévaler, s'enfoncer)
         → Comparaisons culturelles françaises ("tel un vin...", "comme chez Pagnol...")
    
      5. Données GPS à interpréter :
      ${coordinatesList}
    
      6. Style : 
      "Votre périple épouse les courbes...[description imagée]
      Soudain...[élément de surprise]
      Le crépuscule vous surprend...[émotion]
      Ces paysages composent...[métaphore filée]"
    
      7. INTERDICTIONS :
      - Mots anglais
      - Termes techniques
      - Listes à puces
      - Mention des coordonnées GPS
      - Dépasser 120 mots
      `;
  };

  const generateTravelStoryWithAI = async (photos) => {
    const prompt = createTravelStoryPrompt(photos);
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer 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`,
          },
        }
      );
      const fullText = response.data[0].generated_text;
      const story = fullText.replace(prompt, "").trim();
      return story || "Impossible de générer le récit pour ces coordonnées";
    } catch (error) {
      console.error("Erreur lors de la génération du récit :", error);
      return "Une erreur est survenue lors de la génération du récit.";
    }
  };

  return (
    <FlatList
      contentContainerStyle={styles.scrollContainer}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          {/* Section de sélection de dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plage de dates</Text>
            <View style={styles.dateSelection}>
              <View style={styles.dateButtonContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={styles.buttonText}>Choisir date de départ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.buttonText}>Choisir date de retour</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datesDisplay}>
                <Text style={styles.dateLabel}>
                  📅 Début : {startDate.toLocaleDateString("fr-FR")}
                </Text>
                <Text style={styles.dateLabel}>
                  📅 Fin : {endDate.toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </View>
            <View style={styles.pickersContainer}>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={onStartDateChange}
                  locale="fr-FR"
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="spinner"
                  onChange={onEndDateChange}
                  locale="fr-FR"
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={async () => {
                await fetchPhotos();
                await fetchVideos();
              }}
            >
              <Text style={styles.searchButtonText}>
                🔍 Rechercher les photos et vidéos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section des statistiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques du voyage</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statsItem}>
                🛣️ Distance totale:
                <Text style={styles.highlight}>
                  {" "}
                  {stats.totalDistance.toFixed(2)} km
                </Text>
              </Text>
              <Text style={styles.statsItem}>
                📏 Distance moyenne:
                <Text style={styles.highlight}>
                  {" "}
                  {stats.averageDistance.toFixed(2)} km
                </Text>
              </Text>
            </View>
          </View>

          {/* Affichage du récit généré */}
          {travelStory && (
            <View style={styles.storyContainer}>
              <Text style={styles.storyTitle}>Récit du Voyage</Text>
              <Text style={styles.storyText}>{travelStory}</Text>
            </View>
          )}

          <Text style={styles.resultsTitle}>
            Résultats des photos/vidéos ({media.length})
          </Text>
        </View>
      }
      // Utiliser le tableau fusionné de photos et vidéos
      data={media}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      renderItem={({ item }) => (
        <View style={styles.photoCard}>
          {item.isVideo ? (
            <Video
              source={{ uri: item.path }}
              style={styles.image}
              useNativeControls
              resizeMode="cover"
            />
          ) : (
            <Image
              source={{ uri: item.path }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <Text style={styles.photoNote}>
            {item.note ? ` Notes : ${item.note}` : "Pas encore de notes."}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            ❌ Aucune photo ou vidéo trouvée pour cette période
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  headerContainer: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  dateSelection: {
    marginVertical: 10,
  },
  dateButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: "#34495E",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  datesDisplay: {
    marginVertical: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: "#34495e",
    marginVertical: 5,
  },
  pickersContainer: {
    marginVertical: 10,
  },
  searchButton: {
    backgroundColor: "#2ECC71",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  statsContainer: {
    marginTop: 10,
  },
  statsItem: {
    fontSize: 16,
    color: "#2c3e50",
    marginVertical: 8,
  },
  highlight: {
    color: "#F4D03F",
    fontWeight: "600",
  },
  storyContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#34495e",
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginVertical: 15,
    paddingLeft: 10,
  },
  photoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  photoNote: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 12,
    textAlign: "right",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#FF6F61",
    fontSize: 16,
  },
});

export default VoyagesView;
