import type { ButtonHTMLAttributes } from "react";
import type { IconNames } from "./Icon"
import Icon from "./Icon";

type IconButtonProps = { iconName: IconNames, title: string } & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;
export function IconButton({ iconName, title }: IconButtonProps) {
    return <button data-icon-button title={title}><Icon iconName={iconName} /><span data-visually-hidden>{title}</span></button>
}
