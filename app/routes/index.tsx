import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProposals } from "~/utils/proposals.server";

export const loader = async () => json({
  proposals: await getAllProposals()
});

export default function Index() {
  const { proposals } = useLoaderData<typeof loader>();

  return (
    <main>
      <Link to="new">+</Link>
      <ul>
        {proposals.map(({ id, title }) => <li key={id}>{title}</li>)}
      </ul>
    </main>
  );
}
