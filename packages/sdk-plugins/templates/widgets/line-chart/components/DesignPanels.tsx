import React from 'react';

import styled from '@emotion/styled';
import type { DesignPanelProps } from '@sisense/sdk-ui';

import { StyleOptions } from '../types.js';
import { LineDesignPanel } from './sections/LineDesignPanel.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 6px;
  background-color: #f9f9fb;
`;

const Panel = styled.div``;

export const DesignPanels = React.memo((props: DesignPanelProps<StyleOptions>) => {
  return (
    <Container>
      <Panel>
        <LineDesignPanel
          styleOptions={props.styleOptions}
          onChange={(name, value) => {
            props.onChange({ ...props.styleOptions, [name]: value } as StyleOptions);
          }}
        />
      </Panel>
    </Container>
  );
});
DesignPanels.displayName = 'DesignPanels';
