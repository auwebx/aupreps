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

interface Topic {
  id: number;
  name: string;
  subject: Subject;
}

interface SubjectApiItem {
  id: number | string;
  name: string;
  exam: { id: number | string; name: string; year: number | string } | string;
}

export default function AdminTopics() {
  const { token } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/subjects`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) throw new Error("Failed to fetch subjects");

      const data = await res.json();
      const list = data["hydra:member"] || data.member || [];

      const processedSubjects = await Promise.all(
        list.map(async (s: SubjectApiItem) => {
          let exam: Exam;

          if (typeof s.exam === "string") {
            try {
              const examRes = await api.authenticatedFetch(`${API_URL}${s.exam}`, token, {
                headers: { Accept: "application/ld+json" },
              });

              if (examRes.ok) {
                const examData = await examRes.json();
                exam = {
                  id: Number(examData.id),
                  name: examData.name,
                  year: Number(examData.year),
                };
              } else {
                exam = { id: 0, name: "Unknown", year: 0 };
              }
            } catch {
              exam = { id: 0, name: "Error", year: 0 };
            }
          } else {
            exam = {
              id: Number(s.exam.id),
              name: s.exam.name,
              year: Number(s.exam.year),
            };
          }

          return {
            id: Number(s.id),
            name: s.name,
            exam,
          };
        })
      );

      setSubjects(processedSubjects);
    } catch (err: unknown) {
      const message = err instanceof Error ? `Failed to load subjects: ${err.message}` : "Failed to load subjects";
      toast.error(message);
    }
  }, [token]);


  const fetchTopics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/topics`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        throw new Error(`Failed to fetch topics (${res.status})`);
      }

      const data = await res.json();
      const list = data["hydra:member"] || data.member || [];

      // Process topics and fetch subject details if needed
      const processedTopics = await Promise.all(
        list.map(async (t: unknown) => {
          let subject: Subject;

          // Narrow t as object
          if (
            typeof t === "object" &&
            t !== null &&
            "subject" in t &&
            "id" in t &&
            "name" in t
          ) {
            const tObj = t as { subject: unknown; id: unknown; name: string };

            // Handle subject
            if (typeof tObj.subject === "string") {
              // Subject is an IRI, fetch it
              try {
                const subjectRes = await api.authenticatedFetch(
                  `${API_URL}${tObj.subject}`,
                  token,
                  { headers: { Accept: "application/ld+json" } }
                );

                if (subjectRes.ok) {
                  const subjectData = await subjectRes.json();

                  let exam: Exam;
                  if (typeof subjectData.exam === "string") {
                    const examRes = await api.authenticatedFetch(
                      `${API_URL}${subjectData.exam}`,
                      token,
                      { headers: { Accept: "application/ld+json" } }
                    );
                    if (examRes.ok) {
                      const examData = await examRes.json();
                      exam = {
                        id: Number(examData.id),
                        name: examData.name,
                        year: Number(examData.year),
                      };
                    } else {
                      exam = { id: 0, name: "Unknown", year: 0 };
                    }
                  } else if (subjectData.exam) {
                    exam = {
                      id: Number(subjectData.exam.id),
                      name: subjectData.exam.name,
                      year: Number(subjectData.exam.year),
                    };
                  } else {
                    exam = { id: 0, name: "N/A", year: 0 };
                  }

                  subject = {
                    id: Number(subjectData.id),
                    name: subjectData.name,
                    exam,
                  };
                } else {
                  subject = {
                    id: 0,
                    name: "Unknown",
                    exam: { id: 0, name: "Unknown", year: 0 },
                  };
                }
              } catch (err: unknown) {
                console.error("Error fetching subject:", err);
                subject = {
                  id: 0,
                  name: "Error",
                  exam: { id: 0, name: "Error", year: 0 },
                };
              }
            } else if (
              typeof tObj.subject === "object" &&
              tObj.subject !== null
            ) {
              const subObj = tObj.subject as {
                id?: unknown;
                name?: string;
                exam?: unknown;
              };

              let exam: Exam;

              if (typeof subObj.exam === "string") {
                try {
                  const examRes = await api.authenticatedFetch(
                    `${API_URL}${subObj.exam}`,
                    token,
                    { headers: { Accept: "application/ld+json" } }
                  );
                  if (examRes.ok) {
                    const examData = await examRes.json();
                    exam = {
                      id: Number(examData.id),
                      name: examData.name,
                      year: Number(examData.year),
                    };
                  } else {
                    exam = { id: 0, name: "Unknown", year: 0 };
                  }
                } catch (err: unknown) {
                  console.error("Error fetching exam:", err);
                  exam = { id: 0, name: "Error", year: 0 };
                }
              } else if (
                typeof subObj.exam === "object" &&
                subObj.exam !== null
              ) {
                const examObj = subObj.exam as {
                  id?: unknown;
                  name?: string;
                  year?: unknown;
                };
                exam = {
                  id: Number(examObj.id ?? 0),
                  name: examObj.name ?? "N/A",
                  year: Number(examObj.year ?? 0),
                };
              } else {
                exam = { id: 0, name: "N/A", year: 0 };
              }

              subject = {
                id: Number(subObj.id ?? 0),
                name: subObj.name ?? "N/A",
                exam,
              };
            } else {
              subject = {
                id: 0,
                name: "N/A",
                exam: { id: 0, name: "N/A", year: 0 },
              };
            }

            return {
              id: Number(tObj.id),
              name: tObj.name,
              subject,
            };
          }

          // fallback if t is invalid
          return {
            id: 0,
            name: "N/A",
            subject: {
              id: 0,
              name: "N/A",
              exam: { id: 0, name: "N/A", year: 0 },
            },
          };
        })
      );

      setTopics(processedTopics);
    } catch (err: unknown) {
      const message = err instanceof Error ? `Failed to load topics: ${err.message}` : "Failed to load topics";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

 useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchTopics();
    }
  }, [token, fetchSubjects, fetchTopics]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedSubjectId || !token) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const url = editingId
        ? `${API_URL}/api/topics/${editingId}`
        : `${API_URL}/api/topics`;
      const method = editingId ? "PUT" : "POST";

      const res = await api.authenticatedFetch(url, token, {
        method,
        headers: {
          "Content-Type": "application/ld+json",
        },
        body: JSON.stringify({
          name: name.trim(),
          subject: `/api/subjects/${selectedSubjectId}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err["hydra:description"] || err.message || "Save failed"
        );
      }

      toast.success(editingId ? "Updated!" : "Created!");
      setName("");
      setSelectedSubjectId("");
      setEditingId(null);
      fetchTopics();
    } catch (err: unknown) {
      let message = "Failed to save";
      if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this topic permanently?")) return;
    if (!token) return;

    try {
      const res = await api.authenticatedFetch(
        `${API_URL}/api/topics/${id}`,
        token,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      fetchTopics();
    } catch (err: unknown) {
      let message = "Delete failed";
      if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
    }
  };

  const handleEdit = (topic: Topic) => {
    setName(topic.name);
    setSelectedSubjectId(topic.subject.id.toString());
    setEditingId(topic.id);
  };

  const handleCancel = () => {
    setName("");
    setSelectedSubjectId("");
    setEditingId(null);
  };

  return (
    <DashboardLayout allowedRoles={["ROLE_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Topics</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Topic name (e.g., Algebra, Grammar)"
              required
              className="max-w-md"
            />
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              required
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name} - {subject.exam.name}{" "}
                    {subject.exam.year ? `(${subject.exam.year})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {editingId ? "Update Topic" : "Add Topic"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
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
                <TableHead className="text-white">Topic Name</TableHead>
                <TableHead className="text-white">Subject</TableHead>
                <TableHead className="text-white">Exam</TableHead>
                <TableHead className="text-white">Year</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-400"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : topics.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-400"
                  >
                    No topics found. Add your first topic above.
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic, index) => (
                  <TableRow key={topic.id}>
                    <TableCell className="text-white">{index + 1}</TableCell>
                    <TableCell className="font-medium text-white">
                      {topic.name}
                    </TableCell>
                    <TableCell className="text-white">
                      {topic.subject.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-white">
                      {topic.subject.exam.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-white">
                      {topic.subject.exam.year || "N/A"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(topic)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(topic.id)}
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
