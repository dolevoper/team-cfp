import type {
  Dispatch,
  DispatchWithoutAction,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
} from "react";
import { useId } from "react";
import {
  createContext,
  useContext,
  useState,
  useRef,
  Children,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { useIsDesktopMode, useToggle } from "~/utils/hooks";
import Icon from "./Icon";

type OptionDef = { id: string; value: string | number; element: ReactNode };
type DropdownContext = {
  options: OptionDef[];
  setOptions: Dispatch<SetStateAction<OptionDef[]>>;
  value: string | number;
  setValue: Dispatch<SetStateAction<string | number>>;
  toggleIsOpen: DispatchWithoutAction;
};
const context = createContext<DropdownContext | undefined>(undefined);

const dialogsPortal =
  typeof document !== "undefined" && document.getElementById("dialogs");

type DropdownProps = PropsWithChildren & {
  name?: string;
  id?: string;
  defaultValue?: string | number;
  "aria-label"?: string;
};
export function Dropdown({
  name,
  id,
  defaultValue,
  "aria-label": ariaLabel,
  children,
}: DropdownProps) {
  const [options, setOptions] = useState<OptionDef[]>([]);
  const [value, setValue] = useState<string | number>(defaultValue ?? "");
  const [isOpen, toggleIsOpen] = useToggle();
  const [listbox, setListbox] = useState<ReactNode>();
  const [ariaHaspopup, setAriaHaspopup] = useState<"dialog">();
  const isDesktopMode = useIsDesktopMode();
  const selectRef = useRef<HTMLSelectElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const opts = [...(selectRef.current?.options ?? [])].map((option) => {
      const optionDef = options.find(
        ({ id }) => id === option.getAttribute("data-dropdown-option-id")
      );

      if (!optionDef) {
        return null;
      }

      return (
        <li
          data-dropdown-option
          role="option"
          aria-selected={
            selectRef.current?.selectedOptions[0].getAttribute(
              "data-dropdown-option-id"
            ) === optionDef.id
          }
          key={optionDef.id}
          id={optionDef.id}
          onClick={() => {
            setValue(optionDef.value);
            toggleIsOpen();
          }}
          tabIndex={isOpen ? 0 : undefined}
        >
          {optionDef.element}
        </li>
      );
    });

    if (isDesktopMode || !dialogsPortal) {
      setAriaHaspopup(undefined);
      setListbox(
        <ul
          data-dropdown-options
          role="listbox"
          aria-label="Dropdown list"
          id={listboxId}
          ref={listboxRef}
        >
          {opts}
        </ul>
      );
    } else {
      setAriaHaspopup("dialog");
      setListbox(
        createPortal(
          <div role="dialog" id={listboxId}>
            <div
              data-dropdown-backdrop
              data-is-open={isOpen}
              onClick={toggleIsOpen}
            ></div>
            <ul
              data-dropdown-options
              data-is-open={isOpen}
              role="listbox"
              tabIndex={0}
              aria-label="Dropdown list"
            >
              {opts}
            </ul>
          </div>,
          dialogsPortal
        )
      );
    }
  }, [isDesktopMode, isOpen, toggleIsOpen, listboxId, options]);

  return (
    <>
      <div data-dropdown>
        <select
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-haspopup={ariaHaspopup}
          aria-activedescendant={
            isOpen
              ? selectRef.current?.selectedOptions[0].getAttribute(
                  "data-dropdown-option-id"
                ) ?? undefined
              : undefined
          }
          aria-autocomplete="list"
          aria-label={ariaLabel}
          name={name}
          id={id}
          value={value}
          ref={selectRef}
          onChange={(e) => setValue(e.target.value)}
          onMouseDown={(e) => {
            if (!dialogsPortal && !isDesktopMode) {
              return;
            }

            e.preventDefault();
            toggleIsOpen();

            if (!isOpen) {
              selectRef.current?.focus();
            }
          }}
          onBlur={(e) => {
            if (
              !isDesktopMode ||
              !isOpen ||
              listboxRef.current?.contains(e.relatedTarget)
            ) {
              return;
            }

            toggleIsOpen();
          }}
          onKeyDown={(e) => {
            if (
              [" ", "Enter"].includes(e.key) ||
              (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) ||
              (isOpen && e.key === "Tab")
            ) {
              e.preventDefault();
              toggleIsOpen();
            } else if (e.key === "Escape" && isOpen) {
              toggleIsOpen();
            }
          }}
        >
          <context.Provider
            value={{ options, setOptions, value, setValue, toggleIsOpen }}
          >
            {children}
          </context.Provider>
        </select>
        <Icon iconName="ChevronDown" />
        {listbox}
      </div>
    </>
  );
}

export function useDropdown() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error("useDropdown must be used inside a dropdown");
  }

  return ctx;
}

type OptionProps = PropsWithChildren & {
  value?: string;
  displayText?: string;
  className?: string;
};
export function Option({ value, displayText, children }: OptionProps) {
  const stringContent = Children.toArray(children)
    .filter((child) => typeof child === "string")
    .join("");

  const actualDisplayText = displayText ?? stringContent;
  const actualValue = value ?? actualDisplayText;

  const { setOptions } = useDropdown();
  const id = useId();

  useEffect(() => {
    const option: OptionDef = { id, value: actualValue, element: children };

    setOptions((options) => [...options, option]);

    return () => {
      setOptions((options) => options.filter((opt) => opt !== option));
    };
  }, [id, actualValue, children, setOptions]);

  return (
    <option data-dropdown-option-id={id} value={actualValue}>
      {actualDisplayText}
    </option>
  );
}
