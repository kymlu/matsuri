import React from 'react';
import './../App.css';
import './../index.css';
import className from "classnames";

type ButtonProps = {
  children: React.ReactNode
  primary?: boolean,
  disabled?: boolean,
  full?: boolean,
  compact ?: boolean,
  label?: string,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button(props: ButtonProps) {
  const classes = className("px-3 py-1.5 border rounded-xl", {
    "w-full": props.full,
    "py-0.5 px-1": props.compact,
    "lg:hover:bg-grey-100": !props.disabled,
    "bg-primary text-white font-bold": props.primary,
    "lg:hover:bg-primary-light": props.primary && !props.disabled,
    "opacity-50 cursor-not-allowed": props.disabled
  });

  return <button 
    button-name={props.label}
    disabled={props.disabled ?? false}
    className={classes}
    onClick={props.onClick}>
      {props.children}
    </button>;
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