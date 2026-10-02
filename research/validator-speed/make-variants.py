"""
Builds patched copies of the production validator of ember-source 7.3.0.

  python3 research/validator-speed/make-variants.py

Each variant is a folder in research/validator-speed/variants/
that `pnpm bench --ember-source=<folder>` can use.

  base  the files of node_modules/ember-source, with no change
  v1    Tracker: an array and a stamp on the tag, no Set
  v2    v1 + pooled trackers, and reuse of the previous combinator tag
  v3    v2 + indexed loop in COMPUTE, no for-of, no Math.max
  v4    v3 + Cache as a class with plain fields
  v5    v4 + TrackedValue methods on the prototype, no options object
  best  v2 + the TrackedValue change of v5 + an indexed loop in COMPUTE that keeps Math.max
"""
import pathlib
import shutil

here = pathlib.Path(__file__).parent
root = here / 'variants'
installed = (here / '../../node_modules/ember-source').resolve()
chunks = 'dist/prod/packages/shared-chunks'

shutil.rmtree(root, ignore_errors=True)
(root / 'base/dist').mkdir(parents=True)
shutil.copytree(installed / 'dist/prod', root / 'base/dist/prod')
shutil.copy(installed / 'package.json', root / 'base/package.json')


def patch(variant, glob, pairs):
    files = list((root / variant / chunks).glob(glob))
    assert len(files) == 1, files
    s = files[0].read_text()
    for old, new in pairs:
        assert old in s, f'{variant}: missing\n{old}'
        s = s.replace(old, new)
    files[0].write_text(s)


def fork(src, dst):
    shutil.rmtree(root / dst, ignore_errors=True)
    shutil.copytree(root / src, root / dst)


STAMP_FIELDS = [
    ("""  subtag = null;
  subtagBufferCache = null;
  constructor(type) {""",
     """  subtag = null;
  subtagBufferCache = null;
  lastTracker = 0;
  constructor(type) {"""),
    ("""class VolatileTag {
  [TYPE] = VOLATILE_TAG_ID;""",
     """class VolatileTag {
  lastTracker = 0;
  [TYPE] = VOLATILE_TAG_ID;"""),
    ("""class CurrentTag {
  [TYPE] = CURRENT_TAG_ID;""",
     """class CurrentTag {
  lastTracker = 0;
  [TYPE] = CURRENT_TAG_ID;"""),
]

OLD_TRACKER = """class Tracker {
  tags = new Set();
  last = null;
  add(tag) {
    if (tag === CONSTANT_TAG) return;
    this.tags.add(tag);
    this.last = tag;
  }
  combine() {
    let {
      tags
    } = this;
    if (tags.size === 0) {
      return CONSTANT_TAG;
    } else if (tags.size === 1) {
      return this.last;
    } else {
      return combine(Array.from(this.tags));
    }
  }
}"""

V1_TRACKER = """let TRACKER_ID = 0;
class Tracker {
  tags = [];
  id = ++TRACKER_ID;
  add(tag) {
    if (tag === CONSTANT_TAG) return;
    if (tag.lastTracker === this.id) return;
    tag.lastTracker = this.id;
    this.tags.push(tag);
  }
  combine() {
    let {
      tags
    } = this;
    if (tags.length === 0) {
      return CONSTANT_TAG;
    } else if (tags.length === 1) {
      return tags[0];
    } else {
      return combine(tags);
    }
  }
}"""

V2_TRACKER = """let TRACKER_ID = 0;
let DEPTH = 0;
const TRACKERS = [];
class Tracker {
  tags = [];
  size = 0;
  id = 0;
  add(tag) {
    if (tag === CONSTANT_TAG) return;
    if (tag.lastTracker === this.id) return;
    tag.lastTracker = this.id;
    this.tags[this.size++] = tag;
  }
  combine(previous) {
    let {
      tags,
      size
    } = this;
    if (size === 0) {
      return CONSTANT_TAG;
    } else if (size === 1) {
      return tags[0];
    }
    if (previous !== undefined) {
      let subtag = previous.subtag;
      if (Array.isArray(subtag) && subtag.length === size) {
        let same = true;
        for (let i = 0; i < size; i++) {
          if (subtag[i] !== tags[i]) {
            same = false;
            break;
          }
        }
        if (same) return previous;
      }
    }
    return combine(tags.slice(0, size));
  }
}"""

fork('base', 'v1')
patch('v1', 'cache-CofLhaS4.js', STAMP_FIELDS + [(OLD_TRACKER, V1_TRACKER)])

