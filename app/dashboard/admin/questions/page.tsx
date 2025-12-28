"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2 } from "lucide-react";

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

interface Question {
  id: number;
  exam: Exam;
  subject: Subject;
  topic: Topic;
  questionText: string;
  options: string[];
  correctOption: string;
  solution: string;
  difficulty: string;
  source: string;
  year: number;
}

interface ApiExamResponse {
  id: string | number;
  name: string;
  year: string | number;
}

interface ApiSubjectResponse {
  id: string | number;
  name: string;
  exam: string | ApiExamResponse;
}

interface ApiTopicResponse {
  id: string | number;
  name: string;
  subject: string | ApiSubjectResponse;
}

interface ApiQuestionResponse {
  id: string | number;
  exam?: string | ApiExamResponse;
  subject?: string | ApiSubjectResponse;
  topic?: string | ApiTopicResponse;
  questionText?: string;
  options?: string[];
  correctOption?: string;
  solution?: string;
  difficulty?: string;
  source?: string;
  year?: string | number;
}

interface HydraCollection<T> {
  "hydra:member"?: T[];
  member?: T[];
}

interface ApiErrorResponse {
  "hydra:description"?: string;
  message?: string;
}

export default function AdminQuestions() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("");
  const [solution, setSolution] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [source, setSource] = useState("");
  const [year, setYear] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExams = async () => {
    if (!token) return;
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/exams`, token, {
        headers: { Accept: "application/ld+json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as HydraCollection<ApiExamResponse>;
      const list = data["hydra:member"] || data.member || [];
      setExams(list.map((e) => ({ 
        id: Number(e.id), 
        name: e.name, 
        year: Number(e.year) 
      })));
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to load exams");
    }
  };

  const fetchSubjects = async () => {
    if (!token) return;
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/subjects`, token, {
        headers: { Accept: "application/ld+json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as HydraCollection<ApiSubjectResponse>;
      const list = data["hydra:member"] || data.member || [];
      
      const processed = await Promise.all(list.map(async (s) => {
        let exam: Exam;
        if (typeof s.exam === 'string') {
          const examRes = await api.authenticatedFetch(`${API_URL}${s.exam}`, token, {
            headers: { Accept: "application/ld+json" },
          });
          if (examRes.ok) {
            const examData = await examRes.json() as ApiExamResponse;
            exam = { id: Number(examData.id), name: examData.name, year: Number(examData.year) };
          } else {
            exam = { id: 0, name: 'Unknown', year: 0 };
          }
        } else {
          exam = { id: Number(s.exam.id), name: s.exam.name, year: Number(s.exam.year) };
        }
        return { id: Number(s.id), name: s.name, exam };
      }));
      setSubjects(processed);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to load subjects");
    }
  };

  const fetchTopics = async () => {
    if (!token) return;
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/topics`, token, {
        headers: { Accept: "application/ld+json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as HydraCollection<ApiTopicResponse>;
      const list = data["hydra:member"] || data.member || [];
      
      const processed = await Promise.all(list.map(async (t) => {
        let subject: Subject;
        if (typeof t.subject === 'string') {
          const subRes = await api.authenticatedFetch(`${API_URL}${t.subject}`, token, {
            headers: { Accept: "application/ld+json" },
          });
          if (subRes.ok) {
            const subData = await subRes.json() as ApiSubjectResponse;
            let exam: Exam;
            if (typeof subData.exam === 'string') {
              const examRes = await api.authenticatedFetch(`${API_URL}${subData.exam}`, token, {
                headers: { Accept: "application/ld+json" },
              });
              if (examRes.ok) {
                const examData = await examRes.json() as ApiExamResponse;
                exam = { id: Number(examData.id), name: examData.name, year: Number(examData.year) };
              } else {
                exam = { id: 0, name: 'Unknown', year: 0 };
              }
            } else {
              exam = { id: Number(subData.exam.id), name: subData.exam.name, year: Number(subData.exam.year) };
            }
            subject = { id: Number(subData.id), name: subData.name, exam };
          } else {
            subject = { id: 0, name: 'Unknown', exam: { id: 0, name: 'Unknown', year: 0 } };
          }
        } else {
          let exam: Exam;
          if (typeof t.subject.exam === 'string') {
            const examRes = await api.authenticatedFetch(`${API_URL}${t.subject.exam}`, token, {
              headers: { Accept: "application/ld+json" },
            });
            if (examRes.ok) {
              const examData = await examRes.json() as ApiExamResponse;
              exam = { id: Number(examData.id), name: examData.name, year: Number(examData.year) };
            } else {
              exam = { id: 0, name: 'Unknown', year: 0 };
            }
          } else {
            exam = { id: Number(t.subject.exam.id), name: t.subject.exam.name, year: Number(t.subject.exam.year) };
          }
          subject = { id: Number(t.subject.id), name: t.subject.name, exam };
        }
        return { id: Number(t.id), name: t.name, subject };
      }));
      setTopics(processed);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to load topics");
    }
  };

  const fetchQuestions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/questions`, token, {
        headers: { Accept: "application/ld+json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as HydraCollection<ApiQuestionResponse>;
      const list = data["hydra:member"] || data.member || [];
      
      const processed = await Promise.all(list.map(async (q) => {
        let exam: Exam;
        if (typeof q.exam === 'string') {
          try {
            const examRes = await api.authenticatedFetch(`${API_URL}${q.exam}`, token, {
              headers: { Accept: "application/ld+json" },
            });
            if (examRes.ok) {
              const examData = await examRes.json() as ApiExamResponse;
              exam = { id: Number(examData.id), name: examData.name, year: Number(examData.year) };
            } else {
              exam = { id: 0, name: 'N/A', year: 0 };
            }
          } catch {
            exam = { id: 0, name: 'N/A', year: 0 };
          }
        } else if (q.exam) {
          exam = { id: Number(q.exam.id), name: q.exam.name, year: Number(q.exam.year) };
        } else {
          exam = { id: 0, name: 'N/A', year: 0 };
        }

        let subject: Subject;
        if (typeof q.subject === 'string') {
          try {
            const subRes = await api.authenticatedFetch(`${API_URL}${q.subject}`, token, {
              headers: { Accept: "application/ld+json" },
            });
            if (subRes.ok) {
              const subData = await subRes.json() as ApiSubjectResponse;
              let subExam: Exam;
              if (typeof subData.exam === 'string') {
                const examRes = await api.authenticatedFetch(`${API_URL}${subData.exam}`, token, {
                  headers: { Accept: "application/ld+json" },
                });
                if (examRes.ok) {
                  const examData = await examRes.json() as ApiExamResponse;
                  subExam = { id: Number(examData.id), name: examData.name, year: Number(examData.year) };
                } else {
                  subExam = { id: 0, name: 'N/A', year: 0 };
                }
              } else {
                subExam = { id: Number(subData.exam.id), name: subData.exam.name, year: Number(subData.exam.year) };
              }
              subject = { id: Number(subData.id), name: subData.name, exam: subExam };
            } else {
              subject = { id: 0, name: 'N/A', exam: { id: 0, name: 'N/A', year: 0 } };
            }
          } catch {
            subject = { id: 0, name: 'N/A', exam: { id: 0, name: 'N/A', year: 0 } };
          }
        } else if (q.subject) {
          let subExam: Exam;
          if (typeof q.subject.exam === 'string') {
            try {
              const examRes = await api.authenticatedFetch(`${API_URL}${q.subject.exam}`, token, {
                headers: { Accept: "application/ld+json" },
              });
              if (examRes.ok) {
                const examData = await examRes.json() as ApiExamResponse;
                subExam = { id: Number(examData.id), name: examData.name, year: Number(examData.year) };
              } else {
                subExam = { id: 0, name: 'N/A', year: 0 };
              }
            } catch {
              subExam = { id: 0, name: 'N/A', year: 0 };
            }
          } else if (q.subject.exam) {
            subExam = { id: Number(q.subject.exam.id), name: q.subject.exam.name, year: Number(q.subject.exam.year) };
          } else {
            subExam = { id: 0, name: 'N/A', year: 0 };
          }
          subject = { id: Number(q.subject.id), name: q.subject.name, exam: subExam };
        } else {
          subject = { id: 0, name: 'N/A', exam: { id: 0, name: 'N/A', year: 0 } };
        }

        let topic: Topic;
        if (typeof q.topic === 'string') {
          try {
            const topicRes = await api.authenticatedFetch(`${API_URL}${q.topic}`, token, {
              headers: { Accept: "application/ld+json" },
            });
            if (topicRes.ok) {
              const topicData = await topicRes.json() as ApiTopicResponse;
              topic = { 
                id: Number(topicData.id), 
                name: topicData.name, 
                subject: subject
              };
            } else {
              topic = { id: 0, name: 'N/A', subject };
            }
          } catch {
            topic = { id: 0, name: 'N/A', subject };
          }
        } else if (q.topic) {
          topic = { id: Number(q.topic.id), name: q.topic.name, subject };
        } else {
          topic = { id: 0, name: 'N/A', subject };
        }

        return {
          id: Number(q.id),
          exam,
          subject,
          topic,
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options : [],
          correctOption: q.correctOption || '',
          solution: q.solution || '',
          difficulty: q.difficulty || '',
          source: q.source || '',
          year: Number(q.year) || 0,
        };
      }));

      setQuestions(processed);
    } catch (err) {
      const error = err as Error;
      console.error('Fetch questions error:', error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExams();
      fetchSubjects();
      fetchTopics();
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("At least 2 options required");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !selectedExamId || !selectedSubjectId || !selectedTopicId || 
        !correctOption || !difficulty || !source || !token) {
      toast.error("Please fill all required fields");
      return;
    }

    const filteredOptions = options.filter(opt => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      toast.error("At least 2 options required");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `${API_URL}/api/questions/${editingId}` : `${API_URL}/api/questions`;
      const method = editingId ? "PUT" : "POST";

      const res = await api.authenticatedFetch(url, token, {
        method,
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          exam: `/api/exams/${selectedExamId}`,
          subject: `/api/subjects/${selectedSubjectId}`,
          topic: `/api/topics/${selectedTopicId}`,
          questionText: questionText.trim(),
          options: filteredOptions,
          correctOption,
          solution: solution.trim() || null,
          difficulty,
          source,
          year: year ? parseInt(year) : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as ApiErrorResponse;
        throw new Error(err["hydra:description"] || err.message || "Save failed");
      }

      toast.success(editingId ? "Updated!" : "Created!");
      handleCancel();
      fetchQuestions();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question permanently?")) return;
    if (!token) return;

    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/questions/${id}`, token, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      fetchQuestions();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Delete failed");
    }
  };

  const handleEdit = (question: Question) => {
    setQuestionText(question.questionText);
    setOptions(question.options.length > 0 ? question.options : ["", "", "", ""]);
    setCorrectOption(question.correctOption);
    setSolution(question.solution || "");
    setDifficulty(question.difficulty);
    setSource(question.source);
    setYear(question.year ? question.year.toString() : "");
    setSelectedExamId(question.exam?.id ? question.exam.id.toString() : "");
    setSelectedSubjectId(question.subject?.id ? question.subject.id.toString() : "");
    setSelectedTopicId(question.topic?.id ? question.topic.id.toString() : "");
    setEditingId(question.id);
  };

  const handleCancel = () => {
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOption("");
    setSolution("");
    setDifficulty("");
    setSource("");
    setYear("");
    setSelectedExamId("");
    setSelectedSubjectId("");
    setSelectedTopicId("");
    setEditingId(null);
  };

  const filteredSubjects = selectedExamId 
    ? subjects.filter(s => s.exam.id === parseInt(selectedExamId))
    : subjects;

  const filteredTopics = selectedSubjectId
    ? topics.filter(t => t.subject.id === parseInt(selectedSubjectId))
    : topics;

  return (
    <DashboardLayout allowedRoles={["ROLE_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Questions</h1>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-lg mb-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedExamId} onValueChange={setSelectedExamId} required>
              <SelectTrigger>
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

            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} required disabled={!selectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTopicId} onValueChange={setSelectedTopicId} required disabled={!selectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {filteredTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id.toString()}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text..."
            required
            rows={3}
            className="w-full"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">Options</label>
              <Button type="button" size="sm" onClick={handleAddOption} variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-400"
                  disabled={options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={correctOption} onValueChange={setCorrectOption} required>
              <SelectTrigger>
                <SelectValue placeholder="Correct option" />
              </SelectTrigger>
              <SelectContent>
                {options.filter(opt => opt.trim()).map((opt, idx) => (
                  <SelectItem key={idx} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty} required>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={source} onValueChange={setSource} required>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="past">Past Question</SelectItem>
                <SelectItem value="ai">AI Generated</SelectItem>
                <SelectItem value="user">User Submitted</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year (optional)"
              min="1900"
              max="2100"
            />
          </div>

          <Textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Solution (optional)"
            rows={3}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {editingId ? "Update Question" : "Add Question"}
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
                <TableHead className="text-white">Question</TableHead>
                <TableHead className="text-white">Topic</TableHead>
                <TableHead className="text-white">Subject</TableHead>
                <TableHead className="text-white">Difficulty</TableHead>
                <TableHead className="text-white">Source</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No questions found. Add your first question above.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell className="text-white">{index + 1}</TableCell>
                    <TableCell className="text-white max-w-md truncate">
                      {question.questionText}
                    </TableCell>
                    <TableCell className="text-white">{question.topic.name || 'N/A'}</TableCell>
                    <TableCell className="text-white">{question.subject.name || 'N/A'}</TableCell>
                    <TableCell className="text-white capitalize">{question.difficulty}</TableCell>
                    <TableCell className="text-white capitalize">{question.source}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(question)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(question.id)}
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