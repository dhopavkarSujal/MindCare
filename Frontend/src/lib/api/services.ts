import { apiRequest, unwrapData } from "@/lib/api/client";
import type { AdminAppointment, AdminCounsellor, Appointment, AppointmentSlot, Conversation, Counsellor, CounsellorAccount, CounsellorAppointment, CounsellorAvailabilitySlot, CounsellorWorkspace, JournalEntry, MoodEntry, Resource } from "@/lib/types/api";

function arrayFrom<T>(payload: unknown): T[] {
  const result = unwrapData<unknown>(payload);
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object") {
    const record = result as Record<string, unknown>;
    for (const key of ["items", "moods", "conversations", "entries", "resources", "counsellors", "appointments", "results"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

// These endpoints match the paths used by the Version 1 frontend.
export async function getMoods() { return arrayFrom<MoodEntry>(await apiRequest("/moods")); }
export async function createMood(input: { score: number; note?: string }) { return apiRequest("/moods", { method: "POST", body: input }); }
export async function deleteMood(id: string) { return apiRequest(`/moods/${encodeURIComponent(id)}`, { method: "DELETE" }); }
export async function getConversations() { return arrayFrom<Conversation>(await apiRequest("/conversations")); }
export async function getConversation(id: string) { return unwrapData<Record<string, unknown>>(await apiRequest(`/conversations/${encodeURIComponent(id)}`)); }
export async function createConversation(title = "New Support Session") { return unwrapData<Conversation>(await apiRequest("/conversations", { method: "POST", body: { title } })); }
export async function renameConversation(id: string, title: string) { return apiRequest(`/conversations/${encodeURIComponent(id)}`, { method: "PATCH", body: { title } }); }
export async function deleteConversation(id: string) { return apiRequest(`/conversations/${encodeURIComponent(id)}`, { method: "DELETE" }); }
export async function toggleConversationPin(id: string, isPinned: boolean) { return apiRequest(`/conversations/${encodeURIComponent(id)}/pin`, { method: "PATCH", body: { isPinned } }); }
export async function sendMessage(input: { conversationId: string; message: string }) { return unwrapData<Record<string, unknown>>(await apiRequest("/chat", { method: "POST", body: input })); }

// The following routes follow the MindCare Research architecture; align them with Express if your API uses different route names.
export async function getJournalEntries() { return arrayFrom<JournalEntry>(await apiRequest("/journal")); }
export async function getJournalEntry(id: string) { return unwrapData<JournalEntry>(await apiRequest(`/journal/${encodeURIComponent(id)}`)); }
export async function saveJournalEntry(content: string) { return unwrapData<JournalEntry>(await apiRequest("/journal", { method: "POST", body: { content } })); }
export async function updateJournalEntry(id: string, content: string) { return apiRequest(`/journal/${encodeURIComponent(id)}`, { method: "PUT", body: { content } }); }
export async function deleteJournalEntry(id: string) { return apiRequest(`/journal/${encodeURIComponent(id)}`, { method: "DELETE" }); }
export async function getResources(search = "", category = "") {
  const params = new URLSearchParams(); if (search) params.set("search", search); if (category) params.set("category", category);
  return arrayFrom<Resource>(await apiRequest(`/resources${params.size ? `?${params.toString()}` : ""}`));
}
export async function getResource(id: string) { return unwrapData<Resource>(await apiRequest(`/resources/${encodeURIComponent(id)}`)); }
export async function getCounsellors() { return arrayFrom<Counsellor>(await apiRequest("/counsellors")); }
export async function getCounsellorSlots(id: string, date: string) { const params = new URLSearchParams({ date }); return arrayFrom<AppointmentSlot>(await apiRequest(`/counsellors/${encodeURIComponent(id)}/slots?${params}`)); }
export async function getAppointments() { return arrayFrom<Appointment>(await apiRequest("/appointments")); }
export async function bookAppointment(input: { counsellorId: string; startTime: string; reason?: string }) { return apiRequest("/appointments", { method: "POST", body: input }); }
export async function cancelAppointment(id: string) { return apiRequest(`/appointments/${encodeURIComponent(id)}`, { method: "DELETE" }); }
export async function getProfile() { return unwrapData<Record<string, unknown>>(await apiRequest("/profile")); }
export async function updateProfile(input: { name?: string; preferences?: Record<string, unknown> }) { return apiRequest("/profile", { method: "PUT", body: input }); }
export async function getConsents() { return arrayFrom<{ permission: string; enabled: boolean }>(await apiRequest("/consents")); }
export async function updateConsent(input: { permission: string; enabled: boolean }) { return apiRequest("/consents", { method: "POST", body: input }); }


/** Admin-only endpoints; the Express API enforces the ADMIN role. */
export async function getAdminAppointments(status = "") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const suffix = params.size ? `?${params.toString()}` : "";
  return arrayFrom<AdminAppointment>(await apiRequest(`/admin/appointments${suffix}`));
}
export async function getAdminCounsellors() {
  return arrayFrom<AdminCounsellor>(await apiRequest("/admin/counsellors"));
}
export async function updateAdminAppointmentStatus(id: string, status: "confirmed" | "cancelled" | "rejected") {
  return apiRequest(`/admin/appointments/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
}
export async function getAdminCounsellorUsers() {
  return arrayFrom<CounsellorAccount>(await apiRequest("/admin/counselor-users"));
}
export async function linkAdminCounsellorAccount(counsellorId: string, userId: string | null) {
  return apiRequest(`/admin/counsellors/${encodeURIComponent(counsellorId)}/account`, {
    method: "PATCH",
    body: { userId },
  });
}
export async function updateAdminCounsellor(counsellorId: string, isActive: boolean) {
  return apiRequest(`/admin/counsellors/${encodeURIComponent(counsellorId)}`, {
    method: "PATCH",
    body: { isActive },
  });
}
export async function createAdminCounsellorSlot(counsellorId: string, input: { startsAt: string; endsAt: string }) {
  return apiRequest(`/admin/counsellors/${encodeURIComponent(counsellorId)}/slots`, {
    method: "POST",
    body: input,
  });
}

/** Counselor-scoped portal APIs. The backend derives the counselor profile from the authenticated user. */
export async function getCounsellorWorkspace() {
  return unwrapData<CounsellorWorkspace>(await apiRequest("/counselor/me"));
}
export async function getCounsellorAppointments(status = "") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const suffix = params.size ? `?${params.toString()}` : "";
  return arrayFrom<CounsellorAppointment>(await apiRequest(`/counselor/appointments${suffix}`));
}
export async function getCounsellorAvailability() {
  return arrayFrom<CounsellorAvailabilitySlot>(await apiRequest("/counselor/slots"));
}
export async function createCounsellorAvailability(input: { startsAt: string; endsAt: string }) {
  return apiRequest("/counselor/slots", { method: "POST", body: input });
}
export async function deactivateCounsellorAvailability(slotId: string) {
  return apiRequest(`/counselor/slots/${encodeURIComponent(slotId)}`, { method: "PATCH", body: { isActive: false } });
}
export async function completeCounsellorAppointment(appointmentId: string) {
  return apiRequest(`/counselor/appointments/${encodeURIComponent(appointmentId)}/complete`, { method: "PATCH", body: {} });
}
