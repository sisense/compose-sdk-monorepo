import './app.css';
import '../styles';
import React, { useMemo } from 'react';
import { BearerAuthenticator } from '@ethings-os/sdk-rest-client';
import { PivotClient } from '../pivot-client';
import { PivotBuilderDemo } from './pivot-builder-demo';
import { defaultQuery as defaultQuery1, defaultQuery2 } from './examples';
import { JaqlRequest } from '../data-load/types';

export function App() {
  const { VITE_APP_SISENSE_URL, VITE_APP_SISENSE_TOKEN } = import.meta.env;
  if (!VITE_APP_SISENSE_URL || !VITE_APP_SISENSE_TOKEN) {
    throw new Error('Env variables not defined');
  }

  const [refresh, setRefresh] = React.useState(0);
  const [jaql, setJaql] = React.useState(JSON.parse(JSON.stringify(defaultQuery1)) as JaqlRequest);

  // let jaql1 = ;
  // let jaql2 = JSON.parse(JSON.stringify(defaultQuery2)) as JaqlRequest;

  // create pivot client
  const pivotClient = useMemo(() => {
    return new PivotClient(
      VITE_APP_SISENSE_URL,
      new BearerAuthenticator(VITE_APP_SISENSE_URL, VITE_APP_SISENSE_TOKEN),
    );
  }, [VITE_APP_SISENSE_TOKEN, VITE_APP_SISENSE_URL]);

  const handleOnClick = () => {
    setRefresh(refresh + 1);
    if (refresh % 2 === 0) {
      setJaql(JSON.parse(JSON.stringify(defaultQuery1)) as JaqlRequest);
    } else {
      setJaql(JSON.parse(JSON.stringify(defaultQuery2)) as JaqlRequest);
    }
  };

  return (
    <>
      <h3>Vite + Pivot</h3>
      <button
        style={{
          marginBottom: '10px',
          backgroundColor: 'white',
          borderWidth: '1px',
          borderColor: 'black',
        }}
        onClick={handleOnClick}
      >
        Change Table
      </button>
      <PivotBuilderDemo pivotClient={pivotClient} jaql={jaql} />
      {/*<PivotBuilderDemo pivotClient={pivotClient} jaql={jaql2} />*/}
    </>
  );
}
