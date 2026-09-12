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

/*
 * ── Brand marks ─────────────────────────────────────────────────────────────
 *
 * These three are NOT part of the line-icon set above. They carry each
 * platform's own colours, so they set `fill` and deliberately do not spread
 * `iconProps` — no `stroke: currentColor`, which is what lets the rest of the
 * set inherit text colour. A parent's `text-*` class has no effect on them.
 *
 * The Instagram gradient needs an element id. The footer is the only place
 * these render and it appears once per page, so a fixed id is safe; if one of
 * these is ever used twice in the same document, the id must be made unique
 * per instance or the second copy will reference the first one's gradient.
 */
export const InstagramBrandIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <defs>
      <linearGradient id="lamieInstagramGradient" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0%" stopColor="#FEDA75" />
        <stop offset="25%" stopColor="#FA7E1E" />
        <stop offset="50%" stopColor="#D62976" />
        <stop offset="75%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5.5"
      fill="url(#lamieInstagramGradient)"
    />
    <circle cx="12" cy="12" r="4.6" fill="none" stroke="#fff" strokeWidth="1.9" />
    <circle cx="17.3" cy="6.7" r="1.25" fill="#fff" />
  </svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path
      fill="#25D366"
      d="M12.04 2a9.94 9.94 0 0 0-8.5 15.15L2 22.5l5.5-1.44A9.94 9.94 0 1 0 12.04 2Zm0 1.9a8.04 8.04 0 1 1-4.1 14.95l-.3-.18-3.26.86.87-3.18-.2-.31A8.04 8.04 0 0 1 12.04 3.9Z"
    />
    <path
      fill="#25D366"
      d="M9.3 7.3c-.2-.45-.4-.46-.6-.47h-.5c-.17 0-.45.07-.69.33-.24.25-.9.88-.9 2.15 0 1.26.92 2.48 1.05 2.65.13.17 1.79 2.86 4.42 3.9 2.18.86 2.62.69 3.1.64.47-.04 1.52-.62 1.74-1.22.21-.6.21-1.12.15-1.22-.06-.1-.23-.17-.48-.3-.25-.12-1.5-.73-1.73-.81-.23-.09-.4-.13-.57.12-.17.26-.65.82-.8.99-.14.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.01-.39.11-.51.11-.12.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.54-1.33-.76-1.83Z"
    />
  </svg>
);

export const GmailIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path fill="#fff" d="M4 7h16v11H4z" />
    <path
      fill="#4285F4"
      d="M1.6 19a.9.9 0 0 1-.9-.9V7.7c0-1.24 1.42-1.95 2.4-1.2l1.4 1.05V19Z"
    />
    <path
      fill="#34A853"
      d="M22.4 19a.9.9 0 0 0 .9-.9V7.7c0-1.24-1.42-1.95-2.4-1.2L19.5 7.55V19Z"
    />
    <path fill="#FBBC04" d="m19.5 7.55 3.8-2.85V8.2l-3.8 2.85Z" />
    <path fill="#C5221F" d="m4.5 7.55-3.8-2.85V8.2l3.8 2.85Z" />
    <path fill="#EA4335" d="M4.5 7.55 12 13.17l7.5-5.62v3.5L12 16.67 4.5 11.05Z" />
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

export const BellIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
    <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
  </svg>
);

export const GearIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9 2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 2.9-1.2 2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0 1.2 2.9 2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const SignOutIcon = (p: IconProps) => (
  <svg {...iconProps} {...p}>
    <path d="M14 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" />
    <path d="M17 15.5 20.5 12 17 8.5M20.5 12H10" />
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
  instagramBrand: InstagramBrandIcon,
  whatsapp: WhatsAppIcon,
  gmail: GmailIcon,
  box: BoxIcon,
  leaf: LeafIcon,
  sound: SoundIcon,
  calendar: CalendarIcon,
  bell: BellIcon,
  gear: GearIcon,
  signOut: SignOutIcon,
  board: BoardIcon,
  utensils: UtensilsIcon,
} as const;

export type IconName = keyof typeof ICONS;
