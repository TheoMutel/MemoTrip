import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("Utilisateur chargé depuis le stockage, ID :", parsedUser.id);
        }
      } catch (error) {
        console.log("Erreur lors du chargement du stockage :", error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (token, user) => {
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    console.log("Connexion réussie, ID utilisateur :", user.id);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    console.log("Déconnexion effectuée");
  };

  const updateUser = (updatedUser) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUser }));
    console.log("Mise à jour de l'utilisateur :", updatedUser);
  };

  return (
      <AuthContext.Provider
          value={{ user, token, loading, signIn, signOut, updateUser }}
      >
        {children}
      </AuthContext.Provider>
  );
};
