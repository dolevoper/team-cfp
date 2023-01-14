import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { getProposalById } from "~/utils/proposals.server";
import { users } from "~/utils/users.server";
import { Persona, links as personaLinks } from "~/components/Persona";
import { formatProposalDate } from "~/utils/proposals.model";
import { PageHeader, links as pageHeaderLinks } from "~/components/PageHeader";
import stylesUrl from "./proposalId.css";

export async function loader({ params: { proposalId } }: LoaderArgs) {
  const proposal = await getProposalById(proposalId!);

  if (!proposal) {
    throw new Response(`Proposal "${proposalId}" not found.`, { status: 404 });
  }

  const proposedBy = users.get(proposal.proposedByPrincipalId);

  return json({ proposal, proposedBy });
}

export const links: LinksFunction = () => [
  ...personaLinks(),
  ...pageHeaderLinks(),
  { rel: "stylesheet", href: stylesUrl },
];

export default function ViewProposal() {
  const { proposal, proposedBy } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader title={proposal.title} />
      <dl>
        <dt>Created</dt>
        <dd>
          <time dateTime={proposal.createdAt}>
            {formatProposalDate(proposal.createdAt)}
          </time>
        </dd>
        {proposedBy && (
          <>
            <dt>Proposed by</dt>
            <dd>
              <Persona userData={proposedBy} />
            </dd>
          </>
        )}
        {proposal.type && (
          <>
            <dt>Type</dt>
            <dd>{proposal.type}</dd>
          </>
        )}
        {proposal.length && (
          <>
            <dt>Length</dt>
            <dd>{proposal.length}</dd>
          </>
        )}
      </dl>
      {proposal.description && (
        <section id="description">{proposal.description}</section>
      )}
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
