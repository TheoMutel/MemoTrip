class User {
    constructor(id, prenom, nom, email, mot_de_passe, statut) {
        this._id = id;
        this._prenom = prenom;
        this._nom = nom;
        this._email = email;
        this._mot_de_passe = mot_de_passe;
        this._statut = statut;
    }

    toJSON() {
        return {
            id: this._id,
            prenom: this._prenom,
            nom: this._nom,
            email: this._email,
            mot_de_passe: this._mot_de_passe,
            statut: this._statut,
        };
    }
}

export default User;
