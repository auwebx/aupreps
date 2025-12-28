"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Exam {
  id: number;
  name: string;
  year: number;
}

interface ApiExamResponse {
  id: string | number;
  name: string;
  year: string | number;
}

interface HydraCollection<T> {
  "hydra:member"?: T[];
  member?: T[];
}

interface ApiErrorResponse {
  "hydra:description"?: string;
  message?: string;
}

export default function AdminExams() {
  const { token } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExams = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/exams`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) throw new Error("Failed to fetch exams");

      const data = await res.json() as HydraCollection<ApiExamResponse>;
      
      const list = data["hydra:member"] || data.member || [];
      
      setExams(
        list.map((e) => ({
          id: Number(e.id),
          name: e.name,
          year: Number(e.year),
        }))
      );
    } catch (err) {
      const error = err as Error;
      console.error('Fetch error:', error);
      toast.error("Failed to load exams: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !year.trim() || !token) return;

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      toast.error("Please enter a valid year between 1900 and 2100");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `${API_URL}/api/exams/${editingId}` : `${API_URL}/api/exams`;
      const method = editingId ? "PUT" : "POST";

      const res = await api.authenticatedFetch(url, token, {
        method,
        headers: {
          "Content-Type": "application/ld+json",
        },
        body: JSON.stringify({ 
          name: name.trim(),
          year: yearNum 
        }),
      });

      if (!res.ok) {
        const err = await res.json() as ApiErrorResponse;
        throw new Error(err["hydra:description"] || err.message || "Save failed");
      }

      toast.success(editingId ? "Updated!" : "Created!");
      setName("");
      setYear("");
      setEditingId(null);
      fetchExams();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete permanently?")) return;
    if (!token) return;
    
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/exams/${id}`, token, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      fetchExams();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Delete failed");
    }
  };

  const handleEdit = (exam: Exam) => {
    setName(exam.name);
    setYear(exam.year.toString());
    setEditingId(exam.id);
  };

  const handleCancel = () => {
    setName("");
    setYear("");
    setEditingId(null);
  };

  return (
    <DashboardLayout allowedRoles={["ROLE_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Exams</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Exam name (e.g., WAEC, JAMB, NECO)"
              required
              className="max-w-md"
            />
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year (e.g., 2024)"
              required
              min="1900"
              max="2100"
              className="max-w-xs"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {editingId ? "Update Exam" : "Add Exam"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">S/N</TableHead>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Year</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    No exams found. Add your first exam above.
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam, index) => (
                  <TableRow key={exam.id}>
                    <TableCell className="text-white">{index + 1}</TableCell>
                    <TableCell className="font-medium text-white">{exam.name}</TableCell>
                    <TableCell className="text-white">{exam.year}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(exam)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(exam.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}