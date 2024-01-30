import * as _ from 'lodash';

export class AppUtil {
  public static isNumber(field): boolean {
    if (field === null || field === undefined || field.toString() === 'NaN') {
      return false;
    }

    return _.isNumber(field);
  }

  public static formatDate(date): string {
    return new Date(date).toLocaleDateString('en-US');
  }

  public static enumKeys(e: Record<string, unknown>): string[] {
    return Object.keys(e).filter(x => !(parseInt(x) >= 0));
  }
}
