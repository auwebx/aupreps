"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Subject {
  id: number;
  name: string;
  exam: Exam;
}

export default function AdminSubjects() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [name, setName] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExams = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/exams`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) throw new Error("Failed to fetch exams");

      const data = await res.json();
      const list = data["hydra:member"] || data.member || [];

      setExams(
        list.map((e: { id: number; name: string; year: number }) => ({
          id: Number(e.id),
          name: e.name,
          year: Number(e.year),
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load exams";
      toast.error(message);
    }
  }, [token]);

  const fetchSubjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/subjects`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response text:", text);
        throw new Error(`Failed to fetch subjects (${res.status})`);
      }

      const data = await res.json();
      const list = data["hydra:member"] || data.member || [];

      const processedSubjects = list.map((s: { id: number; name: string; exam: Exam }) => ({
        id: Number(s.id),
        name: s.name,
        exam: {
          id: Number(s.exam.id),
          name: s.exam.name,
          year: Number(s.exam.year),
        },
      }));

      setSubjects(processedSubjects);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load subjects";
      console.error("Fetch error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchExams();
      fetchSubjects();
    }
  }, [token, fetchExams, fetchSubjects]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !selectedExamId || !token) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `${API_URL}/api/subjects/${editingId}` : `${API_URL}/api/subjects`;
      const method = editingId ? "PUT" : "POST";

      const res = await api.authenticatedFetch(url, token, {
        method,
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({ name: name.trim(), exam: `/api/exams/${selectedExamId}` }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err["hydra:description"] || err.message || "Save failed");
      }

      toast.success(editingId ? "Updated!" : "Created!");
      setName("");
      setSelectedExamId("");
      setEditingId(null);
      fetchSubjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subject permanently?")) return;
    if (!token) return;

    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/subjects/${id}`, token, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      fetchSubjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  };

  const handleEdit = (subject: Subject) => {
    setName(subject.name);
    setSelectedExamId(subject.exam.id.toString());
    setEditingId(subject.id);
  };

  const handleCancel = () => {
    setName("");
    setSelectedExamId("");
    setEditingId(null);
  };

  return (
    <DashboardLayout allowedRoles={["ROLE_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Subjects</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Subject name" required className="max-w-md" />
            <Select value={selectedExamId} onValueChange={setSelectedExamId} required>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>
                    {exam.name} ({exam.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{editingId ? "Update Subject" : "Add Subject"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>}
          </div>
        </form>

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">S/N</TableHead>
                <TableHead className="text-white">Subject Name</TableHead>
                <TableHead className="text-white">Exam</TableHead>
                <TableHead className="text-white">Year</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">No subjects found. Add your first subject above.</TableCell>
                </TableRow>
              ) : (
                subjects.map((subject, index) => (
                  <TableRow key={subject.id}>
                    <TableCell className="text-white">{index + 1}</TableCell>
                    <TableCell className="font-medium text-white">{subject.name}</TableCell>
                    <TableCell className="text-white">{subject.exam.name || "N/A"}</TableCell>
                    <TableCell className="text-white">{subject.exam.year || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)} className="text-blue-400 hover:text-blue-300">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(subject.id)}>Delete</Button>
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
