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
  content?: string;
  summary?: string;
  description?: string;
  externalUrl?: string | null;
  sourceUrl?: string | null;
  url?: string | null;
  category?: string;
  source?: string;
  createdAt?: string;
};

export type Counsellor = {
  id: string;
  name: string;
  specialty?: string;
  bio?: string;
  avatarUrl?: string;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
export type AppointmentSlot = {
  id?: string;
  startTime: string;
  endTime?: string;
  isAvailable: boolean;
  bookingStatus?: AppointmentStatus | null;
};
export type Appointment = {
  appointmentId: string;
  counsellorName?: string;
  startsAt: string;
  status: AppointmentStatus;
};


export type AdminAppointment = {
  appointmentId: string;
  userName?: string | null;
  userEmail?: string | null;
  counsellorId?: string;
  counsellorName?: string;
  startsAt: string;
  endsAt?: string;
  status: AppointmentStatus;
  reason?: string | null;
  createdAt?: string;
};

export type AdminCounsellor = {
  id: string;
  userId?: string | null;
  user?: { id: string; name?: string | null; email: string } | null;
  name: string;
  specialty?: string | null;
  bio?: string | null;
  timeZone?: string;
  isActive: boolean;
  _count?: {
    appointments?: number;
    availabilitySlots?: number;
  };
};


export type CounsellorAccount = {
  id: string;
  name?: string | null;
  email: string;
  linkedCounsellorId: string | null;
  linkedCounsellorName: string | null;
};

export type CounsellorWorkspace = {
  id: string;
  userId?: string | null;
  name: string;
  specialty?: string | null;
  bio?: string | null;
  timeZone: string;
  isActive: boolean;
};

export type CounsellorAppointment = {
  appointmentId: string;
  studentId: string;
  studentName?: string | null;
  studentEmail: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  reason?: string | null;
  createdAt: string;
};

export type CounsellorAvailabilitySlot = {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingStatus: AppointmentStatus | null;
};
