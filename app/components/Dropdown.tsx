import type {
  Dispatch,
  DispatchWithoutAction,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
} from "react";
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

type OptionDef = { value: string | number; displayText: string };
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
};
export function Dropdown({ name, id, defaultValue, children }: DropdownProps) {
  const [options, setOptions] = useState<OptionDef[]>([]);
  const [value, setValue] = useState<string | number>(defaultValue ?? "");
  const [isOpen, toggleIsOpen] = useToggle();
  const [listbox, setListbox] = useState<ReactNode>();
  const isDesktopMode = useIsDesktopMode();
  const selectRef = useRef<HTMLSelectElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isDesktopMode || !dialogsPortal) {
      setListbox(
        <ul data-dropdown-options ref={listboxRef}>
          {children}
        </ul>
      );
    } else {
      setListbox(
        createPortal(
          <>
            <div
              data-dropdown-backdrop
              data-is-open={isOpen}
              onClick={toggleIsOpen}
            ></div>
            <ul data-dropdown-options data-is-open={isOpen} tabIndex={0}>
              {children}
            </ul>
          </>,
          dialogsPortal
        )
      );
    }
  }, [isDesktopMode, children, isOpen, toggleIsOpen]);

  return (
    <>
      <div data-dropdown>
        <div
          data-dropdown-title
          aria-expanded={isOpen}
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
        >
          <select
            name={name}
            id={id}
            value={value}
            ref={selectRef}
            onChange={(e) => setValue(e.target.value)}
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
            {options.map(({ value, displayText }) => (
              <option key={value} value={value}>
                {displayText}
              </option>
            ))}
          </select>
          <Icon iconName="ChevronDown" />
        </div>
        <context.Provider
          value={{ options, setOptions, value, setValue, toggleIsOpen }}
        >
          {listbox}
        </context.Provider>
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
export function Option({
  value,
  displayText,
  className,
  children,
}: OptionProps) {
  const {
    setOptions,
    setValue,
    toggleIsOpen,
    value: selectedValue,
  } = useDropdown();
  const stringContent = Children.toArray(children)
    .filter((child) => typeof child === "string")
    .join("");

  const actualValue = value ?? displayText ?? stringContent;

  useEffect(() => {
    setOptions((options) => [
      ...options,
      { value: actualValue, displayText: displayText ?? stringContent },
    ]);

    return () => {
      setOptions((options) =>
        options.filter((opt) => opt.value !== actualValue)
      );
    };
  }, [setOptions, displayText, stringContent, actualValue]);

  return (
    <li
      data-dropdown-option
      data-selected={selectedValue === actualValue}
      className={className}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={() => {
          setValue(actualValue);
          toggleIsOpen();
        }}
      >
        {children}
      </button>
    </li>
  );
}
