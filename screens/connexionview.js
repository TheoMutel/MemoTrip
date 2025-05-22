import React from 'react';
import Connexion from "../components/connexion";

export default function ConnexionView(props) {
    const { message } = props.route.params || {};
    console.log({ message } )// Récupère le message de la navi
    return (
        <Connexion monmessage={message} {...props}/>
    );
}


