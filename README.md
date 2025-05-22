# MemoTrip - Application Lucas, Théo, Elias, Clément
## Détail du projet 

Le concept du Journal de voyage immersif est une application mobile qui permet aux utilisateurs de capturer et de documenter leurs voyages de manière interactive et innovante, en intégrant des éléments comme la géolocalisation, l'appareil photo, et le capteur de mouvement. Voici un développement plus détaillé de cette idée :

Fonctionnalités principales :
Prise de photos et vidéos enrichies :

L'application permet de capturer des photos et des vidéos directement, mais avec une touche supplémentaire. Chaque image ou vidéo peut être automatiquement géotaggée avec la localisation exacte, et enrichie avec des informations comme l'altitude, l'heure et d'autres données pertinentes du moment.
Les utilisateurs peuvent ajouter des annotations vocales ou textuelles à leurs photos pour décrire leurs impressions, sans avoir à les taper manuellement.
Carte interactive du voyage :

Une carte interactive montre en temps réel le parcours du voyageur, en traçant leurs déplacements grâce à la géolocalisation. Chaque point sur la carte est un souvenir cliquable, où l'utilisateur peut retrouver les photos, vidéos ou notes prises à cet endroit.
La carte peut également être partagée avec des amis ou la famille en temps réel pour permettre aux autres de suivre l’aventure du voyageur à distance.
Détection de moments clés grâce aux capteurs de mouvement :

L'application détecte certains événements importants du voyage à l'aide du capteur de mouvement du téléphone. Par exemple, lorsqu'un utilisateur grimpe une montagne ou traverse une grande distance, l'application peut générer une notification automatique suggérant de prendre une photo ou d'ajouter une note.
Cela pourrait aussi inclure des notifications intelligentes lors de changements significatifs d'altitude ou de vitesse (par exemple lors de la montée dans un avion ou en montagne).
Création automatique de récits immersifs :

À la fin de chaque journée de voyage, l'application compile automatiquement toutes les photos, vidéos, notes et autres données pour créer un récit interactif. Ce récit est présenté sous forme de journal chronologique, avec des cartes, des galeries multimédias et des statistiques de voyage (distance parcourue, dénivelé, etc.).
Les utilisateurs peuvent éditer ces récits pour ajouter des détails ou supprimer des éléments, puis les partager sous forme de liens ou de PDF interactifs.
Mode hors-ligne avec synchronisation automatique :

L'application inclut un mode hors-ligne pour les endroits où l'accès à Internet est limité. Les utilisateurs peuvent continuer à documenter leur voyage, et les données se synchronisent automatiquement dès qu'une connexion est rétablie.
Statistiques personnelles et souvenirs personnalisés :

L'application propose des statistiques de voyage personnalisées, telles que le nombre de pays ou de villes visités, la distance parcourue à pied, en vélo, en voiture, etc.
Elle peut aussi proposer des fonctionnalités de souvenirs personnalisés : après un certain nombre de voyages ou une période prolongée, l'utilisateur reçoit un résumé annuel de ses voyages sous forme de livre numérique ou vidéo, retraçant ses aventures passées.
Exploration et recommandations locales :

Grâce à la géolocalisation, l'application peut suggérer des lieux d'intérêt ou des activités à proximité en fonction de la position actuelle de l'utilisateur et de leurs préférences enregistrées (gastronomie, randonnées, culture, etc.).
L'application pourrait intégrer des partenariats avec des guides locaux ou des recommandations touristiques pour proposer des activités authentiques.
Partage et réseau social de voyageurs :

En plus de créer un journal privé, les utilisateurs peuvent partager leurs récits et moments marquants avec une communauté de voyageurs. Ils peuvent découvrir d'autres journaux et s'inspirer des aventures d'autres utilisateurs pour planifier leurs prochains voyages.
Un système de badges ou de succès pourrait récompenser les utilisateurs pour certaines actions (visiter un certain nombre de pays, accomplir un défi de randonnée, etc.).
Intégration des souvenirs tangibles :

L’application pourrait aussi collaborer avec des services de création de souvenirs physiques : par exemple, après un voyage, les utilisateurs pourraient commander des livres photo personnalisés directement depuis l'application, ou imprimer des cartes postales de leurs souvenirs les plus marquants.

## Bête à cornes
<img src="Graphique Bête à cornes Architecture Moderne Bleu.png"/>

## Documentation Développeur

### Introduction
Application de journal de voyage immersive combinant géolocalisation, multimédia enrichi et détection contextuelle.

### Prérequis
Pour configurer l'environnement de développement, il vous faut :
- Node.js (version 16 ou plus) - https://nodejs.org/
- Expo CLI installé globalement via npm ou yarn :

Avec NPM :
```
npm install -g expo-cli
```
Avec Yarn :
```
yarn global add expo-cli
```

### Installation
Pour cloner le dépôt et installer les dépendances :
```
git clone 
https://github.com/mmicastres/2024-25-sae501-lucas_clement_elias_theo.git
```

```
cd 2024-25-sae501-lucas_clement_elias_theo
git checkout ReactNative-Expo
npm install
```

### Démarrage du projet
Pour lancer l'application en mode développement :
```
expo start
```
Options pour visualiser l'application :
- Sur un appareil physique : Utilisez l'application Expo Go disponible sur iOS et Android.
- Sur un émulateur : Configurez des émulateurs Android ou iOS.

### Utilisation des bibliothèques tierces
Voici les modules utilisés avec un lien vers leur documentation :

- **React et React Native** : Structure de base de l'application. https://react.dev/ et https://reactnative.dev/
- **React Native Paper** : Pour les composants UI. https://callstack.io/react-native-paper
- **React Navigation** : Pour la navigation entre les écrans. https://reactnavigation.org/
- **Expo** : Accès aux fonctionnalités natives comme la caméra, la géolocalisation et la bibliothèque multimédia. https://expo.dev/
- **AsyncStorage** : Pour le stockage local. https://react-native-async-storage.github.io/async-storage/docs/
- **React Native Maps** : Pour les cartes. https://reactnative-maps.com/
- **React Native Gesture Handler & Reanimated** : Pour les gestes et animations. https://mrousavy.com/react-native-gesture-handler/docs/
- **Vector Icons** : Pour les icônes. https://react-native-vector-icons.github.io/react-native-vector-icons/

### Déploiement
Pour créer une version de production avec eas :
```
npm install --global eas-cli //installer eas
eas build --platform android //build pour android
eas build --platform ios //build pour ios
```
Suivez ensuite les instructions pour publier sur les magasins d'applications.

## Contributeurs
- Lucas 
- Théo
- Elias
- Clément

### Déploiement

Fournissez des instructions pour déployer l'application. Par exemple, comment créer une build de production avec Expo et publier l'application sur les stores d'applications.

<a href="https://expo.dev/accounts/livretag/projects/MemoTrip/builds/caf81725-6a9e-45c4-a502-f9a4efaa3d52" target="_blank">Download APK Android </a>
ALERTE : Ne pas trop faire de photos ou relancer la map car api payante SDK plateform google si on dépasse les 200$/mois de crédits disponibles
