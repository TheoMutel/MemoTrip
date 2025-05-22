<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;

    protected $table = 'photos';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'path',  
        'date',   
        'longitude',
        'latitude',
        'note',
        'id_uti', // Ajout de la clé étrangère de l'utilisateur
    ];

    /**
     * Relation : Une photo appartient à un utilisateur
     */
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'id_uti'); // 'id_uti' est la clé étrangère
    }
}
