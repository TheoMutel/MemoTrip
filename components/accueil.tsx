import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Button,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    TextInput,
    Platform,
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Accueil(): JSX.Element {
    // État pour la caméra (avant/arrière)
    const [facing, setFacing] = useState<CameraType>('back');
    // État pour le mode de la caméra : "picture" ou "video"
    const [cameraMode, setCameraMode] = useState<'picture' | 'video'>('picture');
    // État pour le flash, on bascule ici entre 'off' et 'on'
    const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
    // État pour le zoom (valeur entre 0 et 1)
    const [zoom, setZoom] = useState<number>(0);

    // Permissions pour la caméra et la galerie
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    // Référence vers la caméra
    const cameraRef = useRef<any>(null);

    // États pour la gestion de la note et de l'URI du média actuel (photo ou vidéo)
    const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
    const [photoNote, setPhotoNote] = useState<string>('');
    const [currentMediaUri, setCurrentMediaUri] = useState<string>('');
    // Pour distinguer entre photo et vidéo
    const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

    // Nouvel état pour gérer l'enregistrement vidéo
    const [isRecording, setIsRecording] = useState<boolean>(false);
    // Nouvel état pour stocker les coordonnées récupérées lors de l'enregistrement vidéo
    const [mediaCoordinates, setMediaCoordinates] = useState<{ longitude: number, latitude: number } | null>(null);

    // Demande de permission micro sur Android
    useEffect(() => {
        if (Platform.OS === 'android') {
            (async () => {
                const { status } = await Camera.requestMicrophonePermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert("Erreur", "La permission d'utiliser le micro est nécessaire pour enregistrer des vidéos.");
                }
            })();
        }
    }, []);

    // Vérification des permissions
    if (!cameraPermission) {
        return <View />;
    }
    if (!cameraPermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.message}>
                    Nous avons besoin de la permission d'accéder à la caméra.
                </Text>
                <Button title="Donner la permission" onPress={requestCameraPermission} />
            </View>
        );
    }
    /*if (!mediaPermission || !mediaPermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.message}>
                    Nous avons besoin de la permission d'accéder à la galerie.
                </Text>
                <Button title="Donner la permission" onPress={requestMediaPermission} />
            </View>
        );
    }*/

    // Fonction pour basculer entre la caméra arrière et avant
    const toggleCamera = (): void => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    // Fonction pour basculer le flash
    const toggleFlash = (): void => {
        setFlashMode(current => current === 'off' ? 'on' : 'off');
    };

    // Fonctions pour zoomer et dézoomer via les boutons
    const zoomIn = (): void => {
        setZoom(prev => Math.min(prev + 0.1, 1));
    };

    const zoomOut = (): void => {
        setZoom(prev => Math.max(prev - 0.1, 0));
    };

    // Capture de la photo (mode "picture") et affichage du modal pour ajouter une note
    const takePhoto = async (): Promise<void> => {
        if (cameraMode !== 'picture') {
            setCameraMode('picture');
        }
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: false,
                });
                setCurrentMediaUri(photo.uri);
                setMediaType('photo');
                setShowNoteModal(true);
            } catch (error) {
                console.error('Erreur lors de la prise de photo :', error);
                Alert.alert('Erreur', 'Impossible de prendre la photo.');
            }
        }
    };

    // Démarrer l'enregistrement vidéo (mode "video")
    const onRecord = async (): Promise<void> => {
        if (!cameraRef.current) return;
        setCameraMode('video');
        setTimeout(async () => {
            setIsRecording(true);
            try {
                const options = { quality: '720p', maxDuration: 60 };
                const video = await cameraRef.current.recordAsync(options);
                await MediaLibrary.createAssetAsync(video.uri);
                const locationData = await Location.getCurrentPositionAsync({});
                setMediaCoordinates({
                    longitude: locationData.coords.longitude,
                    latitude: locationData.coords.latitude,
                });
                setCurrentMediaUri(video.uri);
                setMediaType('video');
                setShowNoteModal(true);
            } catch (error) {
                console.error('Erreur lors de l’enregistrement vidéo', error);
                Alert.alert('Erreur', 'Impossible d’enregistrer la vidéo');
                setIsRecording(false);
                setCameraMode('picture');
            }
        }, 500);
    };

    // Arrêter l'enregistrement vidéo
    const stopRecord = (): void => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
            setIsRecording(false);
            console.log('Recording stopped');
        }
    };

    // Fonction utilitaire pour formater la date au format MySQL "YYYY-MM-DD HH:MM:SS"
    const getFormattedDate = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Sauvegarde du média (photo ou vidéo) en galerie et envoi à l'API avec ses métadonnées
    const saveMediaWithNote = async (): Promise<void> => {
        try {
            await MediaLibrary.createAssetAsync(currentMediaUri);

            let longitude = 0;
            let latitude = 0;
            if (mediaType === 'video' && mediaCoordinates) {
                longitude = mediaCoordinates.longitude;
                latitude = mediaCoordinates.latitude;
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    longitude = location.coords.longitude;
                    latitude = location.coords.latitude;
                } else {
                    console.log("Permission de localisation non accordée");
                }
            }

            const formattedDate = getFormattedDate();

            const storedUser = await AsyncStorage.getItem("user");
            if (!storedUser) {
                Alert.alert("Erreur", "Utilisateur non authentifié");
                return;
            }
            const userObj = JSON.parse(storedUser);
            const userId = userObj.id;
            if (!userId) {
                Alert.alert("Erreur", "ID utilisateur manquant");
                return;
            }

            const formData = new FormData();
            const filename = currentMediaUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename!);
            const fileType = match
                ? (mediaType === "photo" ? `image/${match[1]}` : `video/${match[1]}`)
                : (mediaType === "photo" ? "image" : "video");

            if (mediaType === "photo") {
                formData.append('photo', {
                    uri: currentMediaUri,
                    name: filename,
                    type: fileType,
                } as any);
            } else {
                formData.append('video', {
                    uri: currentMediaUri,
                    name: filename,
                    type: fileType,
                } as any);
            }

            if (photoNote && photoNote.trim().length > 0) {
                formData.append('note', photoNote);
            }
            formData.append('date', formattedDate);
            formData.append('longitude', String(longitude));
            formData.append('latitude', String(latitude));
            formData.append('id_uti', String(userId));

            const token = await AsyncStorage.getItem("token");
            const endpoint = mediaType === "photo"
                ? "https://lorieau.alwaysdata.net/memotrip/api/photos"
                : "https://lorieau.alwaysdata.net/memotrip/api/videos";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Succès', mediaType === "photo" ? 'Photo enregistrée !' : 'Vidéo enregistrée !');
            } else {
                const errorText = await response.text();
                console.error("Erreur lors de l'upload :", response.status, errorText);
                Alert.alert('Erreur', `L'upload de la ${mediaType === "photo" ? "photo" : "vidéo"} a échoué`);
            }

            setShowNoteModal(false);
            setPhotoNote('');
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', "Échec de l'enregistrement");
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <PinchGestureHandler>
                <Animated.View style={{ flex: 1 }}>
                    <CameraView
                        style={styles.camera}
                        facing={facing}
                        ref={cameraRef}
                        mode={cameraMode}
                        videoQuality="480p"
                        flash={flashMode}
                        zoom={zoom}
                    >
                        <TouchableOpacity style={styles.switchButton} onPress={toggleCamera}>
                            <Text style={styles.text}>🔄</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                            <MaterialCommunityIcons
                                name={flashMode === 'on' ? "flash" : "flash-off"}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        {/* Bouton de capture photo */}
                        <TouchableOpacity style={styles.captureButton} onPress={takePhoto} />
                        {/* Bouton d'enregistrement vidéo */}
                        <TouchableOpacity
                            style={[styles.videoButton, isRecording && styles.videoButtonRecording]}
                            onPress={isRecording ? stopRecord : onRecord}
                        >
                            <MaterialCommunityIcons
                                name={isRecording ? "stop" : "video"}
                                size={30}
                                color={isRecording ? "white" : "black"}
                            />
                        </TouchableOpacity>
                        {/* Boutons de zoom côte à côte, centrés verticalement par rapport au bouton de capture */}
                        <View style={styles.zoomContainer}>
                            <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
                                <MaterialCommunityIcons name="magnify-plus" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
                                <MaterialCommunityIcons name="magnify-minus" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </Animated.View>
            </PinchGestureHandler>

            <Modal
                visible={showNoteModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowNoteModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajouter une note (facultatif)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Écrivez votre note ici..."
                            multiline
                            numberOfLines={4}
                            value={photoNote}
                            onChangeText={setPhotoNote}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowNoteModal(false)}
                            >
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={saveMediaWithNote}>
                                <Text style={styles.buttonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    message: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 16,
        color: 'white',
    },
    camera: {
        flex: 1,
    },
    switchButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 12,
        borderRadius: 25,
    },
    flashButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 12,
        borderRadius: 25,
    },
    captureButton: {
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: [{ translateX: -35 }],
        width: 70,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 35,
        borderWidth: 3,
        borderColor: 'gray',
    },
    videoButton: {
        position: 'absolute',
        bottom: 100,
        left: 40,
        width: 70,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 35,
        borderWidth: 3,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoButtonRecording: {
        backgroundColor: 'red',
    },
    zoomContainer: {
        // Nous positionnons ce conteneur pour qu'il soit centré verticalement par rapport au bouton de capture
        position: 'absolute',
        bottom: 100 , // captureButton bottom + half de sa hauteur = 100 + 35 = 135
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ translateY: -12 }], // Ajustez ce décalage selon la hauteur réelle de vos boutons
    },
    zoomButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 8,
        marginLeft: 5,
        borderRadius: 25,
    },
    text: {
        color: 'white',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        minHeight: 100,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: 'red',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
    },
    saveButton: {
        backgroundColor: '#00008B',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
});
