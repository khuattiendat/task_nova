<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'assigned_to',
        'assigned_by',
    ];

    // Liên kết đến user được giao task
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Liên kết đến user đã giao task
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
