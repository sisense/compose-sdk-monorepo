import React from 'react';

import { DEPRECATED_Button } from './DEPRECATED_Button';

export default {
  title: 'DEPRECATED/Button',
};

export const Primary = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} />
      <DEPRECATED_Button text={'hover!'} style={{ backgroundColor: '#f2b900' }} />
      <DEPRECATED_Button text={'disable!'} disabled />
    </>
  </div>
);

export const PrimaryWithIcon = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} iconName="general-plus" />
      <DEPRECATED_Button
        text={'hover!'}
        iconName="general-plus"
        style={{ backgroundColor: '#f2b900' }}
      />
      <DEPRECATED_Button text={'disable!'} iconName="general-plus" disabled />
    </>
  </div>
);

export const Secondary = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} secondary />
      <DEPRECATED_Button text={'hover!'} secondary style={{ backgroundColor: '#F4F4F8' }} />
      <DEPRECATED_Button text={'disable!'} secondary disabled />
    </>
  </div>
);

export const SecondaryWithIcon = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} iconName="general-plus" secondary />
      <DEPRECATED_Button
        text={'hover!'}
        iconName="general-plus"
        secondary
        style={{ backgroundColor: '#F4F4F8' }}
      />
      <DEPRECATED_Button text={'disable!'} iconName="general-plus" secondary disabled />
    </>
  </div>
);

export const Cancel = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} gray />
      <DEPRECATED_Button text={'hover!'} style={{ backgroundColor: '#D1D1D7' }} />
      <DEPRECATED_Button text={'disable!'} gray disabled />
    </>
  </div>
);

export const CancelWithIcon = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} iconName="general-plus" gray />
      <DEPRECATED_Button
        text={'hover!'}
        iconName="general-plus"
        style={{ backgroundColor: '#D1D1D7' }}
      />
      <DEPRECATED_Button text={'disable!'} iconName="general-plus" gray disabled />
    </>
  </div>
);

export const Text = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} dark />
      <DEPRECATED_Button text={'hover!'} style={{ backgroundColor: '#f4f4f8' }} dark />
      <DEPRECATED_Button text={'disable!'} disabled dark />
    </>
  </div>
);

export const TextWithIcon = () => (
  <div
    style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      height: '175px',
      padding: '20px 50px',
      flexDirection: 'column',
    }}
  >
    <>
      <DEPRECATED_Button text={'normal!'} dark iconName={'general-edit'} />
      <DEPRECATED_Button
        text={'hover!'}
        style={{ backgroundColor: '#f4f4f8' }}
        iconName={'general-edit'}
        dark
      />
      <DEPRECATED_Button text={'disable!'} iconName={'general-edit'} disabled dark />
    </>
  </div>
);
