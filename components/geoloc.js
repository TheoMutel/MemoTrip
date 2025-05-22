import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  Share,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { useIsFocused } from '@react-navigation/native';
// Importation du composant Video pour gérer l'affichage des vidéos
import { Video } from 'expo-av';

// Fonction qui calcule la distance entre 2 points (en mètres)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Regrouper les items (photos et vidéos) par proximité (moins de 50 mètres)
const groupPhotosByProximity = (items) => {
  const groups = [];
  items.forEach((item) => {
    const lat = parseFloat(item.latitude);
    const lon = parseFloat(item.longitude);
    let added = false;
    for (let group of groups) {
      const { center } = group;
      const distance = getDistanceFromLatLonInMeters(lat, lon, center.lat, center.lon);
      if (distance < 50) {
        group.photos.push(item);
        // Mise à jour du centre (moyenne)
        const n = group.photos.length;
        group.center.lat = (group.center.lat * (n - 1) + lat) / n;
        group.center.lon = (group.center.lon * (n - 1) + lon) / n;
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push({ center: { lat, lon }, photos: [item] });
    }
  });
  return groups;
};

export default function Geoloc() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  // photoGroups contiendra la fusion groupée des photos et vidéos
  const [photoGroups, setPhotoGroups] = useState([]);
  // Nouveaux états pour stocker les données brutes
  const [rawPhotos, setRawPhotos] = useState([]);
  const [rawVideos, setRawVideos] = useState([]);
  const [showNote, setShowNote] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const mapRef = useRef(null);

  const { user } = useContext(AuthContext);
  const isFocused = useIsFocused();

  // Charger photos et vidéos lorsque l'écran est focus
  useEffect(() => {
    if (user?.id && isFocused) {
      fetchPhotos();
      fetchVideos();
    }
  }, [user, isFocused, refreshTrigger]);

  // Fusionner les photos et vidéos dans un seul tableau et regrouper par proximité
  useEffect(() => {
    const combined = [...rawPhotos, ...rawVideos];
    const groups = groupPhotosByProximity(combined);
    setPhotoGroups(groups);
  }, [rawPhotos, rawVideos]);

  // Gestion de la géolocalisation
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (Platform.OS === 'android' && status !== 'granted') {
        setErrorMsg('Permission for location was denied');
        return;
      }
      const subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (loc) => {
            if (loc && loc.coords) {
              setLocation(loc);
            } else {
              console.warn('Invalid location data received');
            }
          }
      );
      return () => {
        if (subscriber) {
          subscriber.remove();
        }
      };
    })();
  }, []);

  // Récupération des photos
  const fetchPhotos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token récupéré :', token);
      console.log('Utilisateur connecté :', user);
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      const formatDate = (date) => date.toISOString().split('T')[0];
      const startDate = formatDate(lastMonth);
      const endDate = formatDate(today);
      const url = `https://lorieau.alwaysdata.net/memotrip/api/photos?start_date=${startDate}&end_date=${endDate}&timestamp=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRawPhotos(data);
        console.log('Photos:', data);
      } else {
        console.error('Erreur lors de la récupération des photos :', response.status);
        const errorMessage = await response.text();
        console.error('Détails de l\'erreur :', errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Récupération des vidéos
  const fetchVideos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token récupéré :', token);
      console.log('Utilisateur connecté :', user);
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      const formatDate = (date) => date.toISOString().split('T')[0];
      const startDate = formatDate(lastMonth);
      const endDate = formatDate(today);
      // Utilisation de l'endpoint /videos
      const url = `https://lorieau.alwaysdata.net/memotrip/api/videos?start_date=${startDate}&end_date=${endDate}&timestamp=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Pour chaque vidéo, ajouter la propriété isVideo
        data.forEach((video) => {
          video.isVideo = true;
        });
        setRawVideos(data);
        console.log('Vidéos:', data);
      } else {
        console.error('Erreur lors de la récupération des vidéos :', response.status);
        const errorMessage = await response.text();
        console.error('Détails de l\'erreur :', errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Rafraîchissement manuel
  const handleForceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Clic sur un marqueur
  const handleMarkerPress = (group) => {
    setSelectedMarker(group);
    setModalVisible(true);
    setShowNote(false);
    setCurrentIndex(0);
  };

  // Fonction de partage
  const handleShare = async (shareAll = false) => {
    if (!selectedMarker) return;
    try {
      let message = '';
      if (shareAll && selectedMarker.photos.length > 1) {
        message = `Voici ${selectedMarker.photos.length} photos/vidéos :\n`;
        message += selectedMarker.photos.map((p) => p.path).join('\n');
      } else {
        const currentItem = selectedMarker.photos[currentIndex];
        message = `Voici l'élément : ${currentItem.path}`;
      }
      await Share.share({
        title: selectedMarker.photos.length > 1 ? 'Photos/Vidéos' : 'Photo/Vidéo',
        message: message,
      });
    } catch (error) {
      alert('Erreur lors du partage : ' + error.message);
    }
  };

  // Gestion du swipe
  const onViewRef = useRef((viewableItems) => {
    if (viewableItems.viewableItems.length > 0) {
      setCurrentIndex(viewableItems.viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
      <View style={styles.container}>
        {location && location.coords ? (
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
            >
              <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Ma position"
                  pinColor="blue"
              />
              {photoGroups
                  .filter((group) => group.center) // Filtre pour éviter les groupes sans centre
                  .map((group, index) => (
                      <Marker
                          key={index}
                          coordinate={{ latitude: group.center.lat, longitude: group.center.lon }}
                          title={group.photos.length > 1 ? `Photos/Vidéos (${group.photos.length})` : 'Photo/Vidéo'}
                          onPress={() => handleMarkerPress(group)}
                      />
                  ))}
            </MapView>
        ) : (
            <Text>Chargement de la carte...</Text>
        )}
        {errorMsg && <Text>{errorMsg}</Text>}

        <TouchableOpacity style={styles.refreshButton} onPress={handleForceRefresh}>
          <MaterialCommunityIcons name="reload" size={24} color="black" />
        </TouchableOpacity>

        {/* Modal pour plusieurs éléments (full-screen avec swipe) */}
        {modalVisible && selectedMarker && selectedMarker.photos.length > 1 && (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.fullScreenModalContainer}>
                <TouchableOpacity style={styles.shareButtonFullScreen} onPress={() => handleShare(false)}>
                  <MaterialCommunityIcons name="share-variant-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareAllButtonFullScreen} onPress={() => handleShare(true)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="share-all-outline" size={24} color="black" />
                    <Text style={{ marginLeft: 5 }}>All</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noteButtonFullScreen} onPress={() => setShowNote(!showNote)}>
                  <MaterialCommunityIcons name="note-outline" size={24} color="black" />
                </TouchableOpacity>
                <FlatList
                    data={selectedMarker.photos}
                    horizontal
                    pagingEnabled
                    keyExtractor={(item, index) => index.toString()}
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                    renderItem={({ item }) => {
                      if (item.isVideo) {
                        return (
                            <Video
                                source={{ uri: item.path }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                                useNativeControls
                            />
                        );
                      }
                      return (
                          <Image source={{ uri: item.path }} style={styles.fullScreenImage} resizeMode="contain" />
                      );
                    }}
                />
                {showNote && (
                    <View style={styles.noteOverlayFullScreen}>
                      <Text style={styles.noteText}>
                        {selectedMarker.photos[currentIndex]?.note || 'Pas de note'}
                      </Text>
                    </View>
                )}
                {/* Bouton fermer sous forme de croix, centré verticalement à droite */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </Modal>
        )}

        {/* Modal pour un seul élément (petit popup) */}
        {modalVisible && selectedMarker && selectedMarker.photos.length === 1 && (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.fullScreenModalContainer}>
                <TouchableOpacity style={styles.shareButtonFullScreen} onPress={() => handleShare(false)}>
                  <MaterialCommunityIcons name="share-variant-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.noteButtonFullScreen} onPress={() => setShowNote(!showNote)}>
                  <MaterialCommunityIcons name="note-outline" size={24} color="black" />
                </TouchableOpacity>
                <FlatList
                    data={selectedMarker.photos}
                    horizontal
                    pagingEnabled
                    keyExtractor={(item, index) => index.toString()}
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                    renderItem={({ item }) => {
                      if (item.isVideo) {
                        return (
                            <Video
                                source={{ uri: item.path }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                                useNativeControls
                            />
                        );
                      }
                      return (
                          <Image source={{ uri: item.path }} style={styles.fullScreenImage} resizeMode="contain" />
                      );
                    }}
                />
                {showNote && (
                    <View style={styles.noteOverlayFullScreen}>
                      <Text style={styles.noteText}>
                        {selectedMarker.photos[currentIndex]?.note || 'Pas de note'}
                      </Text>
                    </View>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </Modal>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  shareButtonFullScreen: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  shareAllButtonFullScreen: {
    position: 'absolute',
    top: 20,
    left: 70,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  noteButtonFullScreen: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  noteOverlayFullScreen: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  noteText: {
    color: 'white',
    textAlign: 'center',
  },
  // Bouton fermer sous forme de croix, centré verticalement à droite
  closeButton: {
    position: 'absolute',
    right: 20,
    top: '90%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
});
