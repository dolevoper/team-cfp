import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProposals } from "~/utils/proposals.server";
import stylesUrl from "~/styles/index.css";
import { IconButton } from "~/components/IconButton";
import { useState } from "react";

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

  return (
    <>
      <Link to="proposals/new" data-button-primary>
        Submit proposal
      </Link>
      <table data-grid>
        <caption>Proposals</caption>
        {proposals.map((proposal) => (
          <tbody key={proposal.id} data-expanded={expanded === proposal.id}>
            <tr
              onClick={() =>
                expanded === proposal.id
                  ? setExpanded(undefined)
                  : setExpanded(proposal.id)
              }
            >
              <td>
                <Link to={`proposals/${proposal.id}`} onClick={(e) => e.stopPropagation()}>{proposal.title}</Link>
              </td>
              <td>5</td>
              <td>
                <IconButton iconName="CaretSolidUp" title="Up vote" />
              </td>
            </tr>
            <tr data-grid-row-details>
              <td>{proposal.type}</td>
              <td>{proposal.length}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </>
  );
}
