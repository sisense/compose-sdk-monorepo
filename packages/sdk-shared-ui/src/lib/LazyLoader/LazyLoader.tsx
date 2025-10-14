import React, { JSX } from 'react';

import classNames from 'classnames';

import style from './LazyLoader.module.scss';

export type LazyLoaderProps = {
  className?: string;
  caption?: string;
  isLoading?: boolean;
};

const LazyLoader = (props: LazyLoaderProps): JSX.Element => {
  const { className = '', caption = '', isLoading = false } = props;

  const hostClasses = classNames(
    style['loader-two-dots'],
    {
      [style['loader-two-dots--inactive']]: !isLoading,
    },
    className,
  );

  const loaderIndicatorClass = classNames(style.loader, style['loader-two-dots-indicator']);
  const captionClass = classNames(style.caption);

  return (
    <div className={hostClasses}>
      {isLoading && (
        <div data-testid="loader-component" className={loaderIndicatorClass}>
          {caption && (
            <div className={captionClass}>
              <span>{caption}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyLoader;
export { LazyLoader };
