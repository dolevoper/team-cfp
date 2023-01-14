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
import { desktopMediaQuery } from "~/utils/media-queries";
import { getUserData } from "~/utils/session.server";
import { UserMenu, links as userMenuLinks } from "~/components/UserMenu/UserMenu";
import { users } from "~/utils/users.server";
import iconsStylesUrl from "~/styles/fabric-icons.css";
import tokensStylesUrl from "~/styles/tokens.css";
import stylesUrl from "~/styles/root.css";
import desktopStylesUrl from "~/styles/root.desktop.css";

export const loader = ({ request }: LoaderArgs) => {
  const user = getUserData(request);

  users.set(user.principalId, user);

  return json({ user });
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Team-CFP",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  ...userMenuLinks(),
  { rel: "stylesheet", href: iconsStylesUrl },
  { rel: "stylesheet", href: tokensStylesUrl },
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: desktopStylesUrl, media: desktopMediaQuery },
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
          <Link data-app-name to="/">Team-CFP</Link>
          <UserMenu user={data.user} />
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
