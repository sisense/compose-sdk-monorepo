import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { DimensionsBrowser } from '@/domains/data-browser/dimensions-browser/dimensions-browser';

import {
  AttributeActionConfig,
  AttributeSecondaryActionConfig,
  DimensionSecondaryActionConfig,
} from './types';

// Test secondary action button for an attribute.
// It simply renders a button with a label and a test id using the attribute id.
const TestAttributeSecondaryActionButton: AttributeSecondaryActionConfig['SecondaryActionButtonIcon'] =
  ({ attribute }) => <button data-testid={`attr-secondary-${attribute.id}`}>Attribute info</button>;

// Test secondary action button for a dimension.
const TestDimensionSecondaryActionButton: DimensionSecondaryActionConfig['SecondaryActionButtonIcon'] =
  ({ dimension }) => <button data-testid={`dim-secondary-${dimension.id}`}>Dimension info</button>;

describe('DimensionsBrowser Component', () => {
  let attributeActionConfig: AttributeActionConfig;
  let attributeSecondaryActionConfig: AttributeSecondaryActionConfig;
  let dimensionSecondaryActionConfig: DimensionSecondaryActionConfig;

  beforeEach(() => {
    attributeActionConfig = { onClick: vi.fn() };
    attributeSecondaryActionConfig = {
      SecondaryActionButtonIcon: TestAttributeSecondaryActionButton,
      onClick: vi.fn(),
    };
    dimensionSecondaryActionConfig = {
      SecondaryActionButtonIcon: TestDimensionSecondaryActionButton,
      onClick: vi.fn(),
    };
  });

  // Helper function to render the component with real dimensions.
  const renderComponent = () =>
    render(
      <DimensionsBrowser
        dimensions={[DM.Commerce, DM.Brand, DM.Category, DM.Country]}
        attributeActionConfig={attributeActionConfig}
        attributeSecondaryActionConfig={attributeSecondaryActionConfig}
        dimensionSecondaryActionConfig={dimensionSecondaryActionConfig}
      />,
    );

  it('renders dimension groups with correct titles', () => {
    renderComponent();
    expect(screen.getByText('Commerce')).toBeInTheDocument();
    expect(screen.getAllByText('Brand')).length(2); // Brand and BrandID
    expect(screen.getAllByText('Category')).length(2); // Category and CategoryID
    expect(screen.getAllByText('Country')).length(2); // Country and CountryID
  });

  it('calls attributeActionConfig callback when an attribute is clicked', () => {
    renderComponent();
    // "Age Range" is an attribute in the Commerce dimension.
    const attributeElement = screen.getByText('Age Range');
    fireEvent.click(attributeElement);
    expect(attributeActionConfig.onClick).toHaveBeenCalledTimes(1);
    const calledArg = (attributeActionConfig.onClick as Mock).mock.calls[0][0];
    expect(calledArg.name).toBe('Age Range');
  });

  it('calls attributeSecondaryActionConfig callback when attribute secondary button is clicked', () => {
    renderComponent();
    // Find an attribute row for "Age Range".
    const attributeElement = screen.getByText('Age Range');
    // Trigger hover so the secondary action button is rendered.
    fireEvent.mouseEnter(attributeElement);
    // The test secondary button renders the text "Attribute info".
    const secButton = screen.getByText('Attribute info');
    fireEvent.click(secButton);
    expect(attributeSecondaryActionConfig.onClick).toHaveBeenCalledTimes(1);
    const calledArg = (attributeSecondaryActionConfig.onClick as Mock).mock.calls[0][0];
    expect(calledArg.name).toBe('Age Range');
  });

  it('calls dimensionSecondaryActionConfig callback when dimension secondary button is clicked', () => {
    renderComponent();
    // Find the group header for the "Commerce" dimension.
    const dimensionHeader = screen.getByText('Commerce');
    fireEvent.mouseEnter(dimensionHeader);
    // The test secondary button for dimensions renders the text "Dimension info".
    const secButton = screen.getByText('Dimension info');
    fireEvent.click(secButton);
    expect(dimensionSecondaryActionConfig.onClick).toHaveBeenCalledTimes(1);
    const calledArg = (dimensionSecondaryActionConfig.onClick as Mock).mock.calls[0][0];
    expect(calledArg.name).toBe('Commerce');
  });
});
