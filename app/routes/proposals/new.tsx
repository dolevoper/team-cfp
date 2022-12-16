import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import * as uuid from "uuid";
import { desktopMediaQuery, tabletMediaQuery } from "~/utils/media-queries";
import {
  isValidProposalLength,
  isValidProposalType,
  submitProposal,
} from "~/utils/proposals.server";
import stylesUrl from "~/styles/proposals.new.css";
import tabletStylesUrl from "~/styles/proposals.new.tablet.css";
import desktopStylesUrl from "~/styles/proposals.new.desktop.css";

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
  { rel: "stylesheet", href: tabletStylesUrl, media: tabletMediaQuery },
  { rel: "stylesheet", href: desktopStylesUrl, media: desktopMediaQuery },
];

export default function New() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      <header data-page-header>
        <h1>Submit proposal</h1>
        <Link to="/">Back</Link>
      </header>
      <form method="post">
        <label htmlFor="title-input">Title</label>
        <input
          id="title-input"
          name="title"
          required
          defaultValue={actionData?.fields.title}
        />
        <label htmlFor="type-select">Type</label>
        <select
          id="type-select"
          name="type"
          defaultValue={actionData?.fields.type}
        >
          <option></option>
          <option>Talk</option>
          <option>Workshop</option>
        </select>
        <label htmlFor="length-select">Length</label>
        <select
          id="length-select"
          name="length"
          defaultValue={actionData?.fields.length}
        >
          <option></option>
          <option>15 mins</option>
          <option>30 mins</option>
          <option>45 mins</option>
          <option>1 hour</option>
        </select>
        <label htmlFor="description-input">Description</label>
        <textarea
          id="description-input"
          name="description"
          rows={6}
          defaultValue={actionData?.fields.description}
        />
        <button type="submit" data-button-primary>Submit</button>
      </form>
    </>
  );
}
