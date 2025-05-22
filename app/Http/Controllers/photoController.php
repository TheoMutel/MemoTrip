<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Photo;
use Illuminate\Support\Facades\Validator;

class PhotoController extends Controller
{
    /**
     * Récupérer les photos entre deux dates.
     *
     * (Méthode index déjà existante)
     */
    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate   = $request->query('end_date');
    
        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Les paramètres start_date et end_date sont obligatoires'], 400);
        }
    
        // Récupérer l'utilisateur connecté
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
    
        try {
            // On ajoute une condition where pour ne récupérer que les photos de l'utilisateur connecté
            $photos = Photo::whereBetween('date', [$startDate, $endDate])
                ->where('id_uti', $user->id)
                ->get(['id', 'path', 'date', 'latitude', 'longitude', 'note', 'id_uti']);
    
            // Transformer le champ 'path' pour inclure l'URL complète
            $photos->transform(function ($photo) {
                $photo->path = asset('images/' . $photo->path);
                return $photo;
            });
    
            if ($photos->isEmpty()) {
                return response()->json(['message' => 'Aucune photo trouvée pour cette période'], 404);
            }
    
            return response()->json($photos, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Une erreur s\'est produite',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    

    /**
     * Stocker une nouvelle photo dans la base de données et dans le dossier public/images.
     *
     * Attend en entrée un fichier 'photo', la date ('date') et éventuellement 'longitude', 'latitude', 'note'
     * et l'identifiant de l'utilisateur ('id_uti').
     */
    public function store(Request $request)
    {
        // Validation des données envoyées
        $validator = Validator::make($request->all(), [
            'photo'    => 'required|image|max:2048', // image et taille maximale de 2MB
            'date'     => 'required|date',
            'longitude'=> 'nullable|numeric',
            'latitude' => 'nullable|numeric',
            'id_uti'   => 'required|integer',  // on attend l'id de l'utilisateur
            'note'     => 'nullable|string',   // note facultative
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error'    => 'Validation error',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            // Récupérer le fichier image
            $file = $request->file('photo');

            // Générer un nom de fichier unique
            $filename = time() . '_' . $file->getClientOriginalName();

            // Déplacer le fichier dans le dossier public/images
            $destinationPath = public_path('images');
            $file->move($destinationPath, $filename);

            // Création de l'enregistrement en base en incluant l'id de l'utilisateur et la note
            $photo = Photo::create([
                'path'      => $filename,
                'date'      => $request->input('date'),
                'longitude' => $request->input('longitude', null),
                'latitude'  => $request->input('latitude', null),
                'id_uti'    => $request->input('id_uti'),
                'note'      => $request->input('note', null),
            ]);

            return response()->json([
                'message' => 'Photo uploadée avec succès',
                'photo'   => $photo
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erreur lors de l\'upload de la photo',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
