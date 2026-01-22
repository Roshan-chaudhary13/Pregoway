"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Moon, Lock, Shield, ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
    const router = useRouter();
    const { signOut } = useAuth();

    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Load Dark Mode Preference
        const isDark = localStorage.getItem('theme') === 'dark';
        setDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        
        // Load Notifications Preference
        const notif = localStorage.getItem('notifications') !== 'false';
        setNotifications(notif);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications', String(newVal));
        if (newVal) alert("Notifications Enabled");
        else alert("Notifications Disabled");
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-slate-900 dark:text-white transition-colors">
            <div className="bg-white dark:bg-slate-800 p-4 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">

                    {/* Section: Preferences */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preferences</h3>
                    </div>

                    <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications} onChange={toggleNotifications} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>


                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    {/* Language Settings - using Global Widget */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                                <span className="font-bold text-orange-600 dark:text-orange-400 w-5 h-5 flex items-center justify-center text-xs">文</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-white block">Language</span>
                                <span className="text-xs text-gray-400">Select your preferred language</span>
                            </div>
                        </div>
                        <div id="language-switcher-target"></div>
                    </div>

                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                    {/* Section: Security */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Privacy & Security</h3>
                    </div>

                    <button 
                        onClick={() => alert("Change Password feature is coming soon!")}
                        className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                                <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">Change Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button 
                         onClick={() => window.open('#', '_blank')}
                         className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">Privacy Policy</span>
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
