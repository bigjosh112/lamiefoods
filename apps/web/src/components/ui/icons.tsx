import type { SVGProps } from "react";

/**
 * The handful of icons the landing page needs, inlined.
 *
 * A full icon package would add a dependency and ship far more than nine
 * glyphs. These are decorative next to visible labels, so they are hidden from
 * assistive tech; anywhere an icon stands alone, the control carries its own
 * accessible name.
 */
const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
} as const;

type IconProps = SVGProps<SVGSVGElement>;

export const AwardIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="m8.5 13.5-1 7 4.5-2.5 4.5 2.5-1-7" />
  </svg>
);

export const TimerIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2M9 2h6" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
    <path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M4 12h16m-6-6 6 6-6 6" />
  </svg>
);

export const PlaneIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M2 13l20-8-8 20-2.5-8.5z" />
  </svg>
);

export const PeopleIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.2a6.5 6.5 0 0 1 4 5.8" />
  </svg>
);

export const GiftIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M3 11h18v9H3zM2 7h20v4H2zM12 7v13" />
    <path d="M12 7S10.5 3 8.5 3a2 2 0 0 0 0 4zM12 7s1.5-4 3.5-4a2 2 0 0 1 0 4z" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M12 2.5 20 6v6c0 5-3.4 8.4-8 9.5-4.6-1.1-8-4.5-8-9.5V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TruckIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8z" />
    <circle cx="6.5" cy="18.5" r="1.8" />
    <circle cx="17" cy="18.5" r="1.8" />
  </svg>
);

export const SealIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="m12 2.5 2.4 2 3.1-.3 1 3 2.5 1.9-1.4 2.8 1.4 2.8-2.5 1.9-1 3-3.1-.3-2.4 2-2.4-2-3.1.3-1-3L3 15.6 4.4 12.8 3 10l2.5-1.9 1-3 3.1.3z" />
    <path d="m9.5 12 1.8 1.8 3.4-3.6" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const BagIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M5 7h14l-1 13H6zM9 7V5.5a3 3 0 0 1 6 0V7" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const EyeIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" />
  </svg>
);

export const ChatIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.4A8 8 0 1 1 21 12z" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const BoxIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5 12 12l9-4.5M12 12v9" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const LeafIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M20 4c0 8-4.5 13-11 13H5c0-7 4-11 10-11 2 0 4-1 5-2z" />
    <path d="M4 21c2-5 5.5-8.5 10-10.5" />
  </svg>
);

export const SoundIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M4 9v6h3.5L13 20V4L7.5 9z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export const UtensilsIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M6 2v8a2.5 2.5 0 0 0 5 0V2M8.5 12.5V22" />
    <path d="M17.5 2c-1.5 2-2 4-2 6.5s.7 3.5 2 3.5V22" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const BoardIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M3 5.5 9 4l6 2 6-1.5v14L15 20l-6-2-6 1.5z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);

/** Icon lookup for content-driven sections, so content stays free of JSX. */
export const ICONS = {
  award: AwardIcon,
  timer: TimerIcon,
  sparkle: SparkleIcon,
  plane: PlaneIcon,
  people: PeopleIcon,
  gift: GiftIcon,
  shield: ShieldIcon,
  truck: TruckIcon,
  seal: SealIcon,
  instagram: InstagramIcon,
  chat: ChatIcon,
  mail: MailIcon,
  box: BoxIcon,
  leaf: LeafIcon,
  sound: SoundIcon,
  calendar: CalendarIcon,
  board: BoardIcon,
  utensils: UtensilsIcon,
} as const;

export type IconName = keyof typeof ICONS;
