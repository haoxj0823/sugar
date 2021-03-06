import Alignment from 'ephox/sugar/api/properties/Alignment';
import Attr from 'ephox/sugar/api/properties/Attr';
import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Traverse from 'ephox/sugar/api/search/Traverse';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('AlignmentTest', function() {
  var body = Body.body();
  var createDirectionalP = function (direction) {
    var divEl = EphoxElement('div');
    var par = EphoxElement('p');
    Attr.setAll(divEl, {dir: direction});
    Insert.append(body, divEl);
    Insert.append(divEl, par);
    return par;
  };

  var check = function (element, property, value, expected) {
    var res = Alignment.hasAlignment(element, property, value);
    assert.eq(expected, res);
    Traverse.parent(element).each(Remove.remove);
  };

  var rtlP = createDirectionalP('rtl');
  check(rtlP, 'text-align', 'left', false);
  var rtlIsRight = createDirectionalP('rtl');
  check(rtlIsRight, 'text-align', 'right', true);

  /* should never be checking alignment on a text node */
  check(Element.fromText('Bacon eatsum'), 'text-align', 'left', false);
});

