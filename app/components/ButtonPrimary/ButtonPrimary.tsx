import type { ComponentProps, ForwardedRef } from "react";
import { forwardRef } from "react";
import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { hover } from "~/utils/media-queries";
import stylesUrl from "./styles.css";
import hoverStylesUrl from "./styles.hover.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: hoverStylesUrl, media: hover },
];

type ButtonProps = JSX.IntrinsicElements["button"] & { to?: undefined };
type LinkProps = ComponentProps<typeof Link>;
type PolymorphicProps = ButtonProps | LinkProps;
type PolymorphicButton = {
  (props: ButtonProps): JSX.Element;
  (props: LinkProps): JSX.Element;
};

function isLink(props: PolymorphicProps): props is LinkProps {
  return props.to !== undefined;
}

export const ButtonPrimary = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  PolymorphicProps
>(function ButtonPrimary(props, ref) {
  return isLink(props) ? (
    <Link
      {...props}
      ref={ref as ForwardedRef<HTMLAnchorElement>}
      data-button-primary
    >
      {props.children}
    </Link>
  ) : (
    <button
      {...props}
      ref={ref as ForwardedRef<HTMLButtonElement>}
      data-button-primary
    >
      {props.children}
    </button>
  );
}) as PolymorphicButton;
