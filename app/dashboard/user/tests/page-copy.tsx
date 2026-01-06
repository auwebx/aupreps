"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { toast } from "sonner";

import "katex/dist/katex.min.css";

// Helper function to check if content contains LaTeX
const containsLatex = (text: string): boolean => {
  if (!text) return false;
  const latexPatterns = [
    /\\\(.*?\\\)/, // inline math
    /\\\[.*?\\\]/, // display math
    /\\sqrt\{/, // square root
    /\\frac\{/, // fractions
    /\\int/, // integrals
    /\\sum/, // summation
    /\\prod/, // product
    /\\lim/, // limits
    /\\to/, // arrow
    /\^\{/, // superscript
    /_\{/, // subscript
    /\\[a-zA-Z]+\{/, // any LaTeX command
  ];
  return latexPatterns.some((pattern) => pattern.test(text));
};

// Check if content looks like math/science content
const isMathContent = (text: string): boolean => {
  if (!text) return false;

  const mathKeywords = [
    "sqrt",
    "root",
    "equation",
    "formula",
    "calculate",
    "solve",
    "derivative",
    "integral",
    "function",
    "variable",
    "algebra",
    "geometry",
    "trigonometry",
    "calculus",
    "proof",
    "theorem",
    "π",
    "theta",
    "sigma",
    "delta",
    "epsilon",
    "angle",
    "triangle",
    "circle",
    "square",
    "cube",
    "volume",
    "area",
    "perimeter",
    "radius",
    "diameter",
    "cos",
    "sin",
    "tan",
    "log",
    "ln",
    "exp",
    "exponential",
    "polynomial",
    "quadratic",
    "linear",
    "graph",
    "coordinate",
    "axis",
    "vector",
    "matrix",
  ];

  const lowerText = text.toLowerCase();
  return mathKeywords.some((keyword) => lowerText.includes(keyword));
};

// Get subject from question text
const getSubjectFromQuestion = (
  questionText: string,
  selectedSubjectName?: string
): string => {
  if (!questionText) return selectedSubjectName?.toLowerCase() || "unknown";

  const lowerQuestion = questionText.toLowerCase();

  if (selectedSubjectName) {
    const lowerSubject = selectedSubjectName.toLowerCase();
    if (
      lowerSubject.includes("math") ||
      lowerSubject.includes("physics") ||
      lowerSubject.includes("chemistry") ||
      lowerSubject.includes("engineering") ||
      lowerSubject.includes("science")
    ) {
      return "math";
    }
    if (
      lowerSubject.includes("english") ||
      lowerSubject.includes("literature") ||
      lowerSubject.includes("language")
    ) {
      return "english";
    }
    if (
      lowerSubject.includes("economics") ||
      lowerSubject.includes("business")
    ) {
      return "economics";
    }
    if (lowerSubject.includes("history") || lowerSubject.includes("social")) {
      return "history";
    }
  }

  // Fallback to content detection
  if (containsLatex(lowerQuestion) || isMathContent(lowerQuestion)) {
    return "math";
  }

  return selectedSubjectName?.toLowerCase() || "unknown";
};

// Safe LaTeX to HTML converter
const latexToHtml = (text: string): string => {
  if (!text) return text;

  return (
    text
      // Convert inline math \( \) with proper escaping
      .replace(/\\\((.+?)\\\)/g, (match, content) => {
        return `<span class="math-inline">${convertLatexContent(
          content
        )}</span>`;
      })
      // Convert display math \[ \]
      .replace(/\\\[(.+?)\\\]/g, (match, content) => {
        return `<div class="math-display">${convertLatexContent(
          content
        )}</div>`;
      })
      // Clean up any remaining LaTeX commands
      .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, "$1")
      .replace(/\\[a-zA-Z]+/g, "")
  );
};

const convertLatexContent = (content: string): string => {
  return (
    content
      // Handle square roots
      .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
      .replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, "$1√($2)")
      // Handle fractions
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
      // Convert Greek letters to readable names
      .replace(/\\alpha/g, "alpha")
      .replace(/\\beta/g, "beta")
      .replace(/\\gamma/g, "gamma")
      .replace(/\\pi/g, "pi")
      .replace(/\\theta/g, "theta")
      .replace(/\\sigma/g, "sigma")
      // Handle superscripts
      .replace(/\^\{([^}]+)\}/g, "^($1)")
      .replace(/\^(\w)/g, "^$1")
      // Handle subscripts
      .replace(/_\{([^}]+)\}/g, "_($1)")
      .replace(/_(\w)/g, "_$1")
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  );
};

// Create a new render function specifically for generated examples
const renderExampleContent = (content: string): React.ReactNode => {
  if (!content) return null;

  // Check if it's math content
  const isMath = containsLatex(content) || isMathContent(content);

  if (isMath) {
    // For math content, convert to readable text without HTML
    const readable = content
      .replace(/\\\((.+?)\\\)/g, (match, inner) => convertLatexContent(inner))
      .replace(/\\\[(.+?)\\\]/g, (match, inner) => convertLatexContent(inner))
      .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, "$1")
      .replace(/\\[a-zA-Z]+/g, "");

    return <span>{readable}</span>;
  }

  // For non-math content, just clean up LaTeX markers
  const cleaned = content
    .replace(/\\\((.+?)\\\)/g, "$1")
    .replace(/\\\[(.+?)\\\]/g, "$1")
    .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "");

  return <span>{cleaned}</span>;
};

// Main render function
const renderContent = (
  content: string,
  subjectHint?: string
): React.ReactNode => {
  if (!content) return null;

  const subject = getSubjectFromQuestion(content, subjectHint);
  const isMath =
    subject === "math" || containsLatex(content) || isMathContent(content);

  if (isMath) {
    const html = latexToHtml(content);
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // For non-math content, just clean up LaTeX markers
  const cleaned = content
    .replace(/\\\((.+?)\\\)/g, "$1")
    .replace(/\\\[(.+?)\\\]/g, "$1")
    .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "");

  return <span>{cleaned}</span>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// TYPES
interface Exam {
  id: number;
  name: string;
  year: number;
}

interface Subject {
  id: number;
  name: string;
  questionCount: number;
  exam?: Exam;
}

interface Topic {
  id: number;
  name: string;
}

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctOption: string;
  subject?: Subject;
  exam?: Exam;
  topic?: Topic;
}

interface PracticeTest {
  id: number;
  exam: Exam;
  subject: Subject;
  questions: Question[];
  score?: number;
  completedAt?: string;
}

interface AISolution {
  explanation: string;
  correctAnswer: string;
  reasoning: string;
  stepByStep?: string[];
}

interface TestSetup {
  numberOfQuestions: number;
  timeInMinutes: number;
}

interface TestResults {
  score: number;
  correct: number;
  total: number;
  timeTaken: number;
}

// API Response types
interface HydraResponse<T> {
  "hydra:member"?: T[];
  member?: T[];
}

interface ExamApiResponse {
  id: string | number;
  name: string;
  year: string | number;
  "@id"?: string;
}

