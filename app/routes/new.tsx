import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import * as uuid from "uuid";
import {
  isValidProposalLength,
  isValidProposalType,
  submitProposal,
} from "~/utils/proposals.server";
import stylesUrl from "./new.css";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const type = formData.get("type")?.toString() ?? "";
  const length = formData.get("length")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? "";

  if (!title) {
    return json(
      {
        fields: { title, type, length, description },
      },
      { status: 400 }
    ); // TODO: return error data
  }

  if (!isValidProposalType(type)) {
    return json(
      {
        fields: { title, type, length, description },
      },
      { status: 400 }
    ); // TODO: return error data
  }

  if (!isValidProposalLength(length)) {
    return json(
      {
        fields: { title, type, length, description },
      },
      { status: 400 }
    ); // TODO: return error data
  }

  await submitProposal({
    id: uuid.v4(),
    title,
    type,
    length,
    description,
  });

  return redirect("/");
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function New() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      <header>
        <h1>Submit proposal</h1>
      </header>
      <main>
        <form method="post">
          <label>
            <span>Title</span>
            <input
              name="title"
              required
              defaultValue={actionData?.fields.title}
            />
          </label>
          <label>
            <span>Type</span>
            <select name="type" defaultValue={actionData?.fields.type}>
              <option></option>
              <option>Talk</option>
              <option>Workshop</option>
            </select>
          </label>
          <label>
            <span>Length</span>
            <select name="length" defaultValue={actionData?.fields.length}>
              <option></option>
              <option>15 mins</option>
              <option>30 mins</option>
              <option>45 mins</option>
              <option>1 hour</option>
            </select>
          </label>
          <label>
            <span>Description</span>
            <textarea
              name="description"
              rows={6}
              defaultValue={actionData?.fields.description}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </main>
    </>
  );
}