fork('v1', 'v2')
patch('v2', 'cache-CofLhaS4.js', [
    (V1_TRACKER, V2_TRACKER),
    ("""function beginTrackFrame(debuggingContext) {
  OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
  CURRENT_TRACKER = new Tracker();
}
function endTrackFrame() {
  let current = CURRENT_TRACKER;
  CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
  return unwrap(current).combine();
}""",
     """function beginTrackFrame(debuggingContext) {
  OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
  let tracker = TRACKERS[DEPTH];
  if (tracker === undefined) {
    tracker = TRACKERS[DEPTH] = new Tracker();
  }
  DEPTH++;
  tracker.size = 0;
  tracker.id = ++TRACKER_ID;
  CURRENT_TRACKER = tracker;
}
function endTrackFrame(previous) {
  let current = CURRENT_TRACKER;
  DEPTH--;
  CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
  return unwrap(current).combine(previous);
}"""),
    ("""  while (OPEN_TRACK_FRAMES.length > 0) {
    OPEN_TRACK_FRAMES.pop();
  }
  CURRENT_TRACKER = null;""",
     """  while (OPEN_TRACK_FRAMES.length > 0) {
    OPEN_TRACK_FRAMES.pop();
  }
  DEPTH = 0;
  CURRENT_TRACKER = null;"""),
    ("""    } finally {
      tag = endTrackFrame();
      cache[TAG] = tag;""",
     """    } finally {
      tag = endTrackFrame(tag);
      cache[TAG] = tag;"""),
])

fork('v2', 'v3')
patch('v3', 'cache-CofLhaS4.js', [
    ("""            for (const tag of subtag) {
              let value = tag[COMPUTE]();
              revision = Math.max(value, revision);
            }""",
     """            for (let i = 0; i < subtag.length; i++) {
              let value = subtag[i][COMPUTE]();
              if (value > revision) revision = value;
            }"""),
])

fork('v3', 'v4')
patch('v4', 'cache-CofLhaS4.js', [
    ("""function createCache(fn, debuggingLabel) {
  let cache = {
    [FN]: fn,
    [LAST_VALUE]: undefined,
    [TAG]: undefined,
    [SNAPSHOT]: -1
  };
  return cache;
}
function getValue(cache) {
  let fn = cache[FN];
  let tag = cache[TAG];
  let snapshot = cache[SNAPSHOT];
  if (tag === undefined || !validateTag(tag, snapshot)) {
    beginTrackFrame();
    try {
      cache[LAST_VALUE] = fn();
    } finally {
      tag = endTrackFrame(tag);
      cache[TAG] = tag;
      cache[SNAPSHOT] = valueForTag(tag);
      consumeTag(tag);
    }
  } else {
    consumeTag(tag);
  }
  return cache[LAST_VALUE];
}
function isConst(cache) {
  let tag = cache[TAG];""",
     """class Cache {
  lastValue = undefined;
  tag = undefined;
  snapshot = -1;
  constructor(fn) {
    this.fn = fn;
  }
}
function createCache(fn, debuggingLabel) {
  return new Cache(fn);
}
function getValue(cache) {
  let tag = cache.tag;
  if (tag === undefined || !validateTag(tag, cache.snapshot)) {
    beginTrackFrame();
    try {
      cache.lastValue = cache.fn();
    } finally {
      tag = endTrackFrame(tag);
      cache.tag = tag;
      cache.snapshot = valueForTag(tag);
      consumeTag(tag);
    }
  } else {
    consumeTag(tag);
  }
  return cache.lastValue;
}
function isConst(cache) {
  let tag = cache.tag;"""),
])

def patch_tracked_value(variant):
    files = list((root / variant / chunks).glob('tracked-value-*.js'))
    assert len(files) == 1, files
    src = files[0].read_text()
    a = src.index('class TrackedValue {')
    b = src.index('export {', a)
    assert 'function trackedValue(value, options) {' in src[a:b]
    src = src[:a] + """class TrackedValue {
  #isFrozen = false;
  #value;
  #equals;
  #description;
  #tag;
  constructor(value, equals, description) {
    this.#value = value;
    this.#equals = equals;
    this.#description = description;
    this.#tag = createUpdatableTag();
  }
  get value() {
    consumeTag(this.#tag);
    return this.#value;
  }
  set value(value) {
    this.set(value);
  }
  get() {
    return this.value;
  }
  set(value) {
    if (this.#isFrozen) {
      throw new Error(`Cannot update a frozen TrackedValue${this.#description ? ` (\\`${this.#description}\\`)` : ''}`);
    }
    if (this.#equals(this.#value, value)) {
      return false;
    }
    this.#value = value;
    DIRTY_TAG(this.#tag);
    return true;
  }
  update(updater) {
    this.set(updater(this.#value));
  }
  freeze() {
    this.#isFrozen = true;
  }
}
function trackedValue(value, options) {
  return new TrackedValue(value, options?.equals ?? Object.is, options?.description);
}

""" + src[b:]
    files[0].write_text(src)


fork('v4', 'v5')
patch_tracked_value('v5')

fork('v2', 'best')
patch_tracked_value('best')
patch('best', 'cache-CofLhaS4.js', [
    ("""            for (const tag of subtag) {
              let value = tag[COMPUTE]();
              revision = Math.max(value, revision);
            }""",
     """            for (let i = 0; i < subtag.length; i++) {
              revision = Math.max(subtag[i][COMPUTE](), revision);
            }"""),
])

print('variants built: base v1 v2 v3 v4 v5 best')
