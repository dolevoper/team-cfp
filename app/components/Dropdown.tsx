import type {
  Dispatch,
  DispatchWithoutAction,
  PropsWithChildren,
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

type DropdownProps = PropsWithChildren & {
  name?: string;
  id?: string;
  defaultValue?: string | number;
};
export function Dropdown({ name, id, defaultValue, children }: DropdownProps) {
  const [options, setOptions] = useState<OptionDef[]>([]);
  const [value, setValue] = useState<string | number>(defaultValue ?? "");
  const [isOpen, toggleIsOpen] = useToggle();
  const isDesktopMode = useIsDesktopMode();
  const selectRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  let listbox;

  if (typeof document !== "undefined") {
    if (isDesktopMode) {
      listbox = (
        <>
          <div
            data-dropdown-options
            onBlur={(e) => {
              if (
                !isOpen ||
                e.relatedTarget === titleRef.current ||
                e.target.contains(e.relatedTarget)
              ) {
                return;
              }

              toggleIsOpen();
            }}
            ref={optionsRef}
            tabIndex={0}
          >
            {children}
          </div>
        </>
      );
    } else {
      listbox = createPortal(
        <>
          <div
            data-dropdown-backdrop
            data-is-open={isOpen}
            onClick={toggleIsOpen}
          ></div>
          <div
            data-dropdown-options
            data-is-open={isOpen}
            ref={optionsRef}
            tabIndex={0}
          >
            {children}
          </div>
        </>,
        document.getElementById("dialogs")!
      );
    }
  }

  return (
    <>
      <div data-dropdown>
        <div
          data-dropdown-title
          aria-expanded={isOpen}
          ref={titleRef}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleIsOpen();

            if (!isOpen) {
              // optionsRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
              optionsRef.current?.focus();
            }
          }}
        >
          <select
            name={name}
            id={id}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            ref={selectRef}
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
  const { setOptions, setValue, toggleIsOpen } = useDropdown();
  const stringContent = Children.toArray(children)
    .filter((child) => typeof child === "string")
    .join("");

  const actualValue = value ?? displayText ?? stringContent;

  useEffect(() => {
    console.log("hi");
    setOptions((options) => [
      ...options,
      { value: actualValue, displayText: displayText ?? stringContent },
    ]);

    return () => {
      console.log("bye");
      setOptions((options) =>
        options.filter((opt) => opt.value !== actualValue)
      );
    };
  }, [setOptions, displayText, stringContent, actualValue]);

  return (
    <button
      data-dropdown-option
      type="button"
      tabIndex={-1}
      className={className}
      onClick={() => {
        setValue(actualValue);
        toggleIsOpen();
      }}
      data-value={value ?? displayText ?? stringContent}
    >
      {children}
    </button>
  );
}
