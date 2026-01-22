"use client";

import { useState } from "react";
import { ArrowLeft, Bell, Moon, Lock, Shield, ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
    const router = useRouter();
    const { signOut } = useAuth();

    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Section: Preferences */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferences</h3>
                    </div>

                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Bell className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>


                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Moon className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-900">Dark Mode</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    {/* Language Settings - using Global Widget */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <span className="font-bold text-orange-600 w-5 h-5 flex items-center justify-center text-xs">文</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-900 block">Language</span>
                                <span className="text-xs text-gray-400">Select your preferred language</span>
                            </div>
                        </div>
                        <div id="language-switcher-target"></div>
                    </div>

                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Section: Security */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Privacy & Security</h3>
                    </div>

                    <button className="w-full p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <Lock className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="font-medium text-gray-900">Change Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">Privacy Policy</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                <div className="text-center text-xs text-gray-400">
                    Version 1.0.0 (Alpha)
                </div>

            </div>
        </div>
    );
}
