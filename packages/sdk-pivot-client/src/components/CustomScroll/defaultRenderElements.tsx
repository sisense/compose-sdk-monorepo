import React, { CSSProperties } from 'react';

export function renderTrackHorizontalDefault(options: { style: CSSProperties }) {
  const { style, ...props } = options || {};
  const finalStyle = {
    ...style,
    right: 2,
    bottom: 2,
    left: 2,
    borderRadius: 3,
  };
  return <div style={finalStyle} {...props} />;
}

export function renderTrackVerticalDefault(options: { style: CSSProperties }) {
  const { style, ...props } = options || {};
  const finalStyle = {
    ...style,
    right: 2,
    bottom: 2,
    top: 2,
    borderRadius: 3,
  };
  return <div style={finalStyle} {...props} />;
}

export function renderThumbHorizontalDefault(options: { style: CSSProperties }) {
  const { style, ...props } = options || {};
  const finalStyle = {
    ...style,
    cursor: 'pointer',
    borderRadius: 'inherit',
    backgroundColor: 'rgba(0,0,0,.2)',
  };
  return <div style={finalStyle} {...props} />;
}

export function renderThumbVerticalDefault(options: { style: CSSProperties }) {
  const { style, ...props } = options || {};
  const finalStyle = {
    ...style,
    cursor: 'pointer',
    borderRadius: 'inherit',
    backgroundColor: 'rgba(0,0,0,.2)',
  };
  return <div style={finalStyle} {...props} />;
}
