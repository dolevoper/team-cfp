import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProposals } from "~/utils/proposals.server";
import stylesUrl from "./index.css";

export const loader = async () =>
  json({
    proposals: await getAllProposals(),
  });

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function Index() {
  const { proposals } = useLoaderData<typeof loader>();

  return (
    <>
      <header className="page-header">
        <h1>Proposals</h1>
      </header>
      <Link to="new">Submit proposal</Link>
      <ul>
        {proposals.map(({ id, title }) => (
          <li key={id}>{title}</li>
        ))}
      </ul>
    </>
  );
}
