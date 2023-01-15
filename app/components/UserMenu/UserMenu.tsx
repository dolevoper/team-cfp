import { useId, useRef } from "react";
import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import type { UserData } from "~/utils/session.server";
import { desktopMediaQuery, preferesReducedMotion } from "~/utils/media-queries";
import { Persona, links as personaLinks } from "../Persona";
import stylesUrl from "./styles.css";
import desktopStylesUrl from "./styles.desktop.css";
import reducedMotionStylesUrl from "./styles.reduced-motion.css";

export const links: LinksFunction = () => [
  ...personaLinks(),
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: desktopStylesUrl, media: desktopMediaQuery },
  { rel: "stylesheet", href: reducedMotionStylesUrl, media: preferesReducedMotion }
];

type UserMenuProps = { user: UserData };
export function UserMenu({ user }: UserMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const signoutRef = useRef<HTMLAnchorElement>(null);
  const id = useId();

  const summaryId = `${id}-button`;
  const menuId = `${id}-menu`;

  return (
    <details
      data-user-menu
      ref={detailsRef}
      onToggle={(e) => {
        e.currentTarget.open && signoutRef.current?.focus();
      }}
    >
      <summary
        aria-haspopup="menu"
        aria-expanded={detailsRef.current?.open ? true : undefined}
        aria-controls={menuId}
        id={summaryId}
        ref={summaryRef}
        title={`${user.name} (${user.preferred_username})`}
      >
        <span data-visually-hidden>User menu</span>
        <Persona userData={user} size="1.2rem" initialsOnly />
      </summary>
      <menu
        aria-labelledby={summaryId}
        tabIndex={0}
        id={menuId}
        onBlur={(e) => {
          if (
            !detailsRef.current?.open ||
            e.currentTarget.contains(e.relatedTarget) ||
            e.relatedTarget === summaryRef.current
          ) {
            return;
          }

          if (detailsRef.current) {
            detailsRef.current.open = false;
          }
        }}
        onKeyDown={(e) => {
          if (e.key !== "Tab" && e.key !== "Escape") {
            return;
          }

          summaryRef.current?.focus();
          if (detailsRef.current) {
            detailsRef.current.open = false;
          }
        }}
      >
        <hgroup role="menuitem">
          <h2>{user.name}</h2>
          <p>{user.preferred_username}</p>
        </hgroup>
        <Link to="/.auth/logout" ref={signoutRef} role="menuitem">
          Sign out
        </Link>
      </menu>
    </details>
  );
}
