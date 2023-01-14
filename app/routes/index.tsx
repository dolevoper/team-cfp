import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { LinksFunction, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProposals } from "~/utils/proposals.server";
import { IconButton, links as iconButtonLinks } from "~/components/IconButton";
import { useIsDesktopMode, usePrefersReducedMotion } from "~/utils/hooks";
import { formatProposalDate } from "~/utils/proposals.model";
import {
  notDesktopMediaQuery,
  desktopMediaQuery,
} from "~/utils/media-queries";
import { Persona, links as personaLinks } from "~/components/Persona";
import {
  ButtonPrimary,
  links as buttonPrimaryLinks,
} from "~/components/ButtonPrimary/ButtonPrimary";
import stylesUrl from "./index.css";
import mobileStylesUrl from "./index.mobile.css";
import desktopStylesUrl from "./index.desktop.css";

export const loader = async () =>
  json({
    proposals: await getAllProposals({ populate: { proposedBy: true } }),
  });

export const links: LinksFunction = () => [
  ...iconButtonLinks(),
  ...personaLinks(),
  ...buttonPrimaryLinks(),
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: mobileStylesUrl, media: notDesktopMediaQuery },
  { rel: "stylesheet", href: desktopStylesUrl, media: desktopMediaQuery },
];

export default function Index() {
  const { proposals } = useLoaderData<typeof loader>();
  const isDesktopMode = useIsDesktopMode();
  const [tableBody, setTableBody] = useState<ReactNode>(
    <MobileTableBody proposals={proposals} />
  );

  useEffect(() => {
    setTableBody(
      isDesktopMode ? (
        <DesktopTableBody proposals={proposals} />
      ) : (
        <MobileTableBody proposals={proposals} />
      )
    );
  }, [isDesktopMode, proposals]);

  return (
    <>
      <ButtonPrimary to="proposals/new">Submit proposal</ButtonPrimary>
      <table data-grid>
        <caption>Proposals</caption>
        {tableBody}
      </table>
    </>
  );
}

type TableBodyProps = SerializeFrom<typeof loader>;

function MobileTableBody({ proposals }: TableBodyProps) {
  const [expanded, setExpanded] = useState<string>();
  const [expanding, setExpanding] = useState<string>();
  const [collapsing, setCollapsing] = useState<string>();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      {proposals.map((proposal) => (
        <tbody key={proposal.id} data-expanded={expanded === proposal.id}>
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
                title={proposal.title}
              >
                {proposal.title}
              </Link>
            </td>
            <td>5</td>
            <td>
              <IconButton iconName="CaretSolidUp" title="Up vote" />
            </td>
          </tr>
          <tr
            data-grid-row-details
            data-expandable
            data-transition={
              expanding === proposal.id
                ? "enter"
                : collapsing === proposal.id
                ? "exit"
                : undefined
            }
          >
            <td>{proposal.type}</td>
            <td>{proposal.length}</td>
          </tr>
        </tbody>
      ))}
    </>
  );
}

function DesktopTableBody({ proposals }: TableBodyProps) {
  return (
    <>
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Length</th>
          <th>Up voutes</th>
          <th>Created at</th>
          <th>Proposed by</th>
        </tr>
      </thead>
      <tbody>
        {proposals.map((proposal) => (
          <tr key={proposal.id}>
            <td>
              <Link
                to={`proposals/${proposal.id}`}
                onClick={(e) => e.stopPropagation()}
                title={proposal.title}
              >
                {proposal.title}
              </Link>
            </td>
            <td>{proposal.type}</td>
            <td>{proposal.length}</td>
            <td>
              5 <IconButton iconName="CaretSolidUp" title="Up vote" />
            </td>
            <td>
              <time dateTime={proposal.createdAt}>
                {formatProposalDate(proposal.createdAt)}
              </time>
            </td>
            <td>
              {proposal.proposedBy ? (
                <Persona userData={proposal.proposedBy} />
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
