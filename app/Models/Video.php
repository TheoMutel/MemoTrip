<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $table = 'videos';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'path',
        'date',
        'longitude',
        'latitude',
        'note',
        'id_uti', // Clé étrangère de l'utilisateur
    ];

    /**
     * Relation : Une vidéo appartient à un utilisateur.
     */
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'id_uti');
    }
}
