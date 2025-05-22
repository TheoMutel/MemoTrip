<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


class ConnexionController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'mot_de_passe' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => "Aucun compte associé à cet e-mail. Veuillez vérifier vos informations."], 401);
        }

        if (!Hash::check($request->mot_de_passe, $user->mot_de_passe)) {
            return response()->json(['error' => "Échec de la connexion. Vérifiez vos informations d'identification."], 401);
        }

        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie !']);
    }


    public function deleteacc(Request $request)
    {
        // Vérifiez si l'utilisateur est authentifié
        $user = Auth::user();

        if ($user) {
            // Suppression du compte client
            $uti = User::find($user->id);

            if ($uti) {
                $uti->delete(); // Supprime l'utilisateur de la base de données
                return response()->json([
                    'message' => 'Compte supprimé avec succès.',
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Compte introuvable.',
                ], 404);
            }
        } else {
            return response()->json([
                'message' => 'Utilisateur non authentifié.',
            ], 401);
        }
    }
    
    public function updateprofile(Request $request)
{
    // Vérifiez si l'utilisateur est authentifié
    $user = Auth::user();

    if (!$user) {
        return response()->json([
            'message' => 'Utilisateur non authentifié.',
        ], 401);
    }

    // Valider les données de la requête
    $request->validate([
        'prenom' => 'required|string|max:255',
        'nom' => 'required|string|max:255',
    ]);

    try {
        // Mettre à jour les informations de l'utilisateur
        $user->prenom = $request->prenom;
        $user->nom = $request->nom;
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $user, // Retournez l'utilisateur mis à jour pour confirmation
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de la mise à jour du profil.',
            'error' => $e->getMessage(),
        ], 500);
    }
}


}