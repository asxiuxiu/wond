import throttle from 'lodash.throttle';
import isEqualWith from 'lodash.isequalwith';
import { floatEqual } from './utils';

/**
 * 自定义的深度相等比较函数
 * 对于数字类型，使用浮点数容差比较
 * 对于其他类型，使用 lodash 的默认深度比较
 */
export const isEqual = (value: any, other: any): boolean => {
  return isEqualWith(value, other, (val: any, oth: any) => {
    // 如果两个值都是数字，使用浮点数容差比较
    if (typeof val === 'number' && typeof oth === 'number') {
      return floatEqual(val, oth);
    }
    // 返回 undefined 让 lodash 使用默认比较逻辑
    return undefined;
  });
};

export { throttle };
