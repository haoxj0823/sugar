import { Type } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import Node from '../node/Node';
import { console, HTMLElement } from '@ephox/dom-globals';
import Element from '../node/Element';

var rawSet = function (dom: HTMLElement, key: string, value: string | boolean | number) {
  /*
   * JQuery coerced everything to a string, and silently did nothing on text node/null/undefined.
   *
   * We fail on those invalid cases, only allowing numbers and booleans.
   */
  if (Type.isString(value) || Type.isBoolean(value) || Type.isNumber(value)) {
    dom.setAttribute(key, value + '');
  } else {
    console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
    throw new Error('Attribute value was not simple');
  }
};

var set = function (element: Element, key: string, value: string | boolean | number) {
  rawSet(element.dom(), key, value);
};

var setAll = function (element: Element, attrs) {
  var dom: HTMLElement = element.dom();
  Obj.each(attrs, function (v, k) {
    rawSet(dom, k, v);
  });
};

var get = function (element: Element, key: string) {
  var v = (element.dom() as HTMLElement).getAttribute(key);

  // undefined is the more appropriate value for JS, and this matches JQuery
  return v === null ? undefined : v;
};

var has = function (element: Element, key: string) {
  var dom: HTMLElement = element.dom();

  // return false for non-element nodes, no point in throwing an error
  return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
};

var remove = function (element: Element, key: string) {
  (element.dom() as HTMLElement).removeAttribute(key);
};

var hasNone = function (element: Element) {
  var attrs = (element.dom() as HTMLElement).attributes;
  return attrs === undefined || attrs === null || attrs.length === 0;
};

var clone = function (element: Element) {
  // TypeScript really doesn't like NamedNodeMap as array
  return Arr.foldl(element.dom().attributes, function (acc, attr) {
    acc[attr.name] = attr.value;
    return acc;
  }, {});
};

var transferOne = function (source: Element, destination: Element, attr: string) {
  // NOTE: We don't want to clobber any existing attributes
  if (has(source, attr) && !has(destination, attr)) set(destination, attr, get(source, attr));
};

// Transfer attributes(attrs) from source to destination, unless they are already present
var transfer = function (source: Element, destination: Element, attrs: string[]) {
  if (!Node.isElement(source) || !Node.isElement(destination)) return;
  Arr.each(attrs, function (attr) {
    transferOne(source, destination, attr);
  });
};

export default {
  clone,
  set,
  setAll,
  get,
  has,
  remove,
  hasNone,
  transfer,
};