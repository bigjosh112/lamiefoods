import { ANNOUNCEMENT } from "@/content/shop";

/**
 * Thin promotional bar above the header.
 *
 * Rendered only where the design calls for it, rather than site-wide: the
 * landing and shop frames do not show it, and quietly adding it to approved
 * pages would change them without being asked.
 *
 * The delivery offer it carries is UNVERIFIED — see the note in `content/shop`.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-cacao px-margin py-2 text-linen/80">
      <p className="mx-auto max-w-(--container-page) text-center font-label text-label-sm uppercase">
        {ANNOUNCEMENT.items.map((item, index) => (
          <span key={item}>
            {index > 0 && (
              <span aria-hidden="true" className="px-2 text-linen/35">
                ·
              </span>
            )}
            {item}
          </span>
        ))}
      </p>
    </div>
  );
}
