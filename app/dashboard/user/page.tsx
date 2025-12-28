"use client";

import React from "react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  BookOpen,
  Award,
  Calendar,
  Star,
  Wallet,
  Clock,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

interface FinanceSummary {
  balance: number;
  totalPaid: number;
  verifiedCount: number;
  pendingCount: number;
}

interface Subscription {
  id: number;
  amount: number;
  status: "pending" | "verified";
  paymentMethod: string;
  createdAt: string;
}

/* ================= COMPONENT ================= */

export default function UserDashboard() {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [payments, setPayments] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/finance`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => data["hydra:member"]),
    ])
      .then(([financeData, paymentData]) => {
        setFinance(financeData);
        setPayments(paymentData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["ROLE_USER", "ROLE_STAFF", "ROLE_ADMIN"]}>
      {/* ================= FINANCE SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <Wallet className="text-green-500 mb-2" size={32} />
          <h3 className="text-3xl font-bold text-white">
            ₦{finance?.balance?.toLocaleString() ?? "0"}
          </h3>
          <p className="text-gray-400 text-sm">Account Balance</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <CheckCircle className="text-green-500 mb-2" size={32} />
          <h3 className="text-3xl font-bold text-white">
            {finance?.verifiedCount ?? 0}
          </h3>
          <p className="text-gray-400 text-sm">Verified Payments</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <Clock className="text-green-400 mb-2" size={32} />
          <h3 className="text-3xl font-bold text-white">
            {finance?.pendingCount ?? 0}
          </h3>
          <p className="text-gray-400 text-sm">Pending Payments</p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<BookOpen size={32} />} value="12" label="Active Courses" color="text-green-500" />
        <StatCard icon={<Award size={32} />} value="8" label="Achievements" color="text-green-500" />
        <StatCard icon={<Calendar size={32} />} value="45" label="Days Active" color="text-green-500" />
        <StatCard icon={<Star size={32} />} value="4.8" label="Average Rating" color="text-green-500" />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">My Progress</h3>

          {[
            { course: "Web Development", progress: 75 },
            { course: "Data Science", progress: 45 },
            { course: "UI/UX Design", progress: 90 },
          ].map((item, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">{item.course}</span>
                <span className="text-green-500 font-semibold">
                  {item.progress}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-green-700 to-green-400 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Upcoming Events</h3>

          {[
            { title: "Live Workshop", time: "Tomorrow, 10:00 AM" },
            { title: "Assignment Due", time: "Dec 15, 2025" },
            { title: "Group Meeting", time: "Dec 12, 3:00 PM" },
          ].map((event, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-lg mb-3">
              <p className="text-white font-medium">{event.title}</p>
              <p className="text-gray-400 text-sm">{event.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PAYMENT HISTORY ================= */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 mt-8">
        <h3 className="text-xl font-bold text-white mb-4">
          Payment History
        </h3>

        {loading ? (
          <p className="text-gray-400">Loading payments...</p>
        ) : !payments || payments.length === 0 ? (
          <p className="text-gray-400">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-2 text-left">Date</th>
                  <th className="text-left">Method</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-3 text-gray-300">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="capitalize text-gray-300">{p.paymentMethod}</td>
                    <td className="text-gray-300">₦{p.amount.toLocaleString()}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          p.status === "verified"
                            ? "bg-green-600/20 text-green-600"
                            : "bg-green-400/20 text-green-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ================= REUSABLE STAT CARD ================= */

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <h3 className="text-white text-3xl font-bold mb-2">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}