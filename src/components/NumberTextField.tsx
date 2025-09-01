import { NumberField } from "@base-ui-components/react";
import React from "react";

export interface NumberTextFieldProps {
  label?: string,
  default: number,
  value: number,
  min?: number,
  max?: number,
  onChange?: (newValue: number | null) => void,
}

export default function NumberTextField (props: NumberTextFieldProps) {
  const id = React.useId();
  return (
    <NumberField.Root
      id={id}
      value={props.value}
      onValueChange={(newValue) => {props.onChange?.(newValue);}}
      defaultValue={props.default}
      className="flex flex-col items-start gap-1"
      min={props?.min ?? 0}
      max={props?.max ?? 1000}>
      <div className="flex flex-row items-center gap-1">
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

        <NumberField.Group className="flex border-2 border-gray-200 rounded-md focus-within:border-primary">
          <NumberField.Decrement className="flex items-center justify-center w-4 h-8 text-gray-900 select-none bg-clip-padding hover:bg-gray-100 active:bg-gray-100">
            <MinusIcon />
          </NumberField.Decrement>
          <NumberField.Input className="w-10 h-8 text-base text-center text-gray-900 tabular-nums focus:z-1 focus:outline-none focus:outline-2 focus:-outline-offset-1" />
          <NumberField.Increment className="flex items-center justify-center w-4 h-8 text-gray-900 select-none bg-clip-padding hover:bg-gray-100 active:bg-gray-100">
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
