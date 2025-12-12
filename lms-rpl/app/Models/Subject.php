<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'name', 'code', 'type'];

    // Accessor (Opsional): Untuk konversi tipe ke label yang enak dibaca
    public function getTypeLabelAttribute()
    {
        return $this->type === 'vocational' ? 'Kejuruan (Produktif)' : 'Muatan Umum';
    }
}