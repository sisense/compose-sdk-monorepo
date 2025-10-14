import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '@sisense/sdk-data';

import { StyledNextButton, StyledPrevButton } from './styled-buttons';

interface DrilldownBreadcrumbsNavigationProps {
  currentDimension: Attribute;
  children: JSX.Element;
}

export const DrilldownBreadcrumbsNavigation: React.FC<DrilldownBreadcrumbsNavigationProps> = ({
  currentDimension,
  children,
}) => {
  const { t } = useTranslation();
  const breadcrumbsRef = useRef<HTMLDivElement>(null);
  const [breadcrumbsWidth, setBreadcrumbsWidth] = useState(0);
  const [breadcrumbsScrollWidth, setBreadcrumbsScrollWidth] = useState(0);
  const [breadcrumbsScrollPosition, setBreadcrumbsScrollPosition] = useState(0);

  const getBreadcrumbsListElement = () => breadcrumbsRef.current?.querySelector('ol');

  useEffect(() => {
    const breadcrumbsListElement = getBreadcrumbsListElement();
    if (breadcrumbsListElement) {
      const drilldownBreadcrumbsClientWidth = breadcrumbsListElement.clientWidth;
      const drilldownBreadcrumbsScrollWidth = breadcrumbsListElement.scrollWidth;
      const drilldownBreadcrumbsScrollPosition = breadcrumbsListElement.scrollLeft;

      setBreadcrumbsWidth(drilldownBreadcrumbsClientWidth);
      setBreadcrumbsScrollWidth(drilldownBreadcrumbsScrollWidth);
      setBreadcrumbsScrollPosition(drilldownBreadcrumbsScrollPosition);
    }
  }, [currentDimension]);

  useEffect(() => {
    const breadcrumbsListElement = getBreadcrumbsListElement();
    function handleBreadcrumbsWidth() {
      if (breadcrumbsListElement) {
        const drilldownBreadcrumbsClientWidth = breadcrumbsListElement.clientWidth;
        setBreadcrumbsWidth(drilldownBreadcrumbsClientWidth);
      }
    }

    function handleBreadcrumbsScroll() {
      if (breadcrumbsListElement) {
        const drilldownBreadcrumbsScrollPosition = breadcrumbsListElement.scrollLeft;
        setBreadcrumbsScrollPosition(drilldownBreadcrumbsScrollPosition);
      }
    }

    const observer = new ResizeObserver(handleBreadcrumbsWidth);

    if (breadcrumbsListElement) {
      observer.observe(breadcrumbsListElement);
      breadcrumbsListElement.addEventListener('scroll', handleBreadcrumbsScroll);

      return () => {
        observer.disconnect();
        breadcrumbsListElement.removeEventListener('scroll', handleBreadcrumbsScroll);
      };
    }

    return () => {};
  }, []);

  const scroll = (scrollDirection: 'right' | 'left') => {
    const distance = 200;
    const behavior = 'smooth';
    const breadcrumbsListElement = getBreadcrumbsListElement();
    if (breadcrumbsListElement) {
      breadcrumbsListElement.scrollBy({
        left: scrollDirection === 'right' ? distance : -distance,
        behavior,
      });
    }
  };

  const showPrevButton = breadcrumbsScrollPosition != 0;
  const showNextButton =
    Math.floor(breadcrumbsScrollWidth - breadcrumbsScrollPosition) > breadcrumbsWidth;

  return (
    <div style={{ position: 'relative' }}>
      {showPrevButton && (
        <StyledPrevButton onClick={() => scroll('left')}>
          <span aria-label="prev-item">{t('drilldown.breadcrumbsPrev')}</span>
        </StyledPrevButton>
      )}
      {showNextButton && (
        <StyledNextButton onClick={() => scroll('right')}>
          <span aria-label="next-item">{t('drilldown.breadcrumbsNext')}</span>
        </StyledNextButton>
      )}
      <div ref={breadcrumbsRef}>{children}</div>
    </div>
  );
};
