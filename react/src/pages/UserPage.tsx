// noinspection JSAnnotator

import React, {useEffect, useState} from 'react';
import axiosInstance from "../configs/axios";
import CookieService from '../services/CookieService';
import {useLocation} from 'react-router-dom';
import {toast} from 'react-toastify';
import axios from "axios";

const AssignTaskForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const location = useLocation();
    const {users_list} = location.state || {};
    const [subscription, setSubscription] = useState(null);

    //
    const publicVapidKey = 'BE3x0_ETgiAiwzBZm0woOQRy2ZU4mKqGzt0uyqmvwhVJzEmfypVmR6cJKMFPv0G5q4zTb9hl-ETJwDUU-1cNNtM';

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => {
                    send();
                })
                .catch(error => {
                    console.error('Service Worker đăng ký thất bại', error);
                });
        }
    }, []);

    async function send() {
        // Đăng ký Service Worker
        const register = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        console.log('Service Worker Registered');

        // Đăng ký Push
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        setSubscription(subscription);

        console.log('Push Registered');
        // Gửi Subscription đến Server
        await axios.post('http://localhost:8080/subscribe', subscription, {
            headers: {
                'Content-Type': 'application/json'
            }
        });


        console.log('Push Sent');
    }

    //

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = CookieService.get('access_token');
            const payload = {
                title: title,
                description: description,
                assigned_to: assignedTo,
                subscription: subscription
            }

            await axiosInstance.post('auth/tasks',
                payload,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            toast.success("Gửi thành công");
        } catch (error) {
            toast.error("Tài khoản không đúng");
            console.error('Error assigning task', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg space-y-4">
            <div>
                <label className="block text-gray-700 font-bold mb-2">Tiêu đề:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-700 font-bold mb-2">Chi tiết:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>
            <div>
                <label className="block text-gray-700 font-bold mb-2">Giao cho:</label>
                <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Chọn người dùng</option>
                    {users_list && users_list.map((user: never) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
                Gửi
            </button>
        </form>

    );
};

export default AssignTaskForm;
