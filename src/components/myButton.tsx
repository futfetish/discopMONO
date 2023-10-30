import Styles  from  '../../src/styles/myButton.module.scss'
import React from 'react';

export default React.forwardRef(({ children, ...args } : any, ref) => {
    return (
      <button ref={ref} className={Styles.but} {...args}>
        {children}
      </button>
    );
  });