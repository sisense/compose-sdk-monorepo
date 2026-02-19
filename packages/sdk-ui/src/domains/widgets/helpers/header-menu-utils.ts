import { WidgetProps } from '../components/widget/types';
import { MenuItem } from '../shared/widget-header/types';

/**
 * Adds a menu item to the widget header.
 * @param menuItem - The menu item to add.
 * @returns A function that adds a menu item to the widget header.
 * @internal
 */
export function withHeaderMenuItem(menuItem: MenuItem): (widget: WidgetProps) => WidgetProps {
  return (props) => {
    return {
      ...props,
      config: {
        ...props.config,
        header: {
          ...props.config?.header,
          toolbar: {
            ...props.config?.header?.toolbar,
            menu: {
              ...(props.config?.header?.toolbar?.menu ?? {}),
              items: [...(props.config?.header?.toolbar?.menu?.items ?? []), menuItem],
            },
          },
        },
      },
    };
  };
}
