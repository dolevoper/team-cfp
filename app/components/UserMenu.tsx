import { Link } from "@remix-run/react";
import { useId, useRef } from "react";
import { useToggle } from "~/utils/hooks";
import type { UserData } from "~/utils/session.server";
import { Persona } from "./Persona";

type UserMenuProps = { user: UserData };
export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, toggleIsOpen] = useToggle();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const signoutRef = useRef<HTMLAnchorElement>(null);
  const id = useId();

  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;

  return (
    <div data-user-menu>
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen ? true : undefined}
        aria-controls={menuId}
        id={buttonId}
        ref={buttonRef}
        title={`${user.name} (${user.preferred_username})`}
        onClick={() => {
          toggleIsOpen();
          !isOpen && setTimeout(() => signoutRef.current?.focus());
        }}
      >
        <span data-visually-hidden>User menu</span>
        <Persona userData={user} size="1.2rem" initialsOnly />
      </button>
      <menu
        aria-labelledby={buttonId}
        tabIndex={isOpen ? 0 : undefined}
        id={menuId}
        onBlur={(e) => {
          if (
            !isOpen ||
            e.currentTarget.contains(e.relatedTarget) ||
            e.relatedTarget === buttonRef.current
          ) {
            return;
          }

          toggleIsOpen();
        }}
        onKeyDown={(e) => {
          if (e.key !== "Tab" && e.key !== "Escape") {
            return;
          }

          buttonRef.current?.focus();
          toggleIsOpen();
        }}
      >
        <li role="menuitem">
          <hgroup>
            <h2>{user.name}</h2>
            <p>{user.preferred_username}</p>
          </hgroup>
        </li>
        <li role="menuitem">
          <Link to="/.auth/logout" ref={signoutRef} tabIndex={!isOpen ? -1 : undefined}>
            Sign out
          </Link>
        </li>
      </menu>
    </div>
  );
}
