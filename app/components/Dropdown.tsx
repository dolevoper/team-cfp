import type { PropsWithChildren } from "react";
import Icon from "./Icon";

type DropdownProps = PropsWithChildren
export default function Dropdown({ children }: DropdownProps) {
  return (
    <div data-dropdown>
      <div data-dropdown-title tabIndex={0}>
        <span>Selected option</span>
        <Icon iconName="ChevronDown" />
      </div>
      <div data-dropdown-options>
        {children}
      </div>
    </div>
  );
}
