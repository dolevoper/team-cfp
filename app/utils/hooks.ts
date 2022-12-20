import { useEffect, useReducer, useState } from "react";
import { desktopMediaQuery, preferesReducedMotion } from "./media-queries";

function matchMedia(media: string, onServer = false) {
    if (typeof document === "undefined") {
        return onServer;
    }

    return window.matchMedia(media).matches;
}

export function useIsDesktopMode() {
    const [isDesktopMode, setIsDesktopMode] = useState(matchMedia(desktopMediaQuery));

    useEffect(() => {
        const mql = window.matchMedia(desktopMediaQuery);

        function listener(e: MediaQueryListEvent) {
            setIsDesktopMode(e.matches);
        }

        mql.addEventListener("change", listener);

        return () => {
            mql.removeEventListener("change", listener);
        };
    }, []);

    return isDesktopMode;
}

export function useToggle(initialState = false) {
    return useReducer((value) => !value, initialState);
}

export function useAnimation() {
    const [state, setState] = useState<"idle" | "enter" | "exit">("idle");

    return {
        animationProps: state === "idle" ? undefined : { "data-transition": state },
        triggerEnterAnd<T extends any[]>(callback = (...args: T) => {}) {
            if (state !== "idle") {
                return undefined;
            }

            return (...args: T) => {
                callback(...args);

                if (matchMedia(preferesReducedMotion)) {
                    return;
                }

                setState("enter");

                setTimeout(() => setState("idle"), 100);
            }
        },
        triggerExitAnd<T extends any[]>(callback = (...args: T) => {}) {
            if (state !== "idle") {
                return undefined;
            }

            return (...args: T) => {
                if (matchMedia(preferesReducedMotion)) {
                    callback(...args);
                    return;
                }

                setState("exit");

                setTimeout(() => {
                    callback(...args);
                    setState("idle");
                }, 100);
            }
        }
    };
}
