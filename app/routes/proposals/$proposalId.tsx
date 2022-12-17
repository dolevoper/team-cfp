import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { getProposalById } from "~/utils/proposals.server";
import stylesUrl from "~/styles/proposals.details.css";

export async function loader({ params: { proposalId } }: LoaderArgs) {
  const proposal = await getProposalById(proposalId!);

  if (!proposal) {
    throw new Response(`Proposal "${proposalId}" not found.`, { status: 404 });
  }

  return json({ proposal });
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function ViewProposal() {
  const { proposal } = useLoaderData<typeof loader>();

  return (
    <>
      <header data-page-header>
        <h1>{proposal.title}</h1>
        <Link to="/">Back</Link>
      </header>
      <section>
        <div>
          Created:{" "}
          <time dateTime={proposal.createdAt}>
            {new Intl.DateTimeFormat("en-US").format(
              new Date(proposal.createdAt)
            )}
          </time>
        </div>
        {proposal.type && <div>Type: {proposal.type}</div>}
        {proposal.length && <div>Length: {proposal.length}</div>}
      </section>
      {proposal.description && <section id="description">{proposal.description}</section>}
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <>
        <p>{caught.data}</p>
        <Link to="/">Back</Link>
      </>
    );
  }
}
