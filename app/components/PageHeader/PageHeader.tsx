import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { desktopMediaQuery } from "~/utils/media-queries";
import stylesUrl from "./styles.css";
import desktopStylesUrl from "./styles.desktop.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: desktopStylesUrl, media: desktopMediaQuery },
];

type PageHeaderProps = { title: string };
export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header data-page-header>
      <h1>{title}</h1>
      <Link to="/">Back</Link>
    </header>
  );
}
