export type MoodEntry = {
  id?: string;
  moodId?: string;
  score: number;
  note?: string | null;
  createdAt?: string;
  created_at?: string;
  recordedAt?: string;
};

export type Conversation = {
  id: string;
  title?: string | null;
  updatedAt?: string;
  updated_at?: string;
  isPinned?: boolean;
  pinned?: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string | null;
  sources?: Array<{ title: string; url: string }>;
};

export type JournalEntry = {
  id?: string;
  entryId?: string;
  title?: string | null;
  content?: string;
  snippet?: string;
  updatedAt?: string;
  createdAt?: string;
  updated_at?: string;
};

export type Resource = {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  sourceUrl?: string;
  url?: string;
  category?: string;
  source?: string;
};

export type Counsellor = {
  id: string;
  name: string;
  specialty?: string;
  bio?: string;
  avatarUrl?: string;
};

export type AppointmentSlot = { startTime: string; isAvailable: boolean };
export type Appointment = {
  appointmentId: string;
  counsellorName?: string;
  startsAt: string;
  status: "pending" | "confirmed" | "cancelled";
};
