import React from 'react';
import './../App.css';
import './../index.css';
import className from "classnames";

type ButtonProps = {
  children: React.ReactNode
  primary?: boolean,
  secondary?: boolean,
  success?: boolean,
  warning?: boolean,
  danger?: boolean,
  outline?: boolean,
  disabled?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button(props: ButtonProps) {
  //1st arg:: for all variations.
  const classes = className("px-3 py-1.5 border rounded-xl", {
    "border-blue-500 bg-blue-500 text-white": props.primary,
    "border-gray-900 bg-gray-900 text-white": props.secondary,
    "border-green-500 bg-green-500 text-white": props.success,
    "border-yellow-400 bg-yellow-400 text-white": props.warning,
    "border-red-500 bg-red-500 text-white": props.danger,
    "bg-white": props.outline,
    "text-blue-500": props.outline && props.primary,
    "text-gray-900": props.outline && props.secondary,
    "text-green-500": props.outline && props.success,
    "text-yellow-500": props.outline && props.warning,
    "text-red-500": props.outline && props.danger,
  });

  return <button disabled={props.disabled ?? false} className={classes} onClick={props.onClick}>{props.children}</button>;
}

Button.propTypes = {
  checkVariationValue: ({ primary, secondary, success, danger, warning }) => {
    const count =
      Number(!!primary) +
      Number(!!secondary) +
      Number(!!success) +
      Number(!!danger) +
      Number(!!warning);
    if (count > 1) {
      return new Error("Only one of p, s, w , s ,d can be true");
    }
  },
};