"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpenText, Clock3, FilePenLine, LockKeyhole, Plus, Save, Search, Trash2 } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { Feedback, LoadingPanel } from "@/components/app/feedback";
import { deleteJournalEntry, getJournalEntries, getJournalEntry, saveJournalEntry, updateJournalEntry } from "@/lib/api/services";
import type { JournalEntry } from "@/lib/types/api";

const idOf = (entry: JournalEntry) => entry.entryId ?? entry.id ?? "";
const dateOf = (entry: JournalEntry) => entry.updatedAt ?? entry.updated_at ?? entry.createdAt ?? "";
const previewOf = (entry: JournalEntry) => entry.title || entry.snippet || entry.content?.split("\n")[0] || "Untitled reflection";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [mobileEditor, setMobileEditor] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const result = await getJournalEntries();
      const sorted = result.slice().sort((a, b) => new Date(dateOf(b)).getTime() - new Date(dateOf(a)).getTime());
      setEntries(sorted); setError("");
      if (selectedId && !sorted.some((entry) => idOf(entry) === selectedId)) { setSelectedId(""); setContent(""); setDirty(false); }
    } catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, [selectedId]);
  useEffect(() => { void loadEntries(); }, [loadEntries]);

  const visible = useMemo(() => entries.filter((entry) => `${previewOf(entry)} ${entry.snippet ?? ""}`.toLowerCase().includes(search.toLowerCase())), [entries, search]);

  async function selectEntry(entry: JournalEntry) {
    if (dirty && !window.confirm("You have unsaved changes. Discard them and open another entry?")) return;
    const id = idOf(entry);
    setSelectedId(id); setMobileEditor(true); setError(""); setSuccess(""); setDirty(false);
    if (entry.content !== undefined) { setContent(entry.content); return; }
    setLoadingEntry(true);
    try { const full = await getJournalEntry(id); setContent(full.content ?? full.snippet ?? ""); }
    catch (caught) { setError(errorText(caught)); setContent(""); }
    finally { setLoadingEntry(false); }
  }

  function newEntry() {
    if (dirty && !window.confirm("You have unsaved changes. Discard them and start a new entry?")) return;
    setSelectedId(""); setContent(""); setDirty(false); setError(""); setSuccess(""); setMobileEditor(true);
  }

  async function save() {
    if (!content.trim()) { setError("Add a few words before saving your reflection."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      if (selectedId) await updateJournalEntry(selectedId, content.trim());
      else {
        const created = await saveJournalEntry(content.trim());
        if (idOf(created)) setSelectedId(idOf(created));
      }
      setDirty(false); setSuccess("Your reflection has been saved."); await loadEntries();
    } catch (caught) { setError(errorText(caught)); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!selectedId || !window.confirm("Delete this journal entry? This cannot be undone.")) return;
    setDeleting(true); setError("");
    try { await deleteJournalEntry(selectedId); setEntries((current) => current.filter((entry) => idOf(entry) !== selectedId)); setSelectedId(""); setContent(""); setDirty(false); setSuccess("Entry deleted."); }
    catch (caught) { setError(errorText(caught)); }
    finally { setDeleting(false); }
  }

  return <div className="mc-journal-page">
    <SectionHeading eyebrow="PRIVATE REFLECTION" title="A page that's just for your thoughts." description="Write without pressure. A sentence is enough; a whole page is welcome too." action={<button className="mc-button mc-button--primary" type="button" onClick={newEntry}><Plus size={16} /> New reflection</button>} />
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    {success && <div className="mc-page-feedback"><Feedback kind="success">{success}</Feedback></div>}
    <div className={`mc-journal-workspace${mobileEditor ? " is-editor-open" : ""}`}>
      <aside className="mc-card mc-journal-list-panel">
        <div className="mc-journal-list-heading"><div><h2>Your entries</h2><p>{entries.length} saved reflection{entries.length === 1 ? "" : "s"}</p></div><button className="mc-icon-button" onClick={newEntry} aria-label="New reflection"><Plus size={16} /></button></div>
        <label className="mc-journal-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an entry" aria-label="Search journal entries" /></label>
        {loading ? <LoadingPanel label="Loading journal…" /> : visible.length ? <div className="mc-journal-entry-list">{visible.map((entry, index) => {
          const id = idOf(entry); const selected = id && selectedId === id;
          return <button key={id || `${dateOf(entry)}-${index}`} type="button" className={`mc-journal-entry-item${selected ? " is-selected" : ""}`} onClick={() => void selectEntry(entry)}>
            <span className="mc-journal-entry-item__icon"><BookOpenText size={15} /></span><span className="mc-journal-entry-item__text"><strong>{previewOf(entry)}</strong><span>{entry.snippet ?? (entry.content ? `${entry.content.slice(0, 90)}${entry.content.length > 90 ? "…" : ""}` : "Open to read this reflection")}</span><small>{dateOf(entry) ? new Date(dateOf(entry)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Saved entry"}</small></span>
          </button>;
        })}</div> : <div className="mc-journal-list-empty"><BookOpenText size={20} /><strong>{search ? "No entries found" : "Your journal begins here"}</strong><p>{search ? "Try a different search." : "When you save a reflection, it'll show up here."}</p>{!search && <button className="mc-button mc-button--secondary" onClick={newEntry}><Plus size={14} /> Write a first entry</button>}</div>}
      </aside>

      <section className="mc-card mc-journal-editor">
        <div className="mc-journal-editor__header"><button type="button" className="mc-journal-mobile-back" onClick={() => setMobileEditor(false)}><ArrowLeft size={14} /> Entries</button><div className="mc-journal-editor__label"><span className="mc-journal-editor__icon"><FilePenLine size={17} /></span><div><strong>{selectedId ? "Your reflection" : "A new page"}</strong><span>{dirty ? "Unsaved changes" : selectedId ? "Your saved entry" : "Take your time"}</span></div></div><span className="mc-journal-lock"><LockKeyhole size={13} /> Personal</span></div>
        {loadingEntry ? <LoadingPanel label="Opening your entry…" /> : <>
          <div className="mc-journal-prompts"><span className="mc-eyebrow">A GENTLE START</span><p>What is taking up space in your mind today?</p><p>What would you like to give yourself credit for?</p></div>
          <textarea className="mc-journal-textarea" value={content} onChange={(event) => { setContent(event.target.value); setDirty(true); setSuccess(""); }} maxLength={30000} aria-label="Journal reflection" placeholder="Start wherever you are. No need to make it perfect…" />
          <div className="mc-journal-editor__footer"><span><Clock3 size={13} /> {content.trim() ? `${content.trim().split(/\s+/).length} words` : "Your words, your pace"}</span><div>{selectedId && <button className="mc-button mc-button--danger" type="button" onClick={remove} disabled={deleting || saving}><Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}</button>}<button className="mc-button mc-button--primary" type="button" onClick={save} disabled={saving || loadingEntry || !dirty && Boolean(selectedId)}>{saving ? <span className="mc-spinner" /> : <Save size={14} />}{saving ? "Saving…" : "Save reflection"}</button></div></div>
        </>}
      </section>
    </div>
    <div className="mc-journal-note"><LockKeyhole size={15} /><span>Only write what you&apos;re comfortable storing in your account. MindCare is designed for reflection, not emergency documentation.</span></div>
  </div>;
}
