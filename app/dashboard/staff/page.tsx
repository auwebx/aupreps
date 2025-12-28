"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

export default function StaffDashboard() {
  return (
    <DashboardLayout allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-cyan-400" size={32} />
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">156</h3>
          <p className="text-gray-400 text-sm">Assigned Users</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-yellow-400" size={32} />
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">23</h3>
          <p className="text-gray-400 text-sm">Pending Tasks</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">89</h3>
          <p className="text-gray-400 text-sm">Completed Tasks</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-orange-400" size={32} />
          </div>
          <h3 className="text-white text-3xl font-bold mb-2">12</h3>
          <p className="text-gray-400 text-sm">Hours Logged</p>
        </div>
      </div>

      {/* Staff Tasks */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Tasks</h3>
        <div className="space-y-3">
          {[
            { title: "Review user verification", status: "pending", priority: "high" },
            { title: "Process support tickets", status: "in-progress", priority: "medium" },
            { title: "Update documentation", status: "pending", priority: "low" },
            { title: "Conduct user training", status: "completed", priority: "medium" },
          ].map((task, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                <div>
                  <p className="text-white font-medium">{task.title}</p>
                  <p className="text-gray-400 text-sm capitalize">{task.status.replace('-', ' ')}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
