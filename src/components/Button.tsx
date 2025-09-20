import React from 'react';
import './../App.css';
import './../index.css';
import className from "classnames";

type ButtonProps = {
  children: React.ReactNode
  primary?: boolean,
  disabled?: boolean,
  full?: boolean,
  label?: string,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button(props: ButtonProps) {
  const classes = className("px-3 py-1.5 border rounded-xl lg:hover:bg-grey-100", {
    "w-full": props.full,
    "bg-primary text-white lg:hover:bg-primary-light font-bold": props.primary,
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