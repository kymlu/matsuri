import { NumberField } from "@base-ui-components/react";
import React from "react";

export interface NumberTextFieldProps {
  label?: string,
  default: number,
  min?: number,
  max?: number,
  step?: number,
  onChange?: (newValue: number | null) => void,
}

export default function NumberTextField (props: NumberTextFieldProps) {
  const [value, setValue] = React.useState<number | null>(props.default ?? 0);
  const id = React.useId();
  return (
    <NumberField.Root
      id={id}
      value={value}
      onValueChange={(newValue) => {
        const rounded = newValue ? Math.round(newValue/(props.step ?? 1)) * (props.step ?? 1) : props.min ?? 0
        setValue(rounded);
        props.onChange?.(rounded);
      }}
      defaultValue={props.default}
      className="flex flex-col items-start gap-1"
      min={props?.min ?? 0}
      max={props?.max ?? 1000}
      step={props?.step ?? 1}
      >
      <div className="flex flex-row items-center justify-between w-full my-2">
        <NumberField.ScrubArea className="cursor-ew-resize">
          { props.label && <label
            htmlFor={id}
            className="text-sm font-medium text-gray-900 cursor-ew-resize">
            {props.label}
          </label> }
          <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
            <CursorGrowIcon />
          </NumberField.ScrubAreaCursor>
        </NumberField.ScrubArea>

        <NumberField.Group className="grid grid-cols-[1fr,2fr,1fr] w-full bg-white border rounded-md border-grey-300 focus-within:border-primary">
          <NumberField.Decrement className={"flex items-center justify-center h-10 select-none rounded-l-md min-w-4 bg-clip-padding" + ((value ?? 1) > (props.min ?? 0) ? " lg:hover:bg-gray-100 active:bg-gray-100 text-gray-900": " text-gray-400")}>
            <MinusIcon />
          </NumberField.Decrement>
          <NumberField.Input className="h-10 text-base text-center text-gray-900 min-w-10 tabular-nums focus:z-1 focus:outline-none focus:outline-2 focus:-outline-offset-1" />
          <NumberField.Increment className={"flex items-center justify-center select-none rounded-r-md min-w-4 tex0-gray-900 h-19 bg-clip-padding" + ((value ?? 0) < (props.max ?? 100000000) ? " lg:hover:bg-gray-100 active:bg-gray-100 text-gray-900": " text-gray-400")}>
            <PlusIcon />
          </NumberField.Increment>
        </NumberField.Group>
      </div>
    </NumberField.Root>
  )
}

function CursorGrowIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H5M10 5H5M5 5V0M5 5V10" />
    </svg>
  );
}

function MinusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H10" />
    </svg>
  );
}
