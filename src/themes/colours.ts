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

export type ColorStyle = {
  bgColour: string;
  textColour: string;
  borderColour: string;
};

export type ColorNames = "redMain" | "redLight" | "redLightest" |
  "orangeMain" | "orangeLight" | "orangeLightest" |
  "amberMain" | "amberLight" | "amberLightest" |
  "limeMain" | "limeLight" | "limeLightest" |
  "greenMain" | "greenLight" | "greenLightest" |
  "cyanMain" | "cyanLight" | "cyanLightest" |
  "blueMain" | "blueLight" | "blueLightest" |
  "indigoMain" | "indigoLight" | "indigoLightest" |
  "violetMain" | "violetLight" | "violetLightest" |
  "purpleMain" | "purpleLight" | "purpleLightest" |
  "black" | "white" | "grey";

export const objectColorSettings: Record<ColorNames, ColorStyle> = {
  redMain: {
    bgColour: objectPalette.red.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  redLight: {
    bgColour: objectPalette.red.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  redLightest: {
    bgColour: objectPalette.red.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  orangeMain: {
    bgColour: objectPalette.orange.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  orangeLight: {
    bgColour: objectPalette.orange.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  orangeLightest: {
    bgColour: objectPalette.orange.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  amberMain: {
    bgColour: objectPalette.amber.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  amberLight: {
    bgColour: objectPalette.amber.light,  
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  amberLightest: {
    bgColour: objectPalette.amber.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  limeMain: {
    bgColour: objectPalette.lime.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  limeLight: {
    bgColour: objectPalette.lime.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  limeLightest: {
    bgColour: objectPalette.lime.lightest, 
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  greenMain: {
    bgColour: objectPalette.green.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  greenLight: {
    bgColour: objectPalette.green.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  greenLightest: {
    bgColour: objectPalette.green.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  cyanMain: {
    bgColour: objectPalette.cyan.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  cyanLight: {
    bgColour: objectPalette.cyan.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  cyanLightest: {
    bgColour: objectPalette.cyan.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  blueMain: {
    bgColour: objectPalette.blue.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  blueLight: {
    bgColour: objectPalette.blue.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  blueLightest: {
    bgColour: objectPalette.blue.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  indigoMain: {
    bgColour: objectPalette.indigo.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  indigoLight: {
    bgColour: objectPalette.indigo.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  indigoLightest: {
    bgColour: objectPalette.indigo.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  violetMain: {
    bgColour: objectPalette.violet.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  violetLight: {
    bgColour: objectPalette.violet.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  violetLightest: {
    bgColour: objectPalette.violet.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  purpleMain: {
    bgColour: objectPalette.purple.main,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  purpleLight: {
    bgColour: objectPalette.purple.light,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  purpleLightest: {
    bgColour: objectPalette.purple.lightest,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  black: {
    bgColour: basePalette.black,
    textColour: basePalette.white,
    borderColour: basePalette.grey[500],
  },
  white: {
    bgColour: basePalette.white,
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  grey: {
    bgColour: basePalette.grey[500],
    textColour: basePalette.black,
    borderColour: basePalette.black,
  }
};
