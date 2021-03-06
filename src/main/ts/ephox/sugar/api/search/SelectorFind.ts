import PredicateFind from './PredicateFind';
import Selectors from './Selectors';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import Element from '../node/Element';
import { Option } from '@ephox/katamari';

// TODO: An internal SelectorFilter module that doesn't Element.fromDom() everything

var first = function (selector: string) {
  return Selectors.one(selector);
};

var ancestor = function (scope: Element, selector: string, isRoot?) {
  return PredicateFind.ancestor(scope, function (e) {
    return Selectors.is(e, selector);
  }, isRoot);
};

var sibling = function (scope: Element, selector: string) {
  return PredicateFind.sibling(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

var child = function (scope: Element, selector: string) {
  return PredicateFind.child(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

var descendant = function (scope: Element, selector: string) {
  return Selectors.one(selector, scope);
};

// Returns Some(closest ancestor element (sugared)) matching 'selector' up to isRoot, or None() otherwise
var closest = function (scope: Element, selector: string, isRoot?) {
  return ClosestOrAncestor(Selectors.is, ancestor, scope, selector, isRoot);
};

export default {
  first,
  ancestor,
  sibling,
  child,
  descendant,
  closest,
};