<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Video;
use Illuminate\Support\Facades\Validator;

class VideoController extends Controller
{
    /**
     * Récupérer les vidéos entre deux dates.
     *
     * (La méthode index fonctionne de la même manière que pour les photos)
     */
    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate   = $request->query('end_date');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Les paramètres start_date et end_date sont obligatoires'], 400);
        }

        try {
            $videos = Video::whereBetween('date', [$startDate, $endDate])
                ->get(['id', 'path', 'date', 'latitude', 'longitude', 'note', 'id_uti']);

            // Transformer le champ 'path' pour inclure l'URL complète
            $videos->transform(function ($video) {
                $video->path = asset('videos/' . $video->path);
                return $video;
            });

            if ($videos->isEmpty()) {
                return response()->json(['message' => 'Aucune vidéo trouvée pour cette période'], 404);
            }

            return response()->json($videos, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Une erreur s\'est produite',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Stocker une nouvelle vidéo dans la base de données et dans le dossier public/videos.
     *
     * Attente en entrée :
     * - un fichier 'video'
     * - la date ('date')
     * - éventuellement 'longitude', 'latitude', 'note'
     * - l'identifiant de l'utilisateur ('id_uti')
     */
    public function store(Request $request)
    {
        // Validation des données envoyées
        $validator = Validator::make($request->all(), [
            'video'     => 'required|mimetypes:video/mp4,video/quicktime|max:20480', // taille max de 20MB (à adapter si nécessaire)
            'date'      => 'required|date',
            'longitude' => 'nullable|numeric',
            'latitude'  => 'nullable|numeric',
            'id_uti'    => 'required|integer',
            'note'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error'    => 'Validation error',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            // Récupérer le fichier vidéo
            $file = $request->file('video');

            // Générer un nom de fichier unique
            $filename = time() . '_' . $file->getClientOriginalName();

            // Déplacer le fichier dans le dossier public/videos
            $destinationPath = public_path('videos');
            $file->move($destinationPath, $filename);

            // Création de l'enregistrement en base de données
            $video = Video::create([
                'path'      => $filename,
                'date'      => $request->input('date'),
                'longitude' => $request->input('longitude', null),
                'latitude'  => $request->input('latitude', null),
                'id_uti'    => $request->input('id_uti'),
                'note'      => $request->input('note', null),
            ]);

            return response()->json([
                'message' => 'Vidéo uploadée avec succès',
                'video'   => $video
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erreur lors de l\'upload de la vidéo',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
