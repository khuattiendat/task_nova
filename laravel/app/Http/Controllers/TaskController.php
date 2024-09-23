<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TaskController extends Controller
{

    public function __construct()
    {
        // $this->middleware('auth.jwt');
    }

    public function store(Request $request)
    {

        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized. Access token is invalid or missing.'], 401);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'required|exists:users,id',
            'subscription' => 'required|array',
        ]);


        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'assigned_by' => auth()->id(),
            'assigned_to' => $validated['assigned_to'],
        ]);

        $user = User::find($validated['assigned_to']);
        $user->notify(new TaskAssignedNotification($task));
        http::post('http://localhost:8080/send-notification', $validated['subscription']);
        return response()->json(['message' => 'Task assigned successfully!',
        ]);
    }

    public function index()
    {
        // Lấy danh sách nhiệm vụ của người đăng nhập
        $tasks = Task::where('assigned_to', auth()->id())->get();
        return response()->json($tasks);
    }
}
