"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Users, Shield, Activity, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <DashboardLayout allowedRoles={['ROLE_ADMIN']}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-blue-400" size={32} />
            <span className="text-green-400 text-sm font-semibold">+12%</span>
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">1,234</h3>
          <p className="text-gray-400 text-sm">Total Users</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Shield className="text-purple-400" size={32} />
            <span className="text-green-400 text-sm font-semibold">+5%</span>
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">45</h3>
          <p className="text-gray-400 text-sm">Staff Members</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-green-400" size={32} />
            <span className="text-green-400 text-sm font-semibold">+24%</span>
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">892</h3>
          <p className="text-gray-400 text-sm">Active Sessions</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-pink-400" size={32} />
            <span className="text-green-400 text-sm font-semibold">+18%</span>
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">98.5%</h3>
          <p className="text-gray-400 text-sm">Success Rate</p>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Database Status</span>
              <span className="text-green-400 font-semibold">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">API Response Time</span>
              <span className="text-green-400 font-semibold">45ms</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Server Uptime</span>
              <span className="text-green-400 font-semibold">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">New user registered</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
