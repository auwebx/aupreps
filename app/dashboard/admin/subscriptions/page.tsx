"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Subscription {
  id: number;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user: User;
}

export default function AdminSubscriptionsPage() {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch all subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/subscriptions`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch subscriptions (${res.status}): ${text}`);
      }

      const data = await res.json();
      const list = data["hydra:member"] || data.member || [];

      const processed = await Promise.all(
        list.map(async (s: Record<string, unknown>) => {
          let user: User;

          if (typeof s.user === "string") {
            try {
              const userRes = await api.authenticatedFetch(`${API_URL}${s.user}`, token, {
                headers: { Accept: "application/ld+json" },
              });
              const u = (await userRes.json()) as Record<string, unknown>;
              user = {
                id: Number(u.id),
                email: String(u.email || ""),
                firstName: String(u.firstName || ""),
                lastName: String(u.lastName || ""),
              };
            } catch {
              user = { id: 0, email: "Unknown", firstName: "", lastName: "" };
            }
          } else if (s.user && typeof s.user === "object") {
            const u = s.user as Record<string, unknown>;
            user = {
              id: Number(u.id),
              email: String(u.email || ""),
              firstName: String(u.firstName || ""),
              lastName: String(u.lastName || ""),
            };
          } else {
            user = { id: 0, email: "Unknown", firstName: "", lastName: "" };
          }

          return {
            id: Number(s.id),
            amount: Number(s.amount),
            status: String(s.status || ""),
            paymentMethod: String(s.paymentMethod || ""),
            createdAt: String(s.createdAt || ""),
            user,
          };
        })
      );

      setSubscriptions(processed);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to fetch subscriptions";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update subscription status using PATCH
  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    setUpdatingId(id);

    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/subscriptions/${id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update subscription: ${text}`);
      }

      setSubscriptions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, status } : sub)));
      toast.success("Status updated!");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (token) fetchSubscriptions();
  }, [token, fetchSubscriptions]);

  return (
    <DashboardLayout allowedRoles={["ROLE_ADMIN"]}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">User Subscriptions</h2>

        {loading && <p className="text-gray-400">Loading subscriptions...</p>}

        {!loading && subscriptions.length === 0 && <p className="text-gray-400">No subscriptions found.</p>}

        {!loading && subscriptions.length > 0 && (
          <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10 p-4">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-2 text-left">User</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Method</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Date</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="py-3 text-gray-300">{`${s.user.firstName} ${s.user.lastName}`}</td>
                    <td className="text-gray-300">{s.user.email}</td>
                    <td className="text-gray-300">₦{s.amount.toLocaleString()}</td>
                    <td className="capitalize text-gray-300">{s.paymentMethod}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          s.status === "verified"
                            ? "bg-green-500/20 text-green-400"
                            : s.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="text-gray-300">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="flex gap-2">
                      {s.status !== "verified" && (
                        <Button size="sm" disabled={updatingId === s.id} onClick={() => updateStatus(s.id, "verified")}>
                          <Check size={14} /> Verify
                        </Button>
                      )}
                      {s.status !== "failed" && (
                        <Button size="sm" disabled={updatingId === s.id} onClick={() => updateStatus(s.id, "failed")}>
                          <X size={14} /> Reject
                        </Button>
                      )}
                      {updatingId === s.id && (
                        <span className="flex items-center text-gray-300 gap-1">
                          <RefreshCw size={14} className="animate-spin" /> Updating
                        </span>
                      )}
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
