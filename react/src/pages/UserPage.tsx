// noinspection JSAnnotator

import React, {useEffect, useState} from 'react';
import axiosInstance from "../configs/axios";
import CookieService from '../services/CookieService';
import {useLocation} from 'react-router-dom';
import {toast} from 'react-toastify';
import axios from "axios";
import {urlBase64ToUint8Array} from "../utils";
import {IoNotificationsCircleOutline} from "react-icons/io5";
import {io} from "socket.io-client";

const publicVapidKey = 'BE3x0_ETgiAiwzBZm0woOQRy2ZU4mKqGzt0uyqmvwhVJzEmfypVmR6cJKMFPv0G5q4zTb9hl-ETJwDUU-1cNNtM';

const AssignTaskForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [taskList, setTaskList] = useState([]);
    useEffect(() => {
        const socket = io('http://localhost:8080', {
            auth: {
                user_id: CookieService.get('user_id')
            }
        });
        socket.on('notification', (data) => {
            toast.warning('Có thông báo mới', {
                autoClose: 1000
            });
            console.log(data)
            setTaskList([data, ...taskList]);
        });
        return () => {
            socket.disconnect();
        };
    }, [taskList]);
    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    };

    const location = useLocation();
    const {users_list} = location.state || {};
    const [subscription, setSubscription] = useState(null);

    const fetchTasks = async () => {
        try {
            const token = CookieService.get('access_token');
            const response = await axiosInstance.get('auth/tasks', {
                headers: {Authorization: `Bearer ${token}`}
            });
            setTaskList(response); // Extract the data property
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };
    //


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

        fetchTasks()
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
            toast.success("Gửi thành công", {
                autoClose: 1000
            });
        } catch (error) {
            toast.error(error.response.data.message, {
                autoClose: 1000
            });
            console.error('Error assigning task', error);
        }
    };

    return (
        <>
            <nav
                className="bg-white w-full container border-b border-gray-200 dark:bg-gray-900 text-center flex flex-col items-center relative mt-3 p-4 shadow-md">
                <div className="relative">
                    <IoNotificationsCircleOutline
                        size='60px'
                        color='red'
                        onClick={togglePopup}
                        className='cursor-pointer'
                        style={{padding: '10px'}}
                    />
                    <span
                        className="absolute select-none top-0 right-0 bg-red-500 text-white rounded-full text-sm w-5 h-5 flex items-center justify-center">
            {taskList?.length}
        </span>
                </div>

                {isPopupVisible && (
                    <div className="absolute top-20 bg-white max-h-[300px] overflow-auto border border-gray-300 shadow-lg p-4 rounded-lg w-64 z-50">
                        <h3 className="text-lg font-bold mb-2 select-none">Notifications</h3>
                        <ul className="list-disc space-y-2">
                            {taskList && taskList.map((task: any) => (
                                <li key={task?.id}
                                    className="text-gray-700 select-none list-none bg-gray-100 p-2 rounded-lg cursor-pointer shadow-sm hover:bg-gray-200 transition-colors">
                                    {task?.title}
                                </li>
                            ))}
                        </ul>
                        <button
                            className="mt-4 bg-blue-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={togglePopup}
                        >
                            Close
                        </button>
                    </div>
                )}
            </nav>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 mt-5 bg-white shadow-md rounded-lg space-y-4">
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

        </>

    );
};

export default AssignTaskForm;