interface SubjectApiResponse {
  id: string | number;
  name?: string;
  exam?:
    | string
    | {
        id: string | number;
        name: string;
        year: string | number;
        "@id"?: string;
      };
}

interface QuestionApiResponse {
  id: string | number;
  questionText?: string;
  options?: string[] | Record<string, string>;
  correctOption?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  subject?: string | { id: string | number; "@id"?: string };
  exam?: string | { id: string | number; "@id"?: string };
  topic?: string | { id: string | number; name?: string };
}

interface AIApiResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
}

interface ParsedAIContent {
  explanation?: string;
  correctAnswer?: string;
  reasoning?: string;
  stepByStep?: string[];
}

interface FinanceResponse {
  balance?: number;
}

interface DeductBalanceResponse {
  balance?: number;
  message?: string;
}

type ViewType = "exams" | "subjects" | "testSetup" | "test" | "results";

export default function PracticeTestApp() {
  const { token, user } = useAuth();
  const [view, setView] = useState<ViewType>("exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [practiceTest, setPracticeTest] = useState<PracticeTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [results, setResults] = useState<TestResults | null>(null);

  const [testSetup, setTestSetup] = useState<TestSetup>({
    numberOfQuestions: 10,
    timeInMinutes: 60,
  });

  const [aiSolutions, setAiSolutions] = useState<Record<number, AISolution>>(
    {}
  );
  const [loadingAI, setLoadingAI] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [checkingAnswer, setCheckingAnswer] = useState<Record<number, boolean>>(
    {}
  );
  const [answerChecked, setAnswerChecked] = useState<Record<number, boolean>>(
    {}
  );

  // Account balance state
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [fetchingBalance, setFetchingBalance] = useState(false);

  // Track free questions used
  const [freeQuestionsUsed, setFreeQuestionsUsed] = useState<number>(0);
  const FREE_QUESTIONS_LIMIT = 2;

  // Add these to your existing state declarations (around line 148-165)
  const [generatedExamples, setGeneratedExamples] = useState<
    Record<
      number,
      {
        question: string;
        answer: string;
        explanation: string;
        keyPoints: string[];
      }
    >
  >({});

  const [generatingExample, setGeneratingExample] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (token) {
      void fetchExams();
      void fetchAccountBalance();
      loadFreeQuestionsUsed();
    }
  }, [token]);

  useEffect(() => {
    if (view === "test" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && view === "test") {
      void handleSubmitTest();
    }
  }, [view, timeLeft]);

  // Load free questions used from localStorage
  const loadFreeQuestionsUsed = (): void => {
    try {
      const stored = localStorage.getItem(
        `freeQuestionsUsed_${user?.id ?? "unknown"}`
      );
      if (stored) {
        setFreeQuestionsUsed(parseInt(stored, 10));
      }
    } catch (error) {
      console.error("Error loading free questions count:", error);
    }
  };

  // Save free questions used to localStorage
  const saveFreeQuestionsUsed = (count: number): void => {
    try {
      localStorage.setItem(
        `freeQuestionsUsed_${user?.id ?? "unknown"}`,
        count.toString()
      );
      setFreeQuestionsUsed(count);
    } catch (error) {
      console.error("Error saving free questions count:", error);
    }
  };

  // Check if user can use free question
  const canUseFreeQuestion = (): boolean => {
    return freeQuestionsUsed < FREE_QUESTIONS_LIMIT;
  };

  // Increment free questions counter
  const incrementFreeQuestions = (): void => {
    const newCount = freeQuestionsUsed + 1;
    saveFreeQuestionsUsed(newCount);
  };

  // Fetch account balance
  const fetchAccountBalance = async (): Promise<void> => {
    if (!token) return;

    setFetchingBalance(true);
    try {
      const res = await api.authenticatedFetch(
        `${API_URL}/api/me/finance`,
        token,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch account balance");
      }

      const data = (await res.json()) as FinanceResponse;
      setAccountBalance(data.balance ?? 0);
    } catch (err) {
      console.error("fetchAccountBalance error:", err);
      toast.error("Failed to load account balance");
    } finally {
      setFetchingBalance(false);
    }
  };

  // Deduct balance from account (with free questions support)
  const deductBalance = async (
    amount: number,
    description: string
  ): Promise<boolean> => {
    if (!token) {
      toast.error("Please log in to continue");
      return false;
    }

    // Check if can use free question
    if (canUseFreeQuestion()) {
      incrementFreeQuestions();
      const remaining = FREE_QUESTIONS_LIMIT - freeQuestionsUsed - 1;
      toast.success(
        `Free question used! ${remaining} free question${
          remaining !== 1 ? "s" : ""
        } remaining.`,
        { duration: 3000 }
      );
      return true;
    }

    // Check if sufficient balance
    if (accountBalance < amount) {
      toast.error(
        `Insufficient balance! You need ₦${amount} but have ₦${accountBalance}. Please top up your account.`,
        {
          duration: 5000,
          action: {
            label: "Top Up",
            onClick: () =>
              (window.location.href = "/dashboard/user/subscription"),
          },
        }
      );
      return false;
    }

    try {
      const res = await api.authenticatedFetch(
        `${API_URL}/api/me/deduct-balance`,
        token,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ amount, description }),
        }
      );

      if (!res.ok) {
        const errorData = (await res
          .json()
          .catch(() => ({}))) as DeductBalanceResponse;
        throw new Error(errorData.message ?? "Failed to deduct balance");
      }

      const data = (await res.json()) as DeductBalanceResponse;
      setAccountBalance(data.balance ?? accountBalance - amount);
      toast.success(
        `₦${amount} deducted. New balance: ₦${
          data.balance ?? accountBalance - amount
        }`
      );
      return true;
    } catch (err) {
      console.error("deductBalance error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process payment";
      toast.error(errorMessage);
      return false;
    }
  };

  const fetchAISolution = async (
    question: Question,
    questionIndex: number
  ): Promise<void> => {
    if (!question) return;

    setLoadingAI((prev) => ({ ...prev, [questionIndex]: true }));

    try {
      console.log("Fetching AI solution for question:", questionIndex);

      const response = await fetch("/api/ai-solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: question.questionText,
          options: question.options,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "AI service endpoint not found. Please create /api/ai-solution route."
          );
        }

        const errorText = await response.text();
        console.error("AI API Error Response:", errorText.substring(0, 500));
        throw new Error(
          `AI service error (${response.status}): ${response.statusText}`
        );
      }

      const data = (await response.json()) as AIApiResponse;

      if (data.error) {
        throw new Error(data.error);
      }

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.warn("No content in AI response:", data);
        throw new Error("No explanation received from AI");
      }

      try {
        const parsed = JSON.parse(content) as ParsedAIContent;
        const aiSolution: AISolution = {
          explanation: parsed.explanation ?? content,
          correctAnswer: parsed.correctAnswer ?? "",
          reasoning: parsed.reasoning ?? "",
          stepByStep: parsed.stepByStep ?? [],
        };

        console.log(
          "Successfully parsed AI solution for question:",
          questionIndex
        );
        setAiSolutions((prev) => ({ ...prev, [questionIndex]: aiSolution }));
      } catch {
        console.warn(
          "AI response was not valid JSON, using raw content:",
          content.substring(0, 200)
        );
        const aiSolution: AISolution = {
          explanation: content,
          correctAnswer: "",
          reasoning: "",
          stepByStep: [],
        };

        setAiSolutions((prev) => ({ ...prev, [questionIndex]: aiSolution }));
      }

      setShowSolution((prev) => ({ ...prev, [questionIndex]: true }));
    } catch (error) {
      console.error("Error fetching AI solution:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const fallbackSolution: AISolution = {
        explanation: `Unable to fetch AI explanation: ${errorMessage}. Please check that the API route /api/ai-solution exists and your DeepSeek API key is configured.`,
        correctAnswer: "",
        reasoning: "",
        stepByStep: [],
      };

      setAiSolutions((prev) => ({
        ...prev,
        [questionIndex]: fallbackSolution,
      }));
      setShowSolution((prev) => ({ ...prev, [questionIndex]: true }));

      toast.error(
        "AI explanation temporarily unavailable. Showing basic feedback."
      );
    } finally {
      setLoadingAI((prev) => ({ ...prev, [questionIndex]: false }));
    }
  };

  const toggleSolution = async (questionIndex: number): Promise<void> => {
    // If already showing, just hide it
    if (showSolution[questionIndex]) {
      setShowSolution((prev) => ({ ...prev, [questionIndex]: false }));
      return;
    }

    // Check if we need to fetch AI solution
    if (!aiSolutions[questionIndex]) {
      // Deduct ₦20 for AI solution (or use free question)
      const success = await deductBalance(
        20,
        `AI Solution for Question ${questionIndex + 1}`
      );
      if (!success) {
        return;
      }

      // Fetch the solution
      await fetchAISolution(questions[questionIndex], questionIndex);
    } else {
      // Solution already fetched, just show it
      setShowSolution((prev) => ({ ...prev, [questionIndex]: true }));
    }
  };

  const checkAnswer = async (questionIndex: number): Promise<void> => {
    const question = questions[questionIndex];
    const userAnswer = answers[questionIndex];

    if (!userAnswer) {
      toast.error("Please select an answer first");
      return;
    }

    // Check if already checked
    if (answerChecked[questionIndex]) {
      toast.info("You've already checked this answer");
      return;
    }

    // Deduct ₦15 for checking answer (or use free question)
    const success = await deductBalance(
      15,
      `Check Answer for Question ${questionIndex + 1}`
    );
    if (!success) {
      return;
    }

    setCheckingAnswer((prev) => ({ ...prev, [questionIndex]: true }));

    setTimeout(() => {
      const isCorrect = userAnswer === question.correctOption;
      setAnswerChecked((prev) => ({ ...prev, [questionIndex]: true }));

      toast.success(
        isCorrect
          ? "Correct! Well done!"
          : "Not quite. Check the explanation for details."
      );

      setCheckingAnswer((prev) => ({ ...prev, [questionIndex]: false }));

      if (!isCorrect && !showSolution[questionIndex]) {
        // Auto-show solution if wrong
        if (!aiSolutions[questionIndex]) {
          void fetchAISolution(questions[questionIndex], questionIndex);
        } else {
          setShowSolution((prev) => ({ ...prev, [questionIndex]: true }));
        }
      }
    }, 500);
  };

  const generateAnotherExample = async (
    questionIndex: number
  ): Promise<void> => {
    const question = questions[questionIndex];

    // Set loading state
    setGeneratingExample((prev) => ({ ...prev, [questionIndex]: true }));

    try {
      // First deduct balance (or use free question)
      const success = await deductBalance(
        20,
        `Generate another example for Question ${questionIndex + 1}`
      );

      if (!success) {
        setGeneratingExample((prev) => ({ ...prev, [questionIndex]: false }));
        return;
      }

      // Prepare prompt for AI
      // Update the AI prompt in the generateAnotherExample function for better structured responses
      const prompt = `Generate another example question on the same topic as this question to help students learn better:

ORIGINAL QUESTION CONTEXT:
Question: ${question.questionText}
Topic: ${question.topic?.name || "General"}
Subject: ${selectedSubject?.name || "Unknown"}
Exam: ${selectedExam?.name || "Unknown"}

INSTRUCTIONS FOR NEW EXAMPLE:
1. Create a NEW multiple-choice question on the SAME TOPIC but different scenario
2. Make it CLEAR and EDUCATIONAL (not trick questions)
3. Provide a CLEAR CORRECT ANSWER
4. Explain WHY it's correct in simple terms
5. List 3-4 KEY LEARNING POINTS students should remember

FORMAT YOUR RESPONSE AS JSON with these EXACT keys:
{
  "question": "The new question text here...",
  "answer": "The correct answer option text (not just A/B/C/D)",
  "explanation": "Simple, clear explanation why this answer is correct. Break down the reasoning.",
  "keyPoints": [
    "First key concept to remember",
    "Second important point",
    "Third learning objective"
  ]
}

IMPORTANT: Focus on making the explanation EASY TO UNDERSTAND for learners.`;

      // Call AI API to generate example
      const response = await fetch("/api/ai-solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: prompt,
          options: [], // No options needed for this request
          generateExample: true, // Flag to indicate this is for generating example
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate example");
      }

      const data = (await response.json()) as AIApiResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from AI");
      }

      try {
        // Parse the AI response
        const parsed = JSON.parse(content) as {
          question?: string;
          answer?: string;
          explanation?: string;
          keyPoints?: string[];
        };

        // Ensure we have required fields, provide defaults if missing
        const generatedExample = {
          question:
            parsed.question ||
            `Another example on ${
              question.topic?.name || "this topic"
            }: Apply the same concept to a different situation.`,
          answer:
            parsed.answer ||
            "The correct approach involves applying the core principles.",
          explanation:
            parsed.explanation ||
            "This demonstrates how the same concept applies in different contexts.",
          keyPoints: parsed.keyPoints?.filter(Boolean) || [
            "Master the core concept first",
            "Practice with variations",
            "Understand the 'why' behind answers",
          ],
        };

        // Update state with generated example
        setGeneratedExamples((prev) => ({
          ...prev,
          [questionIndex]: generatedExample,
        }));

        toast.success("Practice example generated! Study the breakdown below.");
      } catch {
        // If JSON parsing fails, create a more structured fallback
        const generatedExample = {
          question: `Practice applying ${
            question.topic?.name || "this concept"
          }: ${content.substring(0, 150)}...`,
          answer:
            "Study the explanation below to understand the correct approach.",
          explanation: content,
          keyPoints: [
            "Break down complex problems into steps",
            "Look for patterns in similar questions",
            "Always verify your understanding",
          ],
        };

        setGeneratedExamples((prev) => ({
          ...prev,
          [questionIndex]: generatedExample,
        }));
      }
    } catch (error) {
      console.error("Error generating example:", error);
      toast.error("Failed to generate example. Please try again.");

      // Create a simple fallback example using current question data
      const fallbackExample = {
        question: `Another example: How would you apply the same concept from the previous question in a different scenario?`,
        answer:
          "The correct approach would be similar, focusing on the core principles of the topic.",
        explanation:
          "This topic requires understanding of fundamental principles. Practice with different scenarios to master the concept.",
        keyPoints: [
          "Understand the core concept",
          "Apply to different scenarios",
          "Practice regularly",
        ],
      };

      setGeneratedExamples((prev) => ({
        ...prev,
        [questionIndex]: fallbackExample,
      }));
    } finally {
      setGeneratingExample((prev) => ({ ...prev, [questionIndex]: false }));
    }
  };

  // Helper function to regenerate example


  const regenerateExample = async (questionIndex: number): Promise<void> => {
    // Clear existing example first
    setGeneratedExamples((prev) => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });

    // Generate new example
    await generateAnotherExample(questionIndex);
  };

  const fetchExams = async (): Promise<void> => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.authenticatedFetch(`${API_URL}/api/exams`, token, {
        headers: { Accept: "application/ld+json" },
      });

      if (!res.ok) throw new Error("Failed to load exams");

      const data = (await res.json()) as
        | ExamApiResponse[]
        | HydraResponse<ExamApiResponse>;
      const list: ExamApiResponse[] = Array.isArray(data)
        ? data
        : data?.["hydra:member"] ?? data?.member ?? [];

      setExams(
        list.map((e) => ({
          id: Number(e.id),
          name: e.name,
          year: Number(e.year),
        }))
      );
    } catch (err) {
      console.error("fetchExams error:", err);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (exam: Exam): Promise<void> => {
    if (!token) {
      toast.error("Please log in to view subjects");
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching subjects for exam: ${exam.name} (ID: ${exam.id})`);

      const subjectsRes = await api.authenticatedFetch(
        `${API_URL}/api/subjects`,
        token,
        { headers: { Accept: "application/ld+json" } }
      );

      if (!subjectsRes.ok) throw new Error("Failed to load subjects");

      const subjectsData = (await subjectsRes.json()) as
        | SubjectApiResponse[]
        | HydraResponse<SubjectApiResponse>;
      const allSubjects: SubjectApiResponse[] = Array.isArray(subjectsData)
        ? subjectsData
        : subjectsData?.["hydra:member"] ?? subjectsData?.member ?? [];

      console.log(`Total subjects in system: ${allSubjects.length}`);

      const filteredSubjects = await Promise.all(
        allSubjects.map(async (subject): Promise<Subject | null> => {
          let subjectExam: Exam | null = null;

          if (subject.exam) {
            if (typeof subject.exam === "string") {
              try {
                const examRes = await api.authenticatedFetch(
                  `${API_URL}${subject.exam}`,
                  token,
                  { headers: { Accept: "application/ld+json" } }
                );
                if (examRes.ok) {
                  const examData = (await examRes.json()) as ExamApiResponse;
                  subjectExam = {
                    id: Number(examData.id),
                    name: examData.name,
                    year: Number(examData.year),
                  };
                }
              } catch (e) {
                console.error("Error fetching exam:", e);
              }
            } else {
              subjectExam = {
                id: Number(subject.exam.id),
                name: subject.exam.name,
                year: Number(subject.exam.year),
              };
            }
          }

          if (!subjectExam || subjectExam.id !== exam.id) {
            return null;
          }

          console.log(
            `Subject ${subject.name ?? "Unknown"} belongs to exam ${exam.name}`
          );

          const questionsRes = await api.authenticatedFetch(
            `${API_URL}/api/questions?exam.id=${exam.id}&subject.id=${subject.id}`,
            token,
            { headers: { Accept: "application/ld+json" } }
          );

          let questionCount = 0;
          if (questionsRes.ok) {
            const questionsData = (await questionsRes.json()) as
              | QuestionApiResponse[]
              | HydraResponse<QuestionApiResponse>;
            const questionsList: QuestionApiResponse[] = Array.isArray(
              questionsData
            )
              ? questionsData
              : questionsData?.["hydra:member"] ?? questionsData?.member ?? [];
            questionCount = questionsList.length;
          }

          return {
            id: Number(subject.id),
            name: subject.name ?? "Unnamed Subject",
            questionCount,
            exam: {
              id: Number(exam.id),
              name: exam.name,
              year: exam.year,
            },
          };
        })
      );

      const validSubjects = filteredSubjects
        .filter((subject): subject is Subject => subject !== null)
        .filter((subject) => subject.questionCount > 0);

      console.log(
        `Found ${validSubjects.length} subjects with questions for exam ${exam.name}:`,
        validSubjects.map((s) => `${s.name} (${s.questionCount} questions)`)
      );

      setSubjects(validSubjects);
      setSelectedExam(exam);
      setView("subjects");
    } catch (err) {
      console.error("fetchSubjects error:", err);
      toast.error("Failed to load subjects");
      setView("exams");
    } finally {
      setLoading(false);
    }
  };

  const showTestSetup = (subject: Subject): void => {
    setSelectedSubject(subject);

    const maxQuestions = Math.min(subject.questionCount, 100);
    const defaultQuestions = Math.min(60, maxQuestions);

    setTestSetup({
      numberOfQuestions: defaultQuestions,
      timeInMinutes: 60,
    });

    setView("testSetup");
  };

  const startTest = async (): Promise<void> => {
    if (!token || !user || !selectedSubject || !selectedSubject.exam) {
      toast.error("Please log in to take a test");
      return;
    }

    if (testSetup.numberOfQuestions < 1) {
      toast.error("Please select at least 1 question");
      return;
    }

    if (testSetup.timeInMinutes < 1) {
      toast.error("Time must be at least 1 minute");
      return;
    }

    setLoading(true);
    try {
      console.log(
        `Starting test for subject: ${selectedSubject.name} (ID: ${selectedSubject.id}), Exam: ${selectedSubject.exam.name} (ID: ${selectedSubject.exam.id})`
      );
      console.log(
        `Test setup: ${testSetup.numberOfQuestions} questions, ${testSetup.timeInMinutes} minutes`
      );

      // Fetch ALL questions first
      const questionsRes = await api.authenticatedFetch(
        `${API_URL}/api/questions`,
        token,
        { headers: { Accept: "application/ld+json" } }
      );

      if (!questionsRes.ok) {
        console.error("Questions API error:", await questionsRes.text());
        throw new Error("Failed to load questions");
      }

      const questionsData = (await questionsRes.json()) as
        | QuestionApiResponse[]
        | HydraResponse<QuestionApiResponse>;
      const allQuestions: QuestionApiResponse[] = Array.isArray(questionsData)
        ? questionsData
        : questionsData?.["hydra:member"] ?? questionsData?.member ?? [];

      console.log(`Total questions fetched from API: ${allQuestions.length}`);

      // Filter questions by BOTH exam ID AND subject ID
      const filteredQuestions = allQuestions.filter((q) => {
        // Extract exam ID from question
        let questionExamId: number | null = null;
        if (q.exam) {
          if (typeof q.exam === "string") {
            const examIdMatch = q.exam.match(/\/(\d+)$/);
            questionExamId = examIdMatch ? parseInt(examIdMatch[1]) : null;
          } else if (q.exam["@id"]) {
            const examIdMatch = q.exam["@id"].match(/\/(\d+)$/);
            questionExamId = examIdMatch ? parseInt(examIdMatch[1]) : null;
          } else if (q.exam.id) {
            questionExamId = parseInt(String(q.exam.id));
          }
        }

        // Extract subject ID from question
        let questionSubjectId: number | null = null;
        if (q.subject) {
          if (typeof q.subject === "string") {
            const subjectIdMatch = q.subject.match(/\/(\d+)$/);
            questionSubjectId = subjectIdMatch
              ? parseInt(subjectIdMatch[1])
              : null;
          } else if (q.subject["@id"]) {
            const subjectIdMatch = q.subject["@id"].match(/\/(\d+)$/);
            questionSubjectId = subjectIdMatch
              ? parseInt(subjectIdMatch[1])
              : null;
          } else if (q.subject.id) {
            questionSubjectId = parseInt(String(q.subject.id));
          }
        }

        const examMatches = questionExamId === selectedSubject.exam!.id;
        const subjectMatches = questionSubjectId === selectedSubject.id;

        if (examMatches && subjectMatches) {
          console.log(
            `✓ Question ${q.id} matches: Exam ${questionExamId}, Subject ${questionSubjectId}`
          );
        }

        return examMatches && subjectMatches;
      });

      console.log(
        `Filtered to ${filteredQuestions.length} questions for ${selectedSubject.name} (Subject ID: ${selectedSubject.id}) in ${selectedSubject.exam.name} (Exam ID: ${selectedSubject.exam.id})`
      );

      if (filteredQuestions.length === 0) {
        toast.error(`No questions available for ${selectedSubject.name}`);
        setLoading(false);
        return;
      }

      const maxQuestions = Math.min(
        testSetup.numberOfQuestions,
        filteredQuestions.length
      );
      if (maxQuestions < testSetup.numberOfQuestions) {
        toast.info(
          `Only ${maxQuestions} questions available. Starting with ${maxQuestions} questions.`
        );
      }

      const loadedQuestions: Question[] = [];

      const shuffledQuestions = [...filteredQuestions].sort(
        () => Math.random() - 0.5
      );
      const selectedQuestions = shuffledQuestions.slice(0, maxQuestions);

      console.log(
        `Selected ${selectedQuestions.length} questions after shuffling`
      );

      for (const q of selectedQuestions) {
        let opts: string[] = [];

        if (Array.isArray(q.options)) {
          opts = q.options;
        } else if (typeof q.options === "object" && q.options !== null) {
          const optionsObj = q.options as Record<string, string>;
          if (optionsObj.A) opts.push(optionsObj.A);
          if (optionsObj.B) opts.push(optionsObj.B);
          if (optionsObj.C) opts.push(optionsObj.C);
          if (optionsObj.D) opts.push(optionsObj.D);
          if (optionsObj.E) opts.push(optionsObj.E);
          if (optionsObj.F) opts.push(optionsObj.F);
        }

        if (opts.length === 0) {
          if (q.optionA) opts.push(q.optionA);
          if (q.optionB) opts.push(q.optionB);
          if (q.optionC) opts.push(q.optionC);
          if (q.optionD) opts.push(q.optionD);
        }

        let correctText = "";

        if (
          typeof q.correctOption === "string" &&
          q.correctOption.length === 1
        ) {
          const index = q.correctOption.toUpperCase().charCodeAt(0) - 65;
          correctText = opts[index] ?? q.correctOption;
        } else {
          correctText = q.correctOption ?? "";
        }

        let topicData: Topic | undefined = undefined;
        if (q.topic) {
          if (typeof q.topic === "string") {
            topicData = { id: 0, name: "Topic" };
          } else {
            topicData = {
              id: Number(q.topic.id) || 0,
              name: q.topic.name ?? "Topic",
            };
          }
        }

        loadedQuestions.push({
          id: Number(q.id),
          questionText: q.questionText ?? "",
          options: opts,
          correctOption: correctText,
          subject: {
            id: selectedSubject.id,
            name: selectedSubject.name,
            questionCount: selectedSubject.questionCount,
          },
          exam: selectedSubject.exam,
          topic: topicData,
        });
      }

      if (loadedQuestions.length === 0) {
        toast.error("No valid questions available for this subject");
        setLoading(false);
        return;
      }

      const questionIRIs = loadedQuestions.map((q) => `/api/questions/${q.id}`);

      const createRes = await api.authenticatedFetch(
        `${API_URL}/api/practice_tests`,
        token,
        {
          method: "POST",
          headers: { "Content-Type": "application/ld+json" },
          body: JSON.stringify({
            exam: `/api/exams/${selectedSubject.exam.id}`,
            user: `/api/users/${user.id}`,
            questions: questionIRIs,
            subject: `/api/subjects/${selectedSubject.id}`,
          }),
        }
      );

      if (!createRes.ok) {
        const err = (await createRes.json().catch(() => ({}))) as {
          "hydra:description"?: string;
        };
        throw new Error(err?.["hydra:description"] ?? "Failed to start test");
      }

      const createdTest = (await createRes.json()) as {
        id?: string | number;
        "@id"?: string;
      };

      setPracticeTest({
        id: Number(createdTest.id ?? createdTest["@id"]?.split("/").pop() ?? 0),
        exam: selectedSubject.exam,
        subject: selectedSubject,
        questions: loadedQuestions,
      });

      setQuestions(loadedQuestions);
      setTimeLeft(testSetup.timeInMinutes * 60);
      setAnswers({});
      setCurrentQuestion(0);
      setView("test");

      setAiSolutions({});
      setLoadingAI({});
      setShowSolution({});
      setCheckingAnswer({});
      setAnswerChecked({});

      toast.success(`Practice test started for ${selectedSubject.name}!`);
    } catch (err) {
      console.error("startTest error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start test";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionText: string): void => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionText }));
    setAnswerChecked((prev) => ({ ...prev, [currentQuestion]: false }));
  };

  const handleSubmitTest = async (): Promise<void> => {
    if (!practiceTest || !token || !user) {
      toast.error("Missing required information to submit test");
      return;
    }

    // Deduct ₦25 for submitting test (or use free question)
    const success = await deductBalance(
      25,
      `Submit Test: ${selectedSubject?.name ?? "Unknown"}`
    );
    if (!success) {
      return;
    }

    setLoading(true);

    let correct = 0;
    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (
        userAnswer &&
        q.correctOption &&
        userAnswer.trim() === q.correctOption.trim()
      ) {
        correct++;
      }
    });

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;

    try {
      console.log("Attempting to save test results...", {
        practiceTestId: practiceTest.id,
        score,
        correct,
        total: questions.length,
      });

      const updateRes = await api.authenticatedFetch(
        `${API_URL}/api/practice_tests/${practiceTest.id}`,
        token,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Accept: "application/ld+json",
          },
          body: JSON.stringify({
            score,
            completedAt: new Date().toISOString(),
          }),
        }
      );

      if (!updateRes.ok) {
        let errorMessage = "Failed to save test results";
        try {
          const errorText = await updateRes.text();
          console.error("Update error raw response:", errorText);

          try {
            const errorData = JSON.parse(errorText) as {
              "hydra:description"?: string;
              detail?: string;
              message?: string;
            };
            if (errorData?.["hydra:description"]) {
              errorMessage = errorData["hydra:description"];
            } else if (errorData?.detail) {
              errorMessage = errorData.detail;
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            }
          } catch {
            errorMessage = `Server error (${
              updateRes.status
            }): ${errorText.substring(0, 100)}`;
          }
        } catch (e) {
          console.warn("Could not parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      console.log("Practice test score saved successfully:", score);
      toast.success("Test completed and saved!");

      const submissionPromises = questions.map(async (q, idx) => {
        const userAnswer = answers[idx] ?? "";
        const isCorrect = userAnswer.trim() === q.correctOption.trim();

        try {
          const submissionResponse = await api.authenticatedFetch(
            `${API_URL}/api/test_submissions`,
            token,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/ld+json",
                Accept: "application/ld+json",
              },
              body: JSON.stringify({
                practiceTest: `/api/practice_tests/${practiceTest.id}`,
                question: `/api/questions/${q.id}`,
                userAnswer: userAnswer,
                isCorrect: isCorrect,
              }),
            }
          );

          if (!submissionResponse.ok) {
            const errorText = await submissionResponse.text();
            console.warn(
              `Failed to save submission for question ${idx}:`,
              errorText
            );
            return { success: false, questionId: q.id };
          }

          return { success: true, questionId: q.id };
        } catch (submissionError) {
          console.error(
            `Error saving submission for question ${idx}:`,
            submissionError
          );
          return { success: false, questionId: q.id, error: submissionError };
        }
      });

      const submissionResults = await Promise.allSettled(submissionPromises);

      const successfulSubmissions = submissionResults.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;

      console.log(
        `Saved ${successfulSubmissions}/${questions.length} question submissions`
      );

      if (successfulSubmissions < questions.length) {
        console.warn(
          `Some submissions failed. Success: ${successfulSubmissions}/${questions.length}`
        );
      }
    } catch (err) {
      console.error("handleSubmitTest error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("Failed to save test results")) {
        toast.error("Could not save results to server (showing local results)");
      } else if (
        errorMessage.includes("Network") ||
        errorMessage.includes("fetch")
      ) {
        toast.error("Network error. Check your connection and try again.");
      } else {
        toast.error(
          errorMessage || "Could not save results (showing local results)"
        );
      }

      console.log("Showing local results despite save error");
    } finally {
      setResults({
        score,
        correct,
        total: questions.length,
        timeTaken: testSetup.timeInMinutes * 60 - timeLeft,
      });

      setView("results");
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTest = (): void => {
    setView("exams");
    setSelectedExam(null);
    setSelectedSubject(null);
    setSubjects([]);
    setQuestions([]);
    setPracticeTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(3600);
    setResults(null);
    setAiSolutions({});
    setLoadingAI({});
    setShowSolution({});
    setCheckingAnswer({});
    setAnswerChecked({});
    setTestSetup({
      numberOfQuestions: 10,
      timeInMinutes: 60,
    });
  };

  const goBackToSubjects = (): void => {
    setView("subjects");
  };

  const goBackToExams = (): void => {
    setView("exams");
  };

  // Test Setup View
  if (view === "testSetup" && selectedSubject) {
    const maxQuestions = Math.min(selectedSubject.questionCount, 50);
    const isQuestionsValid =
      testSetup.numberOfQuestions >= 1 &&
      testSetup.numberOfQuestions <= maxQuestions;
    const isTimeValid =
      testSetup.timeInMinutes >= 1 && testSetup.timeInMinutes <= 240;

    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <button
              onClick={goBackToSubjects}
              className="mb-6 bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all border border-gray-300 shadow-md"
            >
              ← Back to Subjects
            </button>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mb-3">
              Test Setup
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Customize your practice test for {selectedSubject?.name}
            </p>

            <button
              onClick={() => (window.location.href = "/dashboard/user")}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-medium hover:scale-105 transition-transform shadow-md mt-4"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Questions
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max={maxQuestions}
                    value={testSetup.numberOfQuestions}
                    onChange={(e) =>
                      setTestSetup({
                        ...testSetup,
                        numberOfQuestions: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-bold text-green-700 min-w-[60px]">
                    {testSetup.numberOfQuestions}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select between 1 and {maxQuestions} questions (Available:{" "}
                  {selectedSubject.questionCount})
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Limit (Minutes)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="5"
                    max="240"
                    step="5"
                    value={testSetup.timeInMinutes}
                    onChange={(e) =>
                      setTestSetup({
                        ...testSetup,
                        timeInMinutes: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-bold text-green-700 min-w-[60px]">
                    {testSetup.timeInMinutes} min
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>5 min</span>
                  <span>Quick</span>
                  <span>Standard (60 min)</span>
                  <span>Extended (240 min)</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Test Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-green-300">
                    <div className="text-2xl font-bold text-green-700">
                      {testSetup.numberOfQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-green-300">
                    <div className="text-2xl font-bold text-green-700">
                      {testSetup.timeInMinutes}
                    </div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Approximately{" "}
                  {Math.round(
                    testSetup.timeInMinutes / testSetup.numberOfQuestions
                  )}{" "}
                  minutes per question
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={goBackToSubjects}
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all border border-gray-300 shadow-md"
            >
              Cancel
            </button>

            <button
              onClick={() => void startTest()}
              disabled={loading || !isQuestionsValid || !isTimeValid}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Starting Test...
                </>
              ) : (
                "Start Practice Test"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "exams") {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-green-900 mb-4">
              Practice Tests
            </h1>
            <p className="text-xl text-gray-600">
              Choose an exam to view subjects
            </p>

            <button
              onClick={() => (window.location.href = "/dashboard/user")}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-md mt-4"
            >
              Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-green-300 border-t-green-700 rounded-full animate-spin" />
              <p className="text-green-800 mt-4 font-semibold">
                Loading exams...
              </p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xl">
              <p className="text-gray-700 text-xl">
                No exams available. Please add exams in the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-8 hover:scale-[1.03] transition-all cursor-pointer border border-gray-200 hover:border-green-400 shadow-lg"
                  onClick={() => void fetchSubjects(exam)}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">📚</span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      {exam.name}
                    </h3>
                    <p className="text-green-600 mb-4 font-semibold">
                      {exam.year}
                    </p>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-md">
                      View Subjects
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "subjects") {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <button
              onClick={goBackToExams}
              className="mb-6 bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all border border-gray-300 shadow-md"
            >
              ← Back to Exams
            </button>
            <h1 className="text-5xl font-bold text-green-900 mb-4">
              {selectedExam?.name} {selectedExam?.year}
            </h1>
            <p className="text-xl text-gray-600">
              Choose a subject to start practicing
            </p>

            <button
              onClick={() => (window.location.href = "/dashboard/user")}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-md mt-4"
            >
              Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-green-300 border-t-green-700 rounded-full animate-spin" />
              <p className="text-green-800 mt-4 font-semibold">
                Loading subjects...
              </p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xl">
              <p className="text-gray-700 text-xl mb-6">
                No subjects with questions available for this exam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goBackToExams}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-md"
                >
                  Back to Exams
                </button>
                <button
                  onClick={() =>
                    selectedExam && void fetchSubjects(selectedExam)
                  }
                  className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all border border-gray-300 shadow-md"
                >
                  Refresh Subjects
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  Subjects Overview
                </h2>
                <p className="text-gray-700">
                  Total Subjects with Questions:{" "}
                  <span className="text-green-700 font-semibold">
                    {subjects.length}
                  </span>{" "}
                  • Total Available Questions:{" "}
                  <span className="text-green-700 font-semibold">
                    {subjects.reduce(
                      (sum, subject) => sum + subject.questionCount,
                      0
                    )}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-2xl p-8 transition-all border border-gray-200 hover:border-green-400 cursor-pointer hover:scale-[1.03] shadow-lg"
                    onClick={() => showTestSetup(subject)}
                  >
                    <div className="text-center">
                      <div
                        className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md ${
                          subject.questionCount < 10
                            ? "bg-yellow-500"
                            : subject.questionCount < 20
                            ? "bg-green-500"
                            : "bg-green-600"
                        }`}
                      >
                        <span className="text-4xl">
                          {subject.questionCount < 10
                            ? "📘"
                            : subject.questionCount < 20
                            ? "📗"
                            : "📙"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        {subject.name}
                      </h3>
                      <div className="mb-4">
                        <span
                          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold border ${
                            subject.questionCount < 5
                              ? "bg-red-100 text-red-700 border-red-300"
                              : subject.questionCount < 10
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : subject.questionCount < 20
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-green-200 text-green-800 border-green-400"
                          }`}
                        >
                          {subject.questionCount} question
                          {subject.questionCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <button
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 shadow-md"
                      >
                        Start Practice Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render test view or results view (code continues with UI)...

  if (view === "test" && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentAiSolution = aiSolutions[currentQuestion];
    const currentLoadingAI = loadingAI[currentQuestion] || false;
    const currentShowSolution = showSolution[currentQuestion] || false;
    const currentCheckingAnswer = checkingAnswer[currentQuestion] || false;
    const currentAnswerChecked = answerChecked[currentQuestion] || false;

    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 border border-gray-200 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <button
                  onClick={goBackToSubjects}
                  className="mb-3 bg-gray-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all border border-gray-300"
                >
                  ← Back to Subjects
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-green-800">
                  {selectedExam?.name} {selectedExam?.year} –{" "}
                  {selectedSubject?.name}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Question {currentQuestion + 1} of {questions.length}
                  {question.topic && ` • Topic: ${question.topic.name}`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Account Balance */}
                <div className="text-left sm:text-right bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">
                    Account Balance
                  </div>
                  <div className="text-xl font-bold text-green-700 flex items-center gap-2">
                    ₦{accountBalance.toLocaleString()}
                    {fetchingBalance && (
                      <div className="w-4 h-4 border-2 border-green-300 border-t-green-700 rounded-full animate-spin" />
                    )}
                  </div>
                  <button
                    onClick={() =>
                      (window.location.href = "/dashboard/user/subscription")
                    }
                    className="text-xs text-green-600 hover:text-green-700 underline mt-1"
                  >
                    Top Up
                  </button>
                  {/* NEW: Show free questions remaining */}
                  {freeQuestionsUsed < FREE_QUESTIONS_LIMIT && (
                    <div className="text-xs text-blue-600 font-semibold mt-2">
                      🎁 {FREE_QUESTIONS_LIMIT - freeQuestionsUsed} free
                      questions left
                    </div>
                  )}
                </div>
                {/* Timer */}
                <div className="text-left sm:text-right">
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${
                      timeLeft < 300 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-gray-500 text-sm">Time Remaining</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border border-gray-200 shadow-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">
              {question.questionText}
            </h3>

            <div className="space-y-3 mb-6">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                    answers[currentQuestion] === option
                      ? "bg-green-600 text-white border-green-700 shadow-md"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-green-400"
                  }`}
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Generated Example Section - Add this before the AI Solution section */}
            {generatedExamples[currentQuestion] && (
              <div className="mt-8 pt-6 border-t border-gray-200 border-dashed">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-linear-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Another Example (Same Topic)
                    </h4>
                  </div>
                  <button
                    onClick={() => regenerateExample(currentQuestion)}
                    disabled={generatingExample[currentQuestion]}
                    className="text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                  >
                    {generatingExample[currentQuestion] ? (
                      <>
                        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Generate New
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Example Question Section */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">Q</span>
                      </div>
                      <h5 className="font-semibold text-amber-800">
                        Try This Example Question:
                      </h5>
                    </div>
                    <div className="text-gray-700 pl-2 ml-8">
                      {renderExampleContent(
                        generatedExamples[currentQuestion].question
                      )}
                    </div>
                  </div>

                  {/* Answer Section - Broken Down for Better Learning */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">A</span>
                      </div>
                      <h5 className="font-semibold text-green-800">
                        Answer & Explanation:
                      </h5>
                    </div>

                    {/* 1. The Correct Answer (Clear and Prominent) */}
                    <div className="mb-4 pl-2 ml-8">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h6 className="font-semibold text-green-700">
                          Correct Answer:
                        </h6>
                      </div>
                      <div className="text-gray-700 font-medium ml-7">
                        {renderExampleContent(
                          generatedExamples[currentQuestion].answer
                        )}
                      </div>
                    </div>

                    {/* 2. Why This is Correct (Explanation) */}
                    {generatedExamples[currentQuestion].explanation && (
                      <div className="mb-4 pl-2 ml-8">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              ?
                            </span>
                          </div>
                          <h6 className="font-semibold text-blue-700">
                            Why This is Correct:
                          </h6>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-100 ml-7">
                          <div className="text-gray-700">
                            {renderExampleContent(
                              generatedExamples[currentQuestion].explanation
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. How to Approach This Type of Question */}
                    <div className="pl-2 ml-8">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <h6 className="font-semibold text-purple-700">
                          Problem-Solving Approach:
                        </h6>
                      </div>
                      <ul className="space-y-2 ml-7">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">
                            Read the question carefully and identify key terms
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">
                            Apply the core concept learned from the topic
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">
                            Eliminate obviously wrong options first
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">
                            Double-check your reasoning before finalizing
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Key Learning Points Section - Enhanced with Icons */}
                  {generatedExamples[currentQuestion].keyPoints &&
                    generatedExamples[currentQuestion].keyPoints.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h5 className="font-semibold text-blue-800">
                            Key Learning Points:
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 ml-8">
                          {generatedExamples[currentQuestion].keyPoints.map(
                            (point, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-100"
                              >
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-blue-600">
                                    {idx + 1}
                                  </span>
                                </div>
                                <div>
                                  <h6 className="font-medium text-blue-700 mb-1">
                                    Point {idx + 1}
                                  </h6>
                                  <div className="text-gray-700 text-sm">
                                    {renderExampleContent(point)}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {currentShowSolution && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    AI Explanation
                  </h4>
                </div>

                {currentLoadingAI ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    <span className="ml-3 text-gray-600">
                      Generating explanation...
                    </span>
                  </div>
                ) : currentAiSolution ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">
                        Explanation:
                      </h5>
                      <div className="text-gray-700 whitespace-pre-line">
                        {renderContent(
                          currentAiSolution.explanation,
                          selectedSubject?.name
                        )}
                      </div>
                    </div>

                    {currentAiSolution.reasoning && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h5 className="font-semibold text-green-800 mb-2">
                          Step-by-step reasoning:
                        </h5>
                        <div className="text-gray-700 whitespace-pre-line">
                          {renderContent(
                            currentAiSolution.reasoning,
                            selectedSubject?.name
                          )}
                        </div>
                      </div>
                    )}

                    {currentAiSolution.stepByStep &&
                      currentAiSolution.stepByStep.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                          <h5 className="font-semibold text-purple-800 mb-2">
                            Detailed Steps:
                          </h5>
                          <ul className="space-y-2">
                            {currentAiSolution.stepByStep.map((step, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-2 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="text-gray-700">
                                  {renderContent(step, selectedSubject?.name)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {currentAiSolution.correctAnswer && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">
                          Correct Answer:
                        </h5>
                        <div className="text-lg font-bold text-green-700">
                          {renderContent(
                            currentAiSolution.correctAnswer,
                            selectedSubject?.name
                          )}
                        </div>
                        {currentAnswerChecked && answers[currentQuestion] && (
                          <div
                            className={`mt-3 p-3 rounded-lg ${
                              answers[currentQuestion] ===
                              question.correctOption
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {answers[currentQuestion] === question.correctOption
                              ? "✓ Your answer is correct!"
                              : "✗ Your answer is incorrect. The correct answer is shown above."}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Failed to load explanation. Please try again.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => checkAnswer(currentQuestion)}
              disabled={
                !answers[currentQuestion] ||
                currentCheckingAnswer ||
                answerChecked[currentQuestion]
              }
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              title={
                freeQuestionsUsed < FREE_QUESTIONS_LIMIT ? "Free" : "Cost: ₦15"
              }
            >
              {currentCheckingAnswer ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking...
                </>
              ) : answerChecked[currentQuestion] ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Already Checked
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Check My Answer{" "}
                  {freeQuestionsUsed < FREE_QUESTIONS_LIMIT
                    ? "(Free)"
                    : "(₦15)"}
                </>
              )}
            </button>

            <button
              onClick={() => toggleSolution(currentQuestion)}
              disabled={currentLoadingAI}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              title={
                freeQuestionsUsed < FREE_QUESTIONS_LIMIT ? "Free" : "Cost: ₦20"
              }
            >
              {currentLoadingAI ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : currentShowSolution ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  Hide Solution
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Show AI Solution{" "}
                  {freeQuestionsUsed < FREE_QUESTIONS_LIMIT
                    ? "(Free)"
                    : "(₦20)"}
                </>
              )}
            </button>

            {/* ADD THIS NEW BUTTON: */}
            {/* Change the button text in the action buttons section */}
            <button
              onClick={() => generateAnotherExample(currentQuestion)}
              disabled={generatingExample[currentQuestion]}
              className="flex-1 sm:flex-none bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              title={
                freeQuestionsUsed < FREE_QUESTIONS_LIMIT ? "Free" : "Cost: ₦20"
              }
            >
              {generatingExample[currentQuestion] ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : generatedExamples[currentQuestion] ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Get New Example{" "}
                  {freeQuestionsUsed < FREE_QUESTIONS_LIMIT
                    ? "(Free)"
                    : "(₦20)"}
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Get Practice Example{" "}
                  {freeQuestionsUsed < FREE_QUESTIONS_LIMIT
                    ? "(Free)"
                    : "(₦20)"}
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-between">
            <button
              onClick={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
              disabled={currentQuestion === 0}
              className="w-full lg:w-auto bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 shadow-md"
            >
              ← Previous
            </button>

            <div className="flex flex-wrap justify-center gap-3 max-w-full py-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`min-w-[2.75rem] min-h-[2.75rem] sm:min-w-[3rem] sm:min-h-[3rem] px-2 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center transition-all border ${
                    idx === currentQuestion
                      ? "bg-green-600 text-white border-green-700 shadow-md"
                      : answers[idx] !== undefined
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-white text-green-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={loading}
                className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 shadow-md"
                title={
                  freeQuestionsUsed < FREE_QUESTIONS_LIMIT
                    ? "Free"
                    : "Cost: ₦25"
                }
              >
                {loading
                  ? "Submitting..."
                  : `Submit Test ${
                      freeQuestionsUsed < FREE_QUESTIONS_LIMIT
                        ? "(Free)"
                        : "(₦25)"
                    }`}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestion((q) =>
                    Math.min(questions.length - 1, q + 1)
                  )
                }
                className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-md"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "results" && results) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 md:px-10 flex items-center justify-center">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-3xl bg-white/95 backdrop-blur p-6 sm:p-8 lg:p-12 rounded-2xl border-2 sm:border-4 border-green-400 text-center shadow-2xl">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl">
            <span className="text-4xl sm:text-5xl lg:text-6xl">🎉</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-2">
            Test Completed!
          </h2>

          <p className="text-sm sm:text-base lg:text-xl text-gray-700 mb-6">
            {selectedSubject?.name} - {selectedExam?.name} {selectedExam?.year}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-4 sm:p-6 border-2 border-green-300">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-1">
                {results.score.toFixed(1)}%
              </div>
              <div className="text-sm sm:text-base text-gray-700">
                Your Score
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 sm:p-6 border-2 border-green-300">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-1">
                {results.correct}/{results.total}
              </div>
              <div className="text-sm sm:text-base text-gray-700">
                Correct Answers
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 sm:p-6 border-2 border-green-300">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-1">
                {formatTime(results.timeTaken)}
              </div>
              <div className="text-sm sm:text-base text-gray-700">
                Time Taken
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 sm:p-6 border-2 border-green-300">
              <div
                className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 ${
                  results.score >= 70 ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {results.score >= 70 ? "Pass ✓" : "Keep Trying"}
              </div>
              <div className="text-sm sm:text-base text-gray-700">Status</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => selectedSubject && showTestSetup(selectedSubject)}
              className="w-full sm:w-auto bg-linear-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Retry Test
            </button>

            <button
              onClick={goBackToSubjects}
              className="w-full sm:w-auto bg-white text-green-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all border-2 border-green-300 shadow-lg"
            >
              Back to Subjects
            </button>

            <button
              onClick={resetTest}
              className="w-full sm:w-auto bg-white text-green-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all border-2 border-green-300 shadow-lg"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-green-300 border-t-green-700 rounded-full animate-spin" />
        <p className="text-green-800 text-xl mt-4 font-semibold">Loading...</p>
      </div>
    </div>
  );
}
