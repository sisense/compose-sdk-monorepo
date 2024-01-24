/* eslint-disable import/prefer-default-export, no-proto */

/**
 * Using for canceling query promises
 */
export class LoadingCanceledError extends Error {
  constructor(message: string | undefined = 'Loading canceled') {
    super(message);
    this.name = 'LoadingCanceledError';

    // restore prototype chain
    const actualProto = new.target.prototype;

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      // TODO review this
      // this.__proto__ = actualProto;
    }
  }
}

export default LoadingCanceledError;
