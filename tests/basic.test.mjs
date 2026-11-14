import test from 'node:test';import assert from 'node:assert/strict';
import {fallback,sanitizeX} from '../lib/content.mjs';
import {makeSVG} from '../lib/art.mjs';
test('fallback posts have two platform variants',()=>{for(const slot of ['morning','evening']){const p=fallback(slot,123);assert.ok(p.linkedin.length>100);assert.ok(p.x.length<=270);assert.ok(p.headline);}});
test('X length stays <=270',()=>assert.ok(sanitizeX('something '.repeat(500)).length<=270));
test('SVG escapes XML injection',()=>{const svg=makeSVG('<script>alert(1)</script>','Tech & AI');assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;'));});
