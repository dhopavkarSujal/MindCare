"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Compass, ExternalLink, FileText, Heart, Search, ShieldCheck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback } from "@/components/app/feedback";
import { getResources } from "@/lib/api/services";
import type { Resource } from "@/lib/types/api";

const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
const officialResources = [
  { org: "World Health Organization", title: "Doing What Matters in Times of Stress", description: "An illustrated guide with practical grounding and stress-management exercises.", category: "Stress & coping", url: "https://www.who.int/publications/i/item/9789240003927", icon: Heart },
  { org: "National Institute of Mental Health", title: "Caring for Your Mental Health", description: "Everyday practices and guidance for supporting mental wellbeing.", category: "Everyday wellbeing", url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health", icon: BookOpenText },
  { org: "NHS Every Mind Matters", title: "Mental wellbeing support", description: "Practical ideas for managing stress, low mood, sleep and daily routines.", category: "Daily habits", url: "https://www.nhs.uk/every-mind-matters/", icon: Compass },
];

export function PublicResourcesPage() {
  return <main className="mc-public-resources">
    <section className="mc-public-resources__hero"><span className="mc-eyebrow">A SMALL LIBRARY OF SUPPORT</span><h1 className="mc-display">Helpful information, <em>at your own pace.</em></h1><p>Explore practical resources from established health organisations. They&apos;re starting points for learning, not a replacement for professional advice.</p><div className="mc-public-resources__hero-actions"><Link className="mc-button mc-button--primary" href="/register">Create your MindCare space <ArrowUpRight size={15} /></Link><Link className="mc-button mc-button--secondary" href="/login">Sign in</Link></div></section>
    <section className="mc-public-resources__list"><div className="mc-public-resources__section-head"><div><span className="mc-eyebrow">CURATED READS</span><h2>Start with what you need today.</h2></div><span className="mc-tag"><ShieldCheck size={13} /> Established sources</span></div><div className="mc-public-resource-grid">{officialResources.map((item) => { const Icon = item.icon; return <article className="mc-public-resource-card" key={item.url}><span className="mc-public-resource-card__icon"><Icon size={19} /></span><span className="mc-eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><div className="mc-public-resource-card__footer"><span>{item.org}</span><a href={item.url} target="_blank" rel="noreferrer">Read resource <ExternalLink size={13} /></a></div></article>; })}</div></section>
    <section className="mc-public-resources__note"><Sparkles size={19} /><div><strong>Looking for a more personal way to reflect?</strong><p>MindCare brings together mood check-ins, journaling and supportive AI conversations, so you can explore everyday wellbeing in one space.</p><Link className="mc-inline-link" href="/register">Explore MindCare <ArrowUpRight size={14} /></Link></div></section>
    <footer className="mc-public-resources__footer"><Link href="/">MindCare</Link><span>Resources are informational and don&apos;t replace professional care.</span><Link href="/about">About MindCare</Link></footer>
  </main>;
}

export function AppResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setResources(await getResources(search, category === "all" ? "" : category)); setError(""); }
    catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, [search, category]);
  useEffect(() => { void load(); }, [load]);
  const categories = ["all", ...Array.from(new Set(resources.map((resource) => resource.category).filter((item): item is string => Boolean(item))))];
  function submitSearch(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setSearch(searchInput.trim()); }

  return <div className="mc-resources-app-page">
    <SectionHeading eyebrow="A LIBRARY FOR YOUR WELLBEING" title="Find a helpful next step." description="Browse the resources available through MindCare. Take what is useful and leave the rest." />
    <form className="mc-resource-search-bar" onSubmit={submitSearch}><Search size={17} /><input aria-label="Search resources" placeholder="Search stress, sleep, coping…" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /><button className="mc-button mc-button--primary" type="submit">Search</button></form>
    {categories.length > 1 && <div className="mc-resource-filters" aria-label="Resource categories">{categories.map((item) => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => { setLoading(true); setCategory(item); }}>{item === "all" ? "All topics" : item}</button>)}</div>}
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    {loading ? <div className="mc-grid mc-grid--3">{[1, 2, 3].map((id) => <div className="mc-card mc-resource-skeleton" key={id}><div className="mc-skeleton" /><div className="mc-skeleton" /><div className="mc-skeleton" /></div>)}</div> : resources.length ? <div className="mc-grid mc-grid--3 mc-resource-card-grid">{resources.map((resource) => <ResourceCard resource={resource} key={resource.id} />)}</div> : <div className="mc-card"><EmptyPanel icon={<BookOpenText size={20} />} title={search ? "No resources matched that search" : "No resources are available yet"} description={search ? "Try different keywords, or clear your search to browse everything available." : "The resource library is connected to your MindCare API. When curated items are published there, they'll appear here."} action={search ? <button className="mc-button mc-button--secondary" onClick={() => { setLoading(true); setSearch(""); setSearchInput(""); setCategory("all"); }}>Clear search</button> : <Link className="mc-button mc-button--secondary" href="/resources">Browse public resources</Link>} /></div>}
    <div className="mc-resource-footnote"><ShieldCheck size={15} /><span>Resource results come from the MindCare backend. Open each source to review its original context.</span><Link className="mc-inline-link" href="/resources">Public resource guide <ArrowUpRight size={13} /></Link></div>
  </div>;
}

function ResourceCard({ resource }: { resource: Resource }) {
  const url = resource.sourceUrl ?? resource.url;
  return <article className="mc-card mc-resource-card"><span className="mc-resource-card__icon"><FileText size={18} /></span><div className="mc-resource-card__meta"><span>{resource.category ?? "Wellbeing"}</span><span>RESOURCE</span></div><h3>{resource.title}</h3><p>{resource.summary ?? resource.description ?? "Open this resource to read more."}</p><div className="mc-resource-card__footer"><span>{resource.source ?? "MindCare library"}</span>{url && /^https?:\/\//i.test(url) ? <a href={url} target="_blank" rel="noreferrer">Read more <ArrowUpRight size={13} /></a> : <span className="mc-resource-card__no-link">Source link not provided</span>}</div></article>;
}
