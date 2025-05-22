<?php namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateurs';  // Assurez-vous que le nom de la table est correct

    public $timestamps = false; // Désactive les timestamps si non présents dans ta table

    protected $fillable = [
        'id',
        'prenom',
        'nom',
        'email',
        'mot_de_passe',
        'statut'
    ];

    protected $hidden = [
        'mot_de_passe', // Assurez-vous que le mot de passe ne soit pas visible lors de la sérialisation
    ];

    /**
     * Relation : Un utilisateur a plusieurs photos
     */
    public function photos()
    {
        return $this->hasMany(Photo::class, 'id_uti'); // 'id_uti' est la clé étrangère dans la table photos
    }

    /**
     * Récupérer le mot de passe pour l'authentification
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    /**
     * Mutateur pour hacher le mot de passe
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['mot_de_passe'] = bcrypt($value);
    }
}
