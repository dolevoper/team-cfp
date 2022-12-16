import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProposals } from "~/utils/proposals.server";
import stylesUrl from "~/styles/index.css";

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
      <Link to="proposals/new" data-button-primary>Submit proposal</Link>
      <ul data-grid>
        {proposals.map(({ id, title }) => (
          <li key={id}><Link to={`proposals/${id}`}>{title}</Link></li>
        ))}
      </ul>
    </>
  );
}
