import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { View, ActivityIndicator } from 'react-native';
import ConnexionView from '../screens/connexionview';
import ProfilView from '../screens/profilview';

const ProtectedProfil = (props) => {
    const { user } = useContext(AuthContext);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Simuler un délai pour vérifier l'état de l'utilisateur
        setTimeout(() => {
            setIsCheckingAuth(false);
        }, 1000);
    }, []);

    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return user ? <ProfilView {...props} /> : <ConnexionView {...props} />;
};

export default ProtectedProfil;
