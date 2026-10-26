import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return <main className="mc-not-found"><span><Leaf size={22} /></span><div className="mc-eyebrow">404 · NOT FOUND</div><h1 className="mc-display">This page took a different path.</h1><p>The address may be out of date, or this page may have moved. Let&apos;s get you somewhere useful.</p><div><Link className="mc-button mc-button--primary" href="/">Back to MindCare <ArrowLeft size={15} /></Link><Link className="mc-button mc-button--secondary" href="/resources">Explore resources</Link></div></main>;
}
