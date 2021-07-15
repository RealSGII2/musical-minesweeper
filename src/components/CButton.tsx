import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import '../styles/app.scss';

import { Ripple } from '@rmwc/ripple';
import '@rmwc/ripple/styles';

function Button({ children, disabled, ...rest }: { children: ReactNode, disabled?: boolean } & DetailedHTMLProps<
	HTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>) {
  return (
    <Ripple disabled={disabled}>
        <button className="customButton" disabled={disabled} {...rest}>
            {children}
        </button>
    </Ripple>
  );
}

export default Button;
