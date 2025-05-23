import React from 'react';
import { Link } from 'react-router-dom';
import Settings from "./Setting";

export default function FarmBotDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Header */}
            <header className="flex justify-between items-center p-4 bg-green-600 shadow text-white">
                <h1 className="text-xl font-semibold">🚜 FarmBot</h1>
                <div className="flex items-center space-x-4">
                    <span className="font-medium">● Online</span>
                    <button className="hover:text-gray-200">🔄 Refresh</button>
                    <Settings />
                </div>
            </header>
            {/* Main Layout */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-52 bg-white shadow h-screen p-4 space-y-4">
                    <nav className="flex flex-col space-y-2">
                        <a href="#" className="text-white font-medium bg-green-600 p-2 rounded">🏠 Dashboard</a>
                        {/*<a href="#" className="text-gray-700 hover:text-green-600">🌱 Seeding</a>*/}
                        {/*<a href="#" className="text-gray-700 hover:text-green-600">💧 Watering</a>*/}
                        <a href="#" className="text-gray-700 hover:text-green-600">📊 Monitor</a>
                        <a href="#" className="text-gray-700 hover:text-green-600">⚙️ Settings</a>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 mt-8 mx-4 mb-4 grid grid-cols-3 gap-2">
                    {/* Job Cards */}
                    <div className="bg-white shadow-2xl shadow-green-200 p-4 h-[20rem] w-full flex flex-col items-center justify-center text-center m-1">
                        <div className="text-6xl mb-4">🌱</div>
                        <h2 className="text-lg font-semibold mb-2">Seeding</h2>
                        <Link to="/seeding/parameters">
                            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">View Jobs</button>
                        </Link>
                    </div>

                    <div className="bg-white shadow-2xl shadow-green-200 p-4 h-[20rem] w-full flex flex-col items-center justify-center text-center m-1">
                        <div className="text-6xl mb-4">💧</div>
                        <h2 className="text-lg font-semibold mb-2">Watering</h2>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">View Jobs</button>
                    </div>

                    <div className="bg-white shadow-2xl shadow-green-200 p-4 h-[20rem] w-full flex flex-col items-center justify-center text-center m-1">
                        <div className="text-6xl mb-4">🌿</div>
                        <h2 className="text-lg font-semibold mb-2">Weed Control</h2>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">View Jobs</button>
                    </div>

                    <div className="bg-white shadow-2xl shadow-green-200 p-4 h-[20rem] w-full flex flex-col items-center justify-center text-center m-1">
                        <div className="text-6xl mb-4">💨</div>
                        <h2 className="text-lg font-semibold mb-2">Humidity</h2>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">View Jobs</button>
                    </div>

                    {/* Passive Monitoring Panel */}
                    <div className="bg-white shadow-2xl shadow-green-200 p-4 h-[20rem] w-full flex flex-col items-center justify-center text-center m-1">
                        <div className="text-5xl mb-2">🤖</div>
                        <h3 className="font-semibold text-gray-700">Bot Status</h3>
                        <p className="text-green-600">Online</p>
                        <p>Humidity: 51%</p>
                        <p>Next Job: Seeding at 03:00</p>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white shadow-2xl shadow-green-200 p-4 h-[20rem] w-full flex flex-col items-center justify-center text-center m-1">
                        <div className="text-5xl mb-2">📋</div>
                        <h3 className="font-semibold text-gray-700 mb-2">Recent Activity</h3>
                        <ul className="text-sm text-gray-600">
                            <li>✅ Seeding job finished at 02:55</li>
                            <li>💧 Watering started at 03:00</li>
                            <li>🤖 Bot resumed from idle</li>
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    );
}
