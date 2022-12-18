import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesUrl from "~/styles/root.css";
import desktopStylesUrl from "~/styles/root.desktop.css";
import iconsStylesUrl from "~/styles/fabric-icons.css";
import { desktopMediaQuery } from "~/utils/media-queries";

export const loader = ({ request }: LoaderArgs) => {
  console.log(request.headers);
  return json({ headers: Object.fromEntries(request.headers.entries()) });
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Team-CFP",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: desktopStylesUrl, media: desktopMediaQuery },
  { rel: "stylesheet", href: iconsStylesUrl }
];

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header id="app-header">
          <Link to="/">Team-CFP</Link>
        </header>
        <main>
          <Outlet />
        </main>
        <pre>{JSON.stringify(data.headers, null, 4)}</pre>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
