import { Arr } from '@ephox/katamari';
import Attr from './Attr';
import Element from '../node/Element';

// Methods for handling attributes that contain a list of values <div foo="alpha beta theta">
var read = function (element: Element, attr) {
  var value: string = Attr.get(element, attr);
  return value === undefined || value === '' ? [] : value.split(' ');
};

var add = function (element: Element, attr, id) {
  var old = read(element, attr);
  var nu = old.concat([id]);
  Attr.set(element, attr, nu.join(' '));
  return true;
};

var remove = function (element: Element, attr, id) {
  var nu = Arr.filter(read(element, attr), function (v) {
    return v !== id;
  });
  if (nu.length > 0) Attr.set(element, attr, nu.join(' '));
  else Attr.remove(element, attr);
  return false;
};

export default {
  read,
  add,
  remove,
};