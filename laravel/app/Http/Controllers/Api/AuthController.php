<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $credentials = request(['email', 'password']);
       
        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $users = User::all(['id', 'name']);
        $accessTokenCookie = Cookie::make('access_token', $token, auth()->factory()->getTTL() * 60, '/', null, false, false, false, 'Lax');

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'users_list' => $users // Trả về danh sách tất cả người dùng
        ])->withCookie($accessTokenCookie);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
