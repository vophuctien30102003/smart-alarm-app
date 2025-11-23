'use client';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import { createSwitch } from '@gluestack-ui/switch';
import React from 'react';
import { Switch as RNSwitch, type ColorValue } from 'react-native';

const UISwitch = createSwitch({
  Root: withStyleContext(RNSwitch),
});

const switchStyle = tva({
  base: 'data-[focus=true]:outline-0 data-[focus=true]:ring-2 data-[focus=true]:ring-indicator-primary web:cursor-pointer disabled:cursor-not-allowed data-[disabled=true]:opacity-40 data-[invalid=true]:border-error-700 data-[invalid=true]:rounded-xl data-[invalid=true]:border-2',

  variants: {
    size: {
      sm: 'scale-75',
      md: '',
      lg: 'scale-125',
    },
  },
});

type ISwitchProps = React.ComponentProps<typeof UISwitch> &
  VariantProps<typeof switchStyle>;
const Switch = React.forwardRef<
  React.ComponentRef<typeof UISwitch>,
  ISwitchProps
>(function Switch(
  { className, size = 'md', trackColor, thumbColor, ...props }: ISwitchProps,
  ref,
) {
  const mergedTrackColor: {
    false?: ColorValue;
    true?: ColorValue;
  } =
    trackColor === undefined
      ? { true: '#9887C3' }
      : {
          ...trackColor,
          true: trackColor.true ?? '#9887C3',
        };

  return (
    <UISwitch
      ref={ref}
      {...props}
      trackColor={mergedTrackColor}
      thumbColor={thumbColor ?? '#FFFFFF'}
      className={switchStyle({ size, class: className })}
    />
  );
});

Switch.displayName = 'Switch';
export { Switch };
