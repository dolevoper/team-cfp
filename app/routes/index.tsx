import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProposals } from "~/utils/proposals.server";
import stylesUrl from "~/styles/index.css";
import { IconButton } from "~/components/IconButton";
import { useState } from "react";
import { usePrefersReducedMotion } from "~/utils/hooks";

export const loader = async () =>
  json({
    proposals: await getAllProposals(),
  });

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function Index() {
  const { proposals } = useLoaderData<typeof loader>();
  const [expanded, setExpanded] = useState<string>();
  const [expanding, setExpanding] = useState<string>();
  const [collapsing, setCollapsing] = useState<string>();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      <Link to="proposals/new" data-button-primary>
        Submit proposal
      </Link>
      <table data-grid>
        <caption>Proposals</caption>
        {proposals.map((proposal) => (
          <tbody
            key={proposal.id}
            data-expanded={expanded === proposal.id}
          >
            <tr
              onClick={() => {
                function expand() {
                  setExpanded(proposal.id);
                  setExpanding(proposal.id);

                  setTimeout(() => setExpanding(undefined), 100);
                }

                if (prefersReducedMotion) {
                  setExpanded(expanded === proposal.id ? undefined : proposal.id);
                  return;
                }

                if (!expanded) {
                  expand();
                  return;
                }

                setCollapsing(expanded);
                setTimeout(() => {
                  setCollapsing(undefined);

                  if (expanded === proposal.id) {
                    setExpanded(undefined);
                    return;
                  }

                  expand();
                }, 100);
              }}
            >
              <td>
                <Link
                  to={`proposals/${proposal.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {proposal.title}
                </Link>
              </td>
              <td>5</td>
              <td>
                <IconButton iconName="CaretSolidUp" title="Up vote" />
              </td>
            </tr>
            <tr data-grid-row-details data-expandable data-transition={expanding === proposal.id ? "enter" : collapsing === proposal.id ? "exit" : undefined}>
              <td>{proposal.type}</td>
              <td>{proposal.length}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </>
  );
}
