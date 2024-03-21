import Styles from "./myButton.module.scss";
import React, { forwardRef, type ButtonHTMLAttributes } from "react";

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(
  ({ children, className, ...args }, ref) => {
    return (
      <button ref={ref} className={Styles.but + " " + className} {...args}>
        {children}
      </button>
    );
  },
);
MyButton.displayName = "MyButton";
