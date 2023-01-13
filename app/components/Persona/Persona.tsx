import type { LinksFunction } from "@remix-run/node";
import type { UserData } from "~/utils/session.server";
import stylesUrl from "./styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl }
];

type PersonaProps = {
  userData: UserData;
  size?: string;
  initialsOnly?: boolean;
};
export function Persona({ userData, size, initialsOnly }: PersonaProps) {
  const initials = userData.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <span
      data-persona
      data-initials={initials}
      style={{ "--size": size } as any}
      title={`${userData.name} (${userData.preferred_username})`}
    >
      <span data-visually-hidden={initialsOnly}>{userData.name}</span>
    </span>
  );
}
