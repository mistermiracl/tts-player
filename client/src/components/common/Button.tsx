import type { MouseEventHandler, PropsWithChildren } from 'react';

type ButtonProps = {
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function Button({ className, disabled, onClick, children }: PropsWithChildren<ButtonProps>) {
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}