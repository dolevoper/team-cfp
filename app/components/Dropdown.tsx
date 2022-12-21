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

type OptionDef = { id: string; value: string | number; displayText: string };
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
export function Dropdown({ name, id, defaultValue, "aria-label": ariaLabel, children }: DropdownProps) {
  const [options, setOptions] = useState<OptionDef[]>([]);
  const [value, setValue] = useState<string | number>(defaultValue ?? "");
  const [isOpen, toggleIsOpen] = useToggle();
  const [listbox, setListbox] = useState<ReactNode>();
  const isDesktopMode = useIsDesktopMode();
  const selectRef = useRef<HTMLSelectElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (isDesktopMode || !dialogsPortal) {
      setListbox(
        <ul
          data-dropdown-options
          role="listbox"
          id={listboxId}
          ref={listboxRef}
        >
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
            <ul
              data-dropdown-options
              data-is-open={isOpen}
              role="dialog"
              id={listboxId}
              tabIndex={0}
            >
              {children}
            </ul>
          </>,
          dialogsPortal
        )
      );
    }
  }, [isDesktopMode, children, isOpen, toggleIsOpen, listboxId]);

  return (
    <>
      <div data-dropdown>
        <select
          role="combobox"
          aria-expanded={isOpen ? "true" : undefined}
          aria-controls={isOpen ? listboxId : undefined}
          aria-haspopup={isDesktopMode ? undefined : "dialog"}
          aria-activedescendant={
            isOpen ? options.find((opt) => opt.value === value)?.id : undefined
          }
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
          {options.map(({ value, displayText }) => (
            <option key={value} value={value}>
              {displayText}
            </option>
          ))}
        </select>
        <Icon iconName="ChevronDown" />
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
  const id = useId();

  const stringContent = Children.toArray(children)
    .filter((child) => typeof child === "string")
    .join("");

  const actualValue = value ?? displayText ?? stringContent;

  useEffect(() => {
    setOptions((options) => [
      ...options,
      { id, value: actualValue, displayText: displayText ?? stringContent },
    ]);

    return () => {
      setOptions((options) =>
        options.filter((opt) => opt.value !== actualValue)
      );
    };
  }, [setOptions, displayText, stringContent, actualValue, id]);

  return (
    <li
      data-dropdown-option
      role="option"
      aria-selected={selectedValue === actualValue}
      className={className}
      id={id}
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
