import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as uuid from "uuid";
import { desktopMediaQuery, tabletMediaQuery } from "~/utils/media-queries";
import {
  isValidProposalLength,
  isValidProposalType,
  proposalLengths,
  proposalTypes,
} from "~/utils/proposals.model";
import { submitProposal } from "~/utils/proposals.server";
import stylesUrl from "~/styles/proposals.new.css";
import tabletStylesUrl from "~/styles/proposals.new.tablet.css";
import desktopStylesUrl from "~/styles/proposals.new.desktop.css";

const listFormatter = new Intl.ListFormat("en", { type: "disjunction" });
const quote = (str: string) => `"${str}"`;

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const type = formData.get("type");
  const length = formData.get("length");
  const description = formData.get("description");

  if (typeof title !== "string" || typeof type !== "string" || typeof length !== "string" || typeof description !== "string") {
    return json({ fields: null, fieldErrors: null, formError: "Form not submitted correctly." }, { status: 400 });
  }

  const fieldErrors = {
    title: title ? undefined : "The proposal must include a title.",
    type: isValidProposalType(type) ? undefined : `Prorposal type must be ${listFormatter.format(proposalTypes.filter(Boolean).map(quote))}.`,
    length: isValidProposalLength(length) ? undefined : `Prorposal length must be ${listFormatter.format(proposalLengths.filter(Boolean).map(quote))}.`
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return json(
      {
        fields: { title, type, length, description },
        fieldErrors,
        formError: null
      },
      { status: 400 }
    );
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
      <Form method="post">
        <label htmlFor="title-input">Title</label>
        <input
          id="title-input"
          name="title"
          required
          defaultValue={actionData?.fields?.title}
        />
        <label htmlFor="type-select">Type</label>
        <select
          id="type-select"
          name="type"
          defaultValue={actionData?.fields?.type}
        >
          {proposalTypes.map((value, i) => <option key={i}>{value}</option>)}
        </select>
        <label htmlFor="length-select">Length</label>
        <select
          id="length-select"
          name="length"
          defaultValue={actionData?.fields?.length}
        >
          {proposalLengths.map((value, i) => <option key={i}>{value}</option>)}
        </select>
        <label htmlFor="description-input">Description</label>
        <textarea
          id="description-input"
          name="description"
          rows={6}
          defaultValue={actionData?.fields?.description}
        />
        <button type="submit" data-button-primary>Submit</button>
      </Form>
    </>
  );
}
