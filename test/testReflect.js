// Copyright (C) 2011-2012 Software Languages Lab, Vrije Universiteit Brussel
// This code is dual-licensed under both the Apache License and the MPL

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is a series of unit tests for the ES-harmony reflect module.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011-2012
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */
// for node.js
if(typeof require === 'function') {
  var load = require;
  var print = function(msg) {
    if(/^fail/.test(msg)) { console.error(msg); }
    else { console.log(msg); }
  }
}
load('../reflect.js');

function assert(b, msg) {
  print((b ? 'success: ' : 'fail: ') + msg);
}

function assertThrows(message, fn) {
  try {
    fn();
    print('fail: expected exception, but succeeded. Message was: '+message);
  } catch(e) {
    assert(e.message === message, "assertThrows: "+e.message);
  }
}

// the 'main' function
function test() {
  
  // getOwnPropertyDescriptor(target : object, name : string) -> object?
  (function(){
    assert(Reflect.getOwnPropertyDescriptor({x:1},'x').value === 1,
           'getOwnPropertyDescriptor existent property');
    assert(Reflect.getOwnPropertyDescriptor({x:1},'y') === undefined,
           'getOwnPropertyDescriptor non-existent property');    
  }());

  // defineProperty(target : object, name : string, desc : object) -> bool
  (function(){
    var target = {x:1};
    assert(Reflect.defineProperty(target, 'x', {value: 2}) === true &&
           target.x === 2,
           'defineProperty update success');
    assert(Reflect.defineProperty(target, 'y', {value: 3}) === true &&
           target.y === 3,
           'defineProperty addition success');
    Object.defineProperty(target,'z',{
      value:0,
      writable:false,
      configurable:false });
    assert(Reflect.defineProperty(target, 'z', {value: 1}) === false &&
           target.z === 0,
           'defineProperty update failure');
  }());

  // getOwnPropertyNames(target : object) -> array[string]
  (function(){
    var target = Object.create(Object.prototype, {
      x: { value:1, enumerable: true  },
      y: { value:2, enumerable: false },
      z: { get: function(){}, enumerable: true }
    });
    var result = Reflect.getOwnPropertyNames(target);
    assert(result.length === 3 &&
           result.indexOf('x') !== -1 &&
           result.indexOf('y') !== -1 &&
           result.indexOf('z') !== -1,
           'getOwnPropertyNames success');
  }());
  
  // deleteProperty(target : object, name : string) -> bool
  (function(){
    var target = Object.create(Object.prototype, {
      x: { value:1, configurable: true  },
      y: { value:2, configurable: false },
    });
    
    assert(Reflect.deleteProperty(target, 'x') === true &&
           target.x === undefined,
           'deleteProperty success');
    assert(Reflect.deleteProperty(target, 'y') === false &&
           target.y === 2,
           'deleteProperty failure');    
  }());
  
  // enumerate(target : object) -> array[string]
  (function(){
    var target = Object.create({ z:3 }, {
      x: { value:1, enumerable: true  },
      y: { value:2, enumerable: false },
    });
    var result = Reflect.enumerate(target);
    assert(result.length === 2 &&
           result.indexOf('x') !== -1 &&
           result.indexOf('z') !== -1,
           'enumerate success');
  }());
  
  // iterate(target : object) -> iterator
  (function(){
    var target = Object.create(Object.prototype, {
      x: { value:1, enumerable: true  },
      y: { value:2, enumerable: false },
    });
    var iterator = Reflect.iterate(target);
    var result = [];
    try {
      while (true) {
        result.push(iterator.next());
      }
    } catch (e) {
      if (e !== StopIteration) throw e;
    }
    assert(result.length === 1 &&
           result[0] === 'x',
           'iterate success');
  }());
  
  // freeze(target : object) -> bool
  (function(){
    var target = {x:1};
    assert(Reflect.freeze(target) === true, 'freeze success');
    assert(Object.isExtensible(target) === false, 'frozen -> non-extensible');
    var desc = Reflect.getOwnPropertyDescriptor(target,'x');
    assert(desc.configurable === false, 'frozen -> non-configurable');
    assert(desc.writable === false, 'frozen -> non-writable');
  }());
  
  // seal(target : object) -> bool
  (function(){
    var target = {x:1};
    assert(Reflect.seal(target) === true, 'seal success');
    assert(Object.isExtensible(target) === false, 'sealed -> non-extensible');
    var desc = Reflect.getOwnPropertyDescriptor(target,'x');
    assert(desc.configurable === false, 'sealed -> non-configurable'); 
    assert(desc.writable === true, 'sealed -/-> non-writable'); 
  }());
  
  // preventExtensions(target : object) -> bool
  (function(){
    var target = {x:1};
    assert(Reflect.preventExtensions(target) === true, 'pE success');
    assert(Object.isExtensible(target) === false, 'pE -> non-extensible');
    var desc = Reflect.getOwnPropertyDescriptor(target,'x');
    assert(desc.configurable === true, 'pE -/-> non-configurable'); 
    assert(desc.writable === true, 'pE -/-> non-writable');     
  }());
  
  // has(target : object, name : string) -> bool
  (function(){
    var proto = {x:1};
    var target = Object.create(proto, {y: {value:2 }});
    assert(Reflect.has(target, 'x') === true, 'has proto ok');
    assert(Reflect.has(target, 'y') === true, 'has own ok');
    assert(Reflect.has(target, 'z') === false, 'has failure');
  }());
  
  // hasOwn(target : object, name : string) -> bool
  (function(){
    var proto = {x:1};
    var target = Object.create(proto, {y: {value:2 }});
    assert(Reflect.hasOwn(target, 'x') === false, 'hasOwn proto ok');
    assert(Reflect.hasOwn(target, 'y') === true, 'hasOwn own ok');
    assert(Reflect.hasOwn(target, 'z') === false, 'hasOwn failure');
  }());
  
  // keys(target : object) -> array[string]
  (function(){
    var target = Object.create({z:3}, {
      x: { value:1, enumerable: true  },
      y: { value:2, enumerable: false },
    });
    var result = Reflect.keys(target);
    assert(result.length === 1 &&
           result[0] === 'x',
           'keys success');
  }());
  
  // get(target : object, name : string, receiver : object?) -> any
  (function(){
    var target = Object.create({z:3, get w() { return this; }}, {
      x: { value: 1 },
      y: { get: function() { return this; } },
    });
    
    var receiver = {};
    assert(Reflect.get(target,'x',receiver) === 1,         'get x');
    assert(Reflect.get(target,'y',receiver) === receiver,  'get y');
    assert(Reflect.get(target,'z',receiver) === 3,         'get z');
    assert(Reflect.get(target,'w',receiver) === receiver,  'get w');
    assert(Reflect.get(target,'u',receiver) === undefined, 'get u');
  }());
  
  // set(target : object, name : string, value : any, receiver : object?) -> bool
  (function(){
    var out;
    var target = Object.create({z:3,
                                set w(v) { out = this; }}, {
      x: { value: 1, writable: true, configurable: true },
      y: { set: function(v) { out = this; } },
      c: { value: 1, writable: false, configurable: false },
    });
    
    assert(Reflect.set(target,'x',2,target) === true &&
           target.x === 2,
           'set x');
    
    out = null; // reset out
    assert(Reflect.set(target,'y',1,target) === true &&
           out === target,
           'set y');
    
    assert(Reflect.set(target,'z',4,target) === true &&
           target.z === 4,
           'set z');
    
    out = null; // reset out
    assert(Reflect.set(target,'w',1,target) === true &&
           out === target,
           'set w');
           
    assert(Reflect.set(target,'u',0,target) === true &&
           target.u === 0,
           'set u');

    assert(Reflect.set(target,'c',2,target) === false &&
           target.c === 1,
           'set c');
  }());
  
  // apply(target : object, receiver : object?, args : array) -> any
  (function(){
    assert(Reflect.apply(function(x) { return x; },
                         undefined,
                         [1]) === 1, 'apply identity');

    var receiver = {};
    assert(Reflect.apply(function() { return this; },
                         receiver,
                         []) === receiver, 'apply this');
  }());
  
  // construct(target : object, args : array) -> any
  (function(){
    assert(Reflect.construct(function(x) { return x; },
                             [1]) !== 1, 'construct identity');

    assert(Reflect.construct(function(x,y,z) { this.x = x; },
                             [1,2,3]).x === 1, 'construct this');    
  }());
  
}

if (typeof window === "undefined") {
  test();
}