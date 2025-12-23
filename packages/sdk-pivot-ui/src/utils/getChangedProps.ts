/**
 * Defines differences between two objects
 *
 * @param {object} odlObj - old object
 * @param {object} newObj - new object
 * @returns {object} - object with changed properties
 */
export const getChangedProps = (odlObj: any, newObj: any) => {
  const res: any = {};
  Object.keys(odlObj).forEach((key: string) => {
    if (odlObj[key] !== newObj[key]) {
      res[key] = newObj[key];
    }
  });
  Object.keys(newObj).forEach((key) => {
    if (typeof res[key] === 'undefined' && odlObj[key] !== newObj[key]) {
      res[key] = newObj[key];
    }
  });
  return res;
};

export default getChangedProps;
