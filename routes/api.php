<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\ConnexionController;
use App\Http\Controllers\photoController;
use App\Http\Controllers\videoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [InscriptionController::class, 'register']);
Route::post('login', [ConnexionController::class, 'login']);
Route::post('logout', [ConnexionController::class, 'logout'])->middleware('auth:sanctum');
Route::post('deleteacc', [ConnexionController::class, 'deleteacc'])->middleware('auth:sanctum');
Route::post('updateprofile', [ConnexionController::class, 'updateprofile'])->middleware('auth:sanctum');
Route::get('/user/{id}', [UtilisateurController::class, 'getprofil']);


// Nouvelle route pour récupérer les photos entre deux dates
Route::get('/photos', [PhotoController::class, 'index'])->middleware('auth:sanctum');
Route::post('/photos', [PhotoController::class, 'store'])->middleware('auth:sanctum');

// Pour les vidéos
Route::get('/videos', [VideoController::class, 'index'])->middleware('auth:sanctum');
Route::post('/videos', [VideoController::class, 'store'])->middleware('auth:sanctum');

//route succès
Route::get('/success/{user_id}', [UtilisateurController::class, 'getUserSuccess']);



