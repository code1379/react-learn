import { REACT_TEXT } from "../constant";

export function isString(val) {
  return typeof val === "string";
}

export function isNumber(val) {
  return typeof val === "number";
}

export function isFunction(val) {
  return typeof val === "function";
}

export function isUndefined(val) {
  return val === undefined || val === null;
}

export function isDefined(val) {
  return val !== undefined && val !== null;
}
/**
 * 为了更加语义化，也为了方便后面进行 DOM-DIFF，我们把文本节点包装成 虚拟DOM
 * @param {*} element
 */
export function wrapToVdom(element) {
  if (isString(element) || isNumber(element)) {
    return {
      type: REACT_TEXT,
      props: element,
    };
  }
  return element;
}
/**
 * 把任意值包装成一个数组
 * 如果是多维数组的话，要打平成 一维 [[a, b], [c, d]]
 * @param {*} val
 * @returns
 */
export function wrapToArray(val) {
  return Array.isArray(val) ? val.flat(Infinity) : [val];
}
