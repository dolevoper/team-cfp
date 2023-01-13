import type { ButtonHTMLAttributes } from "react";
import type { LinksFunction } from "@remix-run/node";
import type { IconNames } from "../Icon"
import Icon from "../Icon";
import stylesUrl from "./styles.css";
import hoverStyles from "./styles.hover.css";
import { hover } from "~/utils/media-queries";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesUrl },
    { rel: "stylesheet", href: hoverStyles, media: hover }
];

type IconButtonProps = { iconName: IconNames, title: string } & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;
export function IconButton({ iconName, title }: IconButtonProps) {
    return <button data-icon-button title={title}><Icon iconName={iconName} /><span data-visually-hidden>{title}</span></button>
}
