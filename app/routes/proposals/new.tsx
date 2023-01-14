import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as uuid from "uuid";
import { tabletMediaQuery } from "~/utils/media-queries";
import type { Proposal } from "~/utils/proposals.model";
import {
  isValidProposalLength,
  isValidProposalType,
  proposalLengths,
  proposalTypes,
} from "~/utils/proposals.model";
import { submitProposal } from "~/utils/proposals.server";
import { useIsDesktopMode } from "~/utils/hooks";
import { getUserData } from "~/utils/session.server";
import {
  Dropdown,
  Option,
  links as dropdownLinks,
} from "~/components/Dropdown/Dropdown";
import {
  ButtonPrimary,
  links as buttonPrimaryLinks,
} from "~/components/ButtonPrimary/ButtonPrimary";
import stylesUrl from "~/styles/proposals.new.css";
import tabletStylesUrl from "~/styles/proposals.new.tablet.css";

const listFormatter = new Intl.ListFormat("en", { type: "disjunction" });
const quote = (str: string) => `"${str}"`;

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const type = formData.get("type");
  const length = formData.get("length");
  const description = formData.get("description");

  if (
    typeof title !== "string" ||
    typeof type !== "string" ||
    typeof length !== "string" ||
    typeof description !== "string"
  ) {
    return json(
      {
        fields: null,
        fieldErrors: null,
        formError: "Form not submitted correctly.",
      },
      { status: 400 }
    );
  }

  const fieldErrors = {
    title: title ? undefined : "The proposal must include a title.",
    type: isValidProposalType(type)
      ? undefined
      : `Prorposal type must be ${listFormatter.format(
          proposalTypes.filter(Boolean).map(quote)
        )}.`,
    length: isValidProposalLength(length)
      ? undefined
      : `Prorposal length must be ${listFormatter.format(
          proposalLengths.filter(Boolean).map(quote)
        )}.`,
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return json(
      {
        fields: { title, type, length, description },
        fieldErrors,
        formError: null,
      },
      { status: 400 }
    );
  }

  const userData = getUserData(request);

  await submitProposal({
    id: uuid.v4(),
    title,
    proposedByPrincipalId: userData.principalId,
    type: type as Proposal["type"],
    length: length as Proposal["length"],
    description,
  });

  return redirect("/");
};

export const links: LinksFunction = () => [
  ...dropdownLinks(),
  ...buttonPrimaryLinks(),
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: tabletStylesUrl, media: tabletMediaQuery },
];

export default function New() {
  const actionData = useActionData<typeof action>();
  const isDesktopMode = useIsDesktopMode();

  const shouldDisplayValidation = Object.values(
    actionData?.fieldErrors ?? {}
  ).some(Boolean)
    ? true
    : undefined;

  return (
    <>
      <header data-page-header>
        <h1>Submit proposal</h1>
        <Link to="/">Back</Link>
      </header>
      <Form
        method="post"
        noValidate
        data-display-validation={shouldDisplayValidation}
      >
        <div data-field-wrapper>
          <label htmlFor="title-input">Title</label>
          <input
            id="title-input"
            name="title"
            required
            autoFocus
            defaultValue={actionData?.fields?.title}
          />
          {actionData?.fieldErrors?.title && (
            <p role="alert">{actionData.fieldErrors.title}</p>
          )}
        </div>
        <div data-field-wrapper>
          <label htmlFor="type-select">Type</label>
          <Dropdown
            name="type"
            id="type-select"
            defaultValue={actionData?.fields?.type}
          >
            {proposalTypes.map((value, i) =>
              !value ? (
                <Option key={i} displayText="">
                  <span
                    data-visually-hidden={isDesktopMode ? true : undefined}
                    style={{ color: "var(--red)" }}
                  >
                    Clear
                  </span>
                </Option>
              ) : (
                <Option key={i}>{value}</Option>
              )
            )}
          </Dropdown>
          {actionData?.fieldErrors?.type && (
            <p role="alert">{actionData.fieldErrors.type}</p>
          )}
        </div>
        <div data-field-wrapper>
          <label htmlFor="length-select">Length</label>
          <Dropdown
            id="length-select"
            name="length"
            defaultValue={actionData?.fields?.length}
          >
            {proposalLengths.map((value, i) =>
              !value ? (
                <Option key={i} displayText="">
                  <span
                    data-visually-hidden={isDesktopMode ? true : undefined}
                    style={{ color: "var(--red)" }}
                  >
                    Clear
                  </span>
                </Option>
              ) : (
                <Option key={i}>{value}</Option>
              )
            )}
          </Dropdown>
          {actionData?.fieldErrors?.length && (
            <p role="alert">{actionData.fieldErrors.length}</p>
          )}
        </div>
        <div data-field-wrapper>
          <label htmlFor="description-input">Description</label>
          <textarea
            id="description-input"
            name="description"
            rows={6}
            defaultValue={actionData?.fields?.description}
          />
        </div>
        <ButtonPrimary type="submit">Submit</ButtonPrimary>
      </Form>
    </>
  );
}
