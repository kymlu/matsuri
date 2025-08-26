export const basePalette = {
  primary: {
    main: "#AB1010",
    light: "#C94A4A", 
    lighter: "#E28989", 
    dark: "#8A0D0D",  
    darker: "#690A0A",  
  },
  grey: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  white: "#FFFFFF",
  black: "#000000",
};

export type BasePalette = typeof basePalette;

export const objectPalette = {
  red: {
    main: "#FF595E",
    light: "#FF7D81", 
    lightest: "#FFB3B5",
  },
  orange: {
    main: "#FF924C",
    light: "#FFAD75",
    lightest: "#FFD1AD",
  },
  amber: {
    main: "#FFCA3A",
    light: "#FFD766",
    lightest: "#FFE8A3",
  },
  lime: {
    main: "#C5CA30",
    light: "#D6DB5A",
    lightest: "#E9EE9B",
  },
  green: {
    main: "#8AC926",
    light: "#A3D94F",
    lightest: "#C7EB94",
  },
  cyan: {
    main: "#36949D",
    light: "#5AB0B9",
    lightest: "#9ED5DA",
  },
  blue: {
    main: "#1982C4",
    light: "#4D9ED1",
    lightest: "#95C6E3",
  },
  indigo: {
    main: "#4267AC",
    light: "#6887C1",
    lightest: "#A3B3D9",
  },
  violet: {
    main: "#565AA0",
    light: "#7A7EB7",
    lightest: "#B1B4D6",
  },
  purple: {
    main: "#6A4C93",
    light: "#8A71AC",
    lightest: "#B6A2CD",
  },
};

export type ObjectPalette = typeof objectPalette;