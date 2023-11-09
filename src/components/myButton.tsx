import Styles  from  '../../src/styles/myButton.module.scss'
import React, { forwardRef, ButtonHTMLAttributes  } from 'react';

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className: string;
}

const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(
  ({ children, className, ...args }, ref) => {
    return (
      <button ref={ref} className={Styles.but + ' ' + className} {...args}>
        {children}
      </button>
    );
  }
);
MyButton.displayName = 'MyButton'

export default MyButton