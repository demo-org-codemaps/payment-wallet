import { CurrencyCodeEnum } from '../enums';

export const getCurrencyAndRetailerChecks = (currency: CurrencyCodeEnum | undefined, retailerId: string) => {
  // checking two variables, need 4 conditions
  if (retailerId && currency !== undefined) {
    return `WHERE retailer_id = ${retailerId} and currency = '${currency}'`;
  } else if (retailerId && currency === undefined) {
    return `WHERE retailer_id = ${retailerId}`;
  } else if (!retailerId && currency === undefined) {
    return '';
  } else if (!retailerId && currency !== undefined) {
    return `WHERE currency = '${currency}'`;
  }
};
