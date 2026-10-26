"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Leaf, Sparkles } from "lucide-react";

const moods = [
  { emoji: "😔", label: "Low", note: "It is okay to take things gently." },
  { emoji: "😕", label: "Uneasy", note: "You do not have to solve everything now." },
  { emoji: "😐", label: "Okay", note: "A small pause can still be meaningful." },
  { emoji: "🙂", label: "Good", note: "Notice what is helping you today." },
  { emoji: "😄", label: "Great", note: "Make a little room to enjoy this feeling." },
] as const;

export function MoodPreview() {
  const [selectedMood, setSelectedMood] = useState(2);
  const mood = moods[selectedMood];

  return (
    <div className="mc-mood-art" role="group" aria-label="Interactive preview of a MindCare mood check-in">
      <div className="mc-mood-card">
        <div className="mc-mood-card__topline">
          <div className="mc-mood-card__brand">
            <span className="mc-mood-card__mini-mark"><Leaf size={17} /></span>
            <span className="mc-mood-card__title">Your wellbeing space</span>
          </div>
          <span className="mc-status-pill"><span /> DAILY CHECK-IN</span>
        </div>

        <div className="mc-mood-card__body">
          <p className="mc-overline">Take a moment for yourself</p>
          <h2>How are you feeling?</h2>
          <p className="mc-muted-copy">There is no right or wrong answer. Just check in with yourself.</p>

          <div className="mc-mood-options" role="group" aria-label="Choose a mood">
            {moods.map((item, index) => (
              <button
                type="button"
                key={item.label}
                className={`mc-mood-option${selectedMood === index ? " is-selected" : ""}`}
                aria-pressed={selectedMood === index}
                onClick={() => setSelectedMood(index)}
              >
                <span className="mc-mood-option__emoji" aria-hidden="true">{item.emoji}</span>
                <span className="mc-mood-option__label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mc-mood-response" aria-live="polite">
            <span className="mc-mood-response__icon"><Sparkles size={17} /></span>
            <div>
              <p className="mc-mood-response__title">{mood.label}, noted for this preview</p>
              <p className="mc-mood-response__copy">{mood.note}</p>
            </div>
            <Check className="mc-mood-response__check" size={16} aria-hidden="true" />
          </div>

          <div className="mc-mood-card__bottom">
            <span>Small check-ins can add up.</span>
            <span className="mc-preview-note">Demo · not saved</span>
          </div>
        </div>
      </div>

      <div className="mc-floating-note mc-floating-note--top">
        <span className="mc-floating-note__icon"><Leaf size={16} /></span>
        <span><strong>Make space for you</strong><small>One moment at a time</small></span>
      </div>
      <div className="mc-floating-note mc-floating-note--bottom">
        <span className="mc-floating-note__sparkle"><Sparkles size={17} /></span>
        <span><strong>Reflection, at your pace</strong><small>Come back whenever you are ready</small></span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </div>
      <span className="mc-mood-art__caption">A preview of the daily check-in experience</span>
    </div>
  );
}
