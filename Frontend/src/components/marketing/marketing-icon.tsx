import {
  Activity,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  Heart,
  HeartPulse,
  Leaf,
  LockKeyhole,
  MessageCircle,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { MarketingIconName } from "@/lib/marketing-content";

const icons: Record<MarketingIconName, LucideIcon> = {
  "message-circle": MessageCircle,
  activity: Activity,
  "book-open": BookOpen,
  compass: Compass,
  heart: Heart,
  clock: Clock3,
  leaf: Leaf,
  lock: LockKeyhole,
  wind: Wind,
  "heart-pulse": HeartPulse,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
};

type MarketingIconProps = {
  name: MarketingIconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  decorative?: boolean;
};

export function MarketingIcon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
  decorative = true,
}: MarketingIconProps) {
  const Icon = icons[name];
  return (
    <Icon
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
