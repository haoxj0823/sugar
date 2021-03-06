import { PlatformDetection } from '@ephox/sand';
import Compare from 'ephox/sugar/api/dom/Compare';
import Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Attr from 'ephox/sugar/api/properties/Attr';
import Class from 'ephox/sugar/api/properties/Class';
import Html from 'ephox/sugar/api/properties/Html';
import Selection from 'ephox/sugar/api/selection/Selection';
import Situ from 'ephox/sugar/api/selection/Situ';
import WindowSelection from 'ephox/sugar/api/selection/WindowSelection';
import { UnitTest, assert } from '@ephox/bedrock';
import { window } from '@ephox/dom-globals';

UnitTest.test('WindowSelectionTest', function() {
  var container = Element.fromTag('div');
  Class.add(container, 'window-selection-test');
  Attr.set(container, 'contenteditable', 'true');

  var body = Body.body();
  Insert.append(body, container);

  Html.set(container, '<p>This <strong>world</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted</p><p><br>And even more</p>');

  var find = function (path) {
    return Hierarchy.follow(container, path).getOrDie('invalid path');
  };

  var detection = PlatformDetection.detect();

  var detector = function (variants) {
    if (detection.browser.isFirefox() && variants.firefox !== undefined) return variants.firefox;
    else if (detection.browser.isSafari() && variants.safari !== undefined) return variants.safari;
    else if (detection.browser.isIE() && variants.ie !== undefined) return variants.ie;
    else if (detection.browser.isChrome() && variants.chrome !== undefined) return variants.chrome;
    else if (detection.browser.isEdge() && variants.spartan !== undefined) return variants.spartan;
    else return variants.fallback !== undefined ? variants.fallback : variants;
  };

  var checkSelection = function (label, variants, start, finish) {
    var expected = detector(variants);
    WindowSelection.setRelative(window, start, finish);
    var actual = WindowSelection.getExact(window).getOrDie('No selection after selection');
    var expStart = find(expected.start);
    var expFinish = find(expected.finish);

    assert.eq(true, Compare.eq(expStart, actual.start()), 'Start element different');
    assert.eq(true, Compare.eq(expFinish, actual.finish()), 'Finish element different');
    assert.eq(expected.soffset, actual.soffset());
    assert.eq(expected.foffset, actual.foffset());
  };

  var checkUniCodeSelection = function (content) {
    Remove.empty(container);
    Html.set(container, content);
    return checkSelection;
  };

  var checkStringAt = function (label, expectedStr, start, finish) {
    // dont need to set a selection range, just extract the Situ.on() element/offset pair
    var actual = WindowSelection.getAsString(window, Selection.relative(start, finish));
    assert.eq(expectedStr, actual, 'Actual was not expected [' + expectedStr + '|' + actual + ']');
  };

  checkSelection(
    'LTR selection (o)',
    {
      // '<p>This <strong>w[o]rld</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted</p><p><br>And even more</p>';
      fallback: {
        start: [ 0, 1, 0 ],
        soffset: 'w'.length,
        finish: [ 0, 1, 0 ],
        foffset: 'wo'.length
      }
    },
    Situ.on(find( [ 0, 1, 0 ]), 'w'.length),
    Situ.on(find( [ 0, 1, 0 ]), 'wo'.length)
  );

  checkSelection(
    'RTL selection: (o)',
    {
    // '<p>This <strong>w]o[rld</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted</p><p><br>And even more</p>';
      fallback: {
        start: [ 0, 1, 0 ],
        soffset: 'wo'.length,
        finish: [ 0, 1, 0 ],
        foffset: 'w'.length
      },
      // '<p>This <strong>w[o]rld</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted</p><p><br>And even more</p>';
      ie: {
        start: [ 0, 1, 0 ],
        soffset: 'w'.length,
        finish: [ 0, 1, 0 ],
        foffset: 'wo'.length
      },
      spartan: {
        start: [ 0, 1, 0 ],
        soffset: 'wo'.length,
        finish: [ 0, 1, 0 ],
        foffset: 'w'.length
      }
    },
    Situ.on(find( [ 0, 1, 0 ]), 'wo'.length),
    Situ.on(find( [ 0, 1, 0 ]), 'w'.length)
  );

  checkSelection(
    'RTL selection (orld)',
    {
      // '<p>This <strong>w]orld</strong>[ is not <strong>w<em>ha</em>t</strong> I<br><br>wanted</p><p><br>And even more</p>';
      firefox: {
        start: [ 0 ],
        soffset: 2,
        finish: [ 0, 1, 0 ],
        foffset: 'w'.length
      },
      chrome: {
        start: [ 0 ],
        soffset: 2,
        finish: [ 0, 1, 0 ],
        foffset: 'w'.length
      },
      ie: {
        finish: [ 0 ],
        foffset: 2,
        start: [ 0, 1, 0 ],
        soffset: 'w'.length
      },
      spartan: {
        start: [ 0 ],
        soffset: 2,
        finish: [ 0, 1, 0 ],
        foffset: 'w'.length
      },
      fallback: {
        start: [ 0, 1, 0 ],
        soffset: 'world'.length,
        finish: [ 0, 1, 0 ],
        foffset: 'w'.length
      }
    },
    Situ.before(find( [ 0, 2 ])),
    Situ.on(find( [ 0, 1, 0 ]), 'w'.length)
  );

  checkSelection(
    'LTR selection (This world is not what I wanted)',
    {
      // '<p>[This <strong>world</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted]</p><p><br>And even more</p>';
      fallback: {
        start: [ 0 ],
        soffset: 0,
        finish: [ 0 ],
        foffset: 7
      },
      safari: {
        start: [ 0, 0 ],
        soffset: ''.length,
        finish: [ 0 ],
        foffset: 7
      }
    },
    Situ.on(find( [ 0 ]), 0),
    Situ.on(find( [ 0 ]), 7)
  );

  checkSelection(
    'RTL Selection (This world is not what I wanted)',
    {
      // '<p>]This <strong>world</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted[</p><p><br>And even more</p>';
      fallback: {
        start: [ 0 ],
        soffset: 7,
        finish: [ 0 ],
        foffset: 0
      },
      ie: {
        start: [ 0 ],
        soffset: 0,
        finish: [ 0 ],
        foffset: 7
      },
      chrome: {
        start: [ 0 ],
        soffset: 7,
        finish: [ 0 ],
        foffset: 0
      },
      safari: {
        start: [ 0 ],
        soffset: 7,
        finish: [ 0, 0 ],
        foffset: ''.length
      }
    },
    Situ.on(find( [ 0 ]), 7),
    Situ.on(find( [ 0 ]), 0)
  );

  checkSelection(
    'LTR selection (t I)',
    {
      // '<p>This <strong>world</strong> is not <strong>w<em>ha[</em>t</strong> I<br><br>]wanted</p><p><br>And even more</p>';
      safari: {
        start: [ 0, 3, 2 ],
        soffset: ''.length,
        finish: [ 0 ],
        foffset: 6
      },
      fallback: {
        start: [ 0, 3, 1 ],
        soffset: 1,
        finish: [ 0 ],
        foffset: 6
      }
    },
    Situ.after(find( [ 0, 3, 1, 0 ]) ),
    Situ.before(find( [ 0, 6 ]) )
  );

  checkSelection(
    'RTL Selection (t I)',
    {
      // '<p>This <strong>world</strong> is not <strong>w<em>ha]</em>t</strong> I<br><br>[wanted</p><p><br>And even more</p>';
      fallback: {
        finish: [ 0, 3, 2 ],
        foffset: ''.length,
        start: [ 0 ],
        soffset: 6
      },
      firefox: {
        finish: [ 0, 3, 1 ],
        foffset: 1,
        start: [ 0 ],
        soffset: 6
      },
      chrome: {
        finish: [ 0, 3, 1 ],
        foffset: 1,
        start: [ 0 ],
        soffset: 6
      },
      ie: {
        start: [ 0, 3, 1 ],
        soffset: 1,
        finish: [ 0 ],
        foffset: 6
      },
      spartan: {
        finish: [ 0, 3, 1 ],
        foffset: 1,
        start: [ 0 ],
        soffset: 6
      }
    },
    Situ.before(find( [ 0, 6 ]) ),
    Situ.after(find( [ 0, 3, 1, 0 ]) )
  );

  checkStringAt(
    'LTR stringAt (This world is not what I)',
    // checkSelection above has error in what it thinks 0/7 is:
    //   expects:    '<p>[This <strong>world</strong> is not <strong>w<em>ha</em>t</strong> I<br><br>wanted]</p><p><br>And even more</p>';
    //   but actual: '<p>[This <strong>world</strong> is not <strong>w<em>ha</em>t</strong> I<br>]<br>wanted</p><p><br>And even more</p>';
    'This world is not what I',
    Situ.on(find( [ 0 ]), 0),
    Situ.on(find( [ 0 ]), 7)
  );

  checkStringAt(
    'RTL Selection (This world is not what I)',
    'This world is not what I',
    Situ.on(find( [ 0 ]), 7),
    Situ.on(find( [ 0 ]), 0)
  );

  // Test that proves safari will always normalise a selection to the end leaf
  // when we set the selection to the span, then get selection, all browsers will return the span
  // safari will return the textnode inside the span if one exists.
  checkUniCodeSelection('<span>\uFEFF<span>')(
    'TBIO-3883: Unicode position',
    {
      fallback: {
        start: [ 0 ],
        soffset: 0,
        finish: [ 0 ],
        foffset: 0
      },
      safari: {
        start: [ 0, 0 ],
        soffset: 0,
        finish: [ 0, 0 ],
        foffset: 0
      }
    },
    Situ.on(find( [ 0 ]), 0 ),
    Situ.on(find( [ 0 ]), 0 )
  );

  checkUniCodeSelection('<span>^<span>')(
    'TBIO-3883: Any Character',
    {
      fallback: {
        start: [ 0 ],
        soffset: 0,
        finish: [ 0 ],
        foffset: 0
      },
      safari: {
        start: [ 0, 0 ],
        soffset: 0,
        finish: [ 0, 0 ],
        foffset: 0
      }
    },
    Situ.on(find( [ 0 ]), 0 ),
    Situ.on(find( [ 0 ]), 0 )
  );

  Remove.remove(container);
});

