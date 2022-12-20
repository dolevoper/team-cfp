import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useState,
  useRef,
  Children,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { useAnimation, useIsDesktopMode, useToggle } from "~/utils/hooks";
import Icon from "./Icon";

type DropdownContext = {
  createSelector(value?: string, displayText?: string): ((e: any) => void) | undefined;
};
const context = createContext<DropdownContext | undefined>(undefined);

type DropdownProps = PropsWithChildren & {
  name?: string;
  id?: string;
  defaultValue?: string | number;
};
export function Dropdown({ name, id, defaultValue, children }: DropdownProps) {
  const [isOpen, toggleIsOpen] = useToggle();
  const [selection, setSelection] = useState("");
  const isDesktopMode = useIsDesktopMode();
  const { animationProps, triggerEnterAnd, triggerExitAnd } = useAnimation();
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    loaded.current = true;
  }, []);

  function createSelector(value?: string, displayText?: string) {
    function doSelection() {
      setSelection(displayText ?? value ?? "");
      toggleIsOpen();

      if (!inputRef.current) {
        return;
      }

      inputRef.current.value = value ?? displayText ?? "";
    }

    if (!loaded.current && (value ?? displayText) === defaultValue) {
      doSelection();
    }

    return triggerExitAnd((e: MouseEvent) => {
      e.preventDefault();
      doSelection();
    });
  }

  let options;

  if (typeof document !== "undefined") {
    if (isDesktopMode) {
      options = (
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
            <context.Provider value={{ createSelector }}>
              {children}
            </context.Provider>
          </div>
        </>
      );
    } else if (isOpen) {
      options = createPortal(
        <>
          <div data-dropdown-backdrop {...animationProps} onClick={triggerExitAnd(toggleIsOpen)}></div>
          <div data-dropdown-options {...animationProps} ref={optionsRef} tabIndex={0}>
            <context.Provider value={{ createSelector }}>
              {children}
            </context.Provider>
          </div>
        </>,
        document.getElementById("dialogs")!
      );
    }
  }

  return (
    <>
      <input type="hidden" name={name} id={id} ref={inputRef} />
      <div data-dropdown>
        <div
          data-dropdown-title
          tabIndex={0}
          aria-expanded={isOpen}
          ref={titleRef}
          onClick={triggerEnterAnd(() => {
            toggleIsOpen();
            
            if (!isOpen) {
                // optionsRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                optionsRef.current?.focus();
            }
          })}
        >
          <span>{selection}</span>
          <Icon iconName="ChevronDown" />
        </div>
        {options}
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
  const { createSelector } = useDropdown();
  const stringContent = Children.toArray(children)
    .filter((child) => typeof child === "string")
    .join("");

  return (
    <button
      data-dropdown-option
      type="button"
      tabIndex={-1}
      className={className}
      onClick={createSelector(value, displayText ?? stringContent)}
      data-value={value ?? displayText ?? stringContent}
    >
      {children}
    </button>
  );
}
