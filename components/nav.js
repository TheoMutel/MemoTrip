import React, { useContext } from "react";
import {
    CommonActions,
    NavigationContainer,
    useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, AuthContext } from "./AuthContext";
import ConnexionView from "../screens/connexionview";
import InscriptionView from "../screens/inscriptionview";
import AccueilView from "../screens/accueilview";
import GeolocView from "../screens/geolocview";
import ProtectedProfil from "./ProtectedProfil";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
    Image,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import logo from "../assets/logo.png";
import { Button, Text } from "react-native-paper";
import { BlurView } from "expo-blur";
import VoyagesView from "../screens/VoyagesView";

const { height: screenHeight } = Dimensions.get("window");
const headerHeight = screenHeight * 0.1;
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MyLogo() {
    return (
        <SafeAreaView
            style={{ height: "100%", justifyContent: "center", marginLeft: 15 }}
        >
            <Image
                style={{ height: 60, width: 60, marginLeft: 15 }}
                source={logo}
                resizeMode="cover"
            />
        </SafeAreaView>
    );
}

function HeaderRightButton({ user }) {
    const navigation = useNavigation();

    if (user) {
        return (
            <TouchableOpacity onPress={() => navigation.navigate("Profil")}>
                <Text style={{ color: "black", marginRight: 10 }}>{user.prenom}</Text>
            </TouchableOpacity>
        );
    } else {
        return (
            <Button
                mode="text"
                onPress={() => {
                    // Navigation directe vers la route "Connexion" dans le stack courant
                    navigation.navigate("Connexion");
                }}
                buttonColor="#34495E"
                textColor="white"
                style={{ marginRight: 10 }}
            >
                Connexion
            </Button>
        );
    }
}

function Accueil({ navigation }) {
    const { user } = useContext(AuthContext);
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: "black", // Texte en noir
                headerStyle: {
                    backgroundColor: "rgba(200, 200, 200, 0.5)",
                    alignItems: "center",
                },
                headerTitleAlign: "center",
                headerShown: true,
                headerRight: () => <HeaderRightButton user={user} />,
            }}
        >
            <Stack.Screen
                name="Accueil"
                component={AccueilView}
                options={{ headerLeft: () => <MyLogo /> }}
            />
            <Stack.Screen name="Connexion" component={ConnexionView} />
            <Stack.Screen name="Inscription" component={InscriptionView} />
        </Stack.Navigator>
    );
}

function Geoloc({ navigation }) {
    const { user } = useContext(AuthContext);
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: "black",
                headerStyle: { backgroundColor: "rgba(200, 200, 200, 0.5)" },
                headerTitleAlign: "center",
                headerRight: () => <HeaderRightButton user={user} />,
            }}
        >
            <Stack.Screen
                name="Localiser"
                component={GeolocView}
                options={{ headerLeft: () => <MyLogo /> }}
            />
            <Stack.Screen name="Connexion" component={ConnexionView} />
            <Stack.Screen name="Inscription" component={InscriptionView} />
        </Stack.Navigator>
    );
}

function Profil({ navigation }) {
    const { user } = useContext(AuthContext);
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: "black",
                headerStyle: { backgroundColor: "rgba(200, 200, 200, 0.5)" },
                headerTitleAlign: "center",
                headerRight: () => <HeaderRightButton user={user} />,
            }}
        >
            <Stack.Screen
                name="Profil"
                component={ProtectedProfil}
                options={{ headerLeft: () => <MyLogo /> }}
            />
            <Stack.Screen name="Connexion" component={ConnexionView} />
            <Stack.Screen name="Inscription" component={InscriptionView} />
            <Stack.Screen name="Voyages" component={VoyagesView} />
        </Stack.Navigator>
    );
}

const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <BlurView
            intensity={50}
            tint="light"
            style={[styles.tabBar, { backgroundColor: "rgba(200, 200, 200, 0.5)" }]}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel || route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const iconName =
                    route.name === "Accueil"
                        ? "camera"
                        : route.name === "Localiser"
                            ? "map-marker"
                            : "account";

                return (
                    <TouchableOpacity
                        key={route.name}
                        onPress={onPress}
                        style={styles.tabButton}
                    >
                        <MaterialCommunityIcons
                            name={iconName}
                            size={24}
                            color={isFocused ? "#34495E" : "#2E2E2E"}
                        />
                        <Text
                            style={{
                                color: isFocused ? "#34495E" : "#2E2E2E",
                                fontSize: 12,
                                fontFamily: isFocused ? "Montserrat" : "Open Sans",
                            }}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </BlurView>
    );
};

export default function Nav() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Tab.Navigator
                    initialRouteName="Accueil"
                    screenOptions={{
                        headerShown: false,
                    }}
                    tabBar={(props) => <CustomTabBar {...props} />}
                >
                    <Tab.Screen name="Accueil" component={Accueil} />
                    <Tab.Screen name="Localiser" component={Geoloc} />
                    <Tab.Screen name="Profil" component={Profil} />
                </Tab.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        position: "absolute",
        bottom: 10,
        left: 50,
        right: 50,
        height: 70,
        borderRadius: 50,
        overflow: "hidden",
        backgroundColor: "rgba(200, 200, 200, 0.5)",
    },
    tabButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
