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
    darkest: "#8a1c20",
    darker:  "#ab2b2f",
    main:    "#FF595E",
    light:   "#FFA1A4",
    lightest:"#FFC5C7",
  },

  orange: {
    darkest: "#8a3612",
    darker:  "#ab4a1b",
    main:    "#FF924C",
    light:   "#FFC999",
    lightest:"#FFE6BE",
  },

  amber: {
    darkest: "#8a5a00",
    darker:  "#ab7900",
    main:    "#FFCA3A",
    light:   "#FFEB8C",
    lightest:"#FFFFB3",
  },

  lime: {
    darkest: "#5c600c",
    darker:  "#7b810f",
    main:    "#C5CA30",
    light:   "#EAED82",
    lightest:"#FFFFAB",
  },

  green: {
    darkest: "#36510a",
    darker:  "#4c7211",
    main:    "#8AC926",
    light:   "#BFEC79",
    lightest:"#DBFFA3",
  },

  cyan: {
    darkest: "#1a4549",
    darker:  "#215e64",
    main:    "#36949D",
    light:   "#84CDD4",
    lightest:"#AEEAEF",
  },

  blue: {
    darkest: "#0a375c",
    darker:  "#0d4f7e",
    main:    "#1982C4",
    light:   "#78BCE5",
    lightest:"#A4DAFA",
  },

  indigo: {
    darkest: "#1c2e56",
    darker:  "#273d6f",
    main:    "#4267AC",
    light:   "#8DA6D8",
    lightest:"#B3C5EF",
  },

  violet: {
    darkest: "#27294e",
    darker:  "#343769",
    main:    "#565AA0",
    light:   "#9EA2D1",
    lightest:"#C3C6EB",
  },

  purple: {
    darkest: "#291a40",
    darker:  "#3a2658",
    main:    "#6A4C93",
    light:   "#A991C6",
    lightest:"#C8B2E1",
  },
};

export const colorPickerSelection = [
  ...Object.values(objectPalette).flatMap(Object.values),
  ...Object.values(basePalette.grey),
  basePalette.black,
  basePalette.white,
];

export type ObjectPalette = typeof objectPalette;

export type ColorStyle = {
  bgColour?: string | undefined;
  twColor: string;
  textColour?: string | undefined;
  borderColour?: string | undefined;
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
  "black" | "white" | "grey1" | "grey2" | "grey3"| "grey4";

export const objectColorSettings: Record<ColorNames, ColorStyle> = {
  redMain: {
    bgColour: objectPalette.red.main,
    twColor: "bg-red",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  redLight: {
    bgColour: objectPalette.red.light,
    twColor: "bg-red-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  redLightest: {
    bgColour: objectPalette.red.lightest,
    twColor: "bg-red-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  orangeMain: {
    bgColour: objectPalette.orange.main,
    twColor: "bg-orange",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  orangeLight: {
    bgColour: objectPalette.orange.light,
    twColor: "bg-orange-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  orangeLightest: {
    bgColour: objectPalette.orange.lightest,
    twColor: "bg-orange-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  amberMain: {
    bgColour: objectPalette.amber.main,
    twColor: "bg-amber",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  amberLight: {
    bgColour: objectPalette.amber.light,  
    twColor: "bg-amber-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  amberLightest: {
    bgColour: objectPalette.amber.lightest,
    twColor: "bg-amber-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  limeMain: {
    bgColour: objectPalette.lime.main,
    twColor: "bg-lime",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  limeLight: {
    bgColour: objectPalette.lime.light,
    twColor: "bg-lime-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  limeLightest: {
    bgColour: objectPalette.lime.lightest, 
    twColor: "bg-lime-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  greenMain: {
    bgColour: objectPalette.green.main,
    twColor: "bg-green",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  greenLight: {
    bgColour: objectPalette.green.light,
    twColor: "bg-green-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  greenLightest: {
    bgColour: objectPalette.green.lightest,
    twColor: "bg-green-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  cyanMain: {
    bgColour: objectPalette.cyan.main,
    twColor: "bg-cyan",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  cyanLight: {
    bgColour: objectPalette.cyan.light,
    twColor: "bg-cyan-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  cyanLightest: {
    bgColour: objectPalette.cyan.lightest,
    twColor: "bg-cyan-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  blueMain: {
    bgColour: objectPalette.blue.main,
    twColor: "bg-blue",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  blueLight: {
    bgColour: objectPalette.blue.light,
    twColor: "bg-blue-light",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  blueLightest: {
    bgColour: objectPalette.blue.lightest,
    twColor: "bg-blue-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  indigoMain: {
    bgColour: objectPalette.indigo.main,
    twColor: "bg-indigo",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  indigoLight: {
    bgColour: objectPalette.indigo.light,
    twColor: "bg-indigo-light",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  indigoLightest: {
    bgColour: objectPalette.indigo.lightest,
    twColor: "bg-indigo-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  violetMain: {
    bgColour: objectPalette.violet.main,
    twColor: "bg-violet",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  violetLight: {
    bgColour: objectPalette.violet.light,
    twColor: "bg-violet-light",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  violetLightest: {
    bgColour: objectPalette.violet.lightest,
    twColor: "bg-violet-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  purpleMain: {
    bgColour: objectPalette.purple.main,
    twColor: "bg-purple",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  purpleLight: {
    bgColour: objectPalette.purple.light,
    twColor: "bg-purple-light",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  purpleLightest: {
    bgColour: objectPalette.purple.lightest,
    twColor: "bg-purple-lightest",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  white: {
    bgColour: basePalette.white,
    twColor: "bg-white",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  grey1: {
    bgColour: basePalette.grey[200],
    twColor: "bg-grey-200",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  grey2: {
    bgColour: basePalette.grey[300],
    twColor: "bg-grey-300",
    textColour: basePalette.black,
    borderColour: basePalette.black,
  },
  grey3: {
    bgColour: basePalette.grey[400],
    twColor: "bg-grey-400",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  grey4: {
    bgColour: basePalette.grey[500],
    twColor: "bg-grey-500",
    textColour: basePalette.white,
    borderColour: basePalette.black,
  },
  black: {
    bgColour: basePalette.black,
    twColor: "bg-black",
    textColour: basePalette.white,
    borderColour: basePalette.grey[500],
  }
};
