const desktopWidth = 1500;

export const tabletMediaQuery = `(min-width: ${550 / 16}rem)`;
export const laptopMediaQuery = `(min-width: ${1100 / 16}rem)`;
export const desktopMediaQuery = `(min-width: ${desktopWidth / 16}rem)`;
export const notDesktopMediaQuery = `(max-width: ${(desktopWidth - 1) / 16}rem)`;

export const preferesReducedMotion = "(prefers-reduced-motion: reduce)";
