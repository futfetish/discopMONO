import Styles  from  '../../src/styles/myButton.module.scss'
import React from 'react';

export default React.forwardRef(({ children,  className, ...args } : any, ref) => {
    return (
      <button ref={ref} className={Styles.but +' ' + className} {...args}>
        {children}
      </button>
    );
  });