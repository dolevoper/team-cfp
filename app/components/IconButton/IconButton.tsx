import type { ButtonHTMLAttributes } from "react";
import type { LinksFunction } from "@remix-run/node";
import type { IconNames } from "../Icon"
import Icon from "../Icon";
import stylesUrl from "./styles.css";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesUrl },
];

type IconButtonProps = { iconName: IconNames, title: string } & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;
export function IconButton({ iconName, title }: IconButtonProps) {
    return <button data-icon-button title={title}><Icon iconName={iconName} /><span data-visually-hidden>{title}</span></button>
}
