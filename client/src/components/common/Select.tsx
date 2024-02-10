import type { ChangeEventHandler, HTMLAttributes, PropsWithChildren } from 'react';
import { forwardRef } from 'react';

type SelectProps = {
  className?: string;
  defaultValue?: HTMLAttributes<HTMLSelectElement>['defaultValue'];
  onSelect?: ChangeEventHandler<HTMLSelectElement>;
}

export const Select = forwardRef<HTMLSelectElement, PropsWithChildren<SelectProps>>(({ className, defaultValue, onSelect, children }, ref) => {
  return (
    <select className={className} onChange={onSelect} defaultValue={defaultValue} ref={ref}>
      {children}
    </select>
  );
})
