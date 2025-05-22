<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;


class UtilisateurController extends Controller
{
    public function getprofil($id)
    {
        // Récupère l'utilisateur par son ID
        $utilisateur = DB::table('utilisateurs')->where('id', $id)->first();

        if ($utilisateur) {
            return response()->json($utilisateur);
        } else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }

    public function getUserSuccess($user_id)
{
    // Vérifier si l'utilisateur existe
    $user = User::with('photos')->find($user_id);

    if (!$user) {
        return response()->json(['error' => 'Utilisateur non trouvé'], 404);
    }

    // Récupérer le nombre de photos de l'utilisateur
    $photoCount = $user->photos->count();

    // Liste des succès avec leur seuil
    $successList = [
        ["title" => "Débutant", "threshold" => 5],
        ["title" => "Amateur", "threshold" => 10],
        ["title" => "Pro", "threshold" => 20],
        ["title" => "Expert", "threshold" => 50],
        ["title" => "Légende", "threshold" => 100]
    ];

    // Vérifier les succès débloqués
    $unlockedSuccess = array_map(function ($success) use ($photoCount) {
        return [
            "title" => $success["title"],
            "unlocked" => $photoCount >= $success["threshold"]
        ];
    }, $successList);

    // Retourner à la fois le nombre d'images et la liste des succès
    return response()->json([
        "photoCount" => $photoCount,
        "success"    => $unlockedSuccess
    ]);
}

}
