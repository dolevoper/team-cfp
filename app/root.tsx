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
  const idToken = request.headers.get("x-ms-token-aad-id-token") ?? process.env.ID_TOKEN;

  if (!idToken) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const [, encodedTokenString] = idToken.split(".");
  const token = JSON.parse(Buffer.from(encodedTokenString, "base64").toString()) as Record<string, string>;
  const { name, preferred_username } = token;

  return json({ user: { name, preferredUsername: preferred_username } });
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
          <button data-username title={`${data.user.name} (${data.user.preferredUsername})`}>
            <span>{data.user.name.split(" ").slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("")}</span>
          </button>
        </header>
        <main>
          <Outlet />
        </main>
        <div id="dialogs"></div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
