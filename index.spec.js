var otree = require('.');

function jp(p) {
  return new otree.Path(p);
}

var str = JSON.stringify;

describe("OrangeTree", function() {
  it("Path constructor error", function() {
    expect(function(){ jp('s/1')})
        .toThrow(new Error('Path has to start with "/"'));

  });
  it("Path repeating slash error", function() {
    expect(function(){ jp('/a//b')})
        .toThrow(new Error('key is empty, please no repeating "/a//b" or trailing slashes "/a/b/c/" in path'));

  });

  it("Path constructor unknown type", function() {
    expect(function(){ jp(1)})
        .toThrow(new Error('invalid path:1'));

  });

  it("Path constructor", function() {
    var path = jp('/s/1');
    expect(path.key).toBe('s');
    expect(path.next.key).toBe('1');
    expect(path.next.next).toBe(undefined);
  });
});
describe("Shadow", function() {
  var Shadow = otree.Shadow;
  it("set", function () {
    var init = { a: 'a', x: [3,2] } ;
    var init_s = str(init);
    var ot = new Shadow( init ) ;
    expect(ot.get('/x/-1')).toBe(2);
    expect(ot.value() === init ).toBe(true);
    expect(str(init) ).toBe(init_s);
    ot.set('/x/-',1);
    expect(str(init) ).toBe(init_s);
    expect(ot.value() !== init ).toBe(true);
    expect(str(ot.value())).toBe('{"a":"a","x":[3,2,1]}');
    var s = ot.set('/q/-/-',55);
    expect(s).toBe('/q/0/0');
    expect(ot.toString()).toBe('/');
    expect(str(init) ).toBe(init_s);
    expect(ot.value() !== init ).toBe(true);
    expect(str(ot.value())).toBe('{"a":"a","x":[3,2,1],"q":[[55]]}' );
  });
  it("remove", function () {
    var init = { a: 'a', x: [3,2] } ;
    var init_s = str(init);
    var ot = new Shadow( init ) ;
    expect(ot.get('/x/-1')).toBe(2);
    expect(ot.value() === init ).toBe(true);
    expect(str(init) ).toBe(init_s);
    ot.remove('/x/-1');
    expect(str(init) ).toBe(init_s);
    expect(ot.value() !== init ).toBe(true);
    expect(str(ot.value())).toBe('{"a":"a","x":[3]}');
    ot.remove('/q/-/-');
    expect(str(init) ).toBe(init_s);
    expect(ot.value() !== init ).toBe(true);
    expect(str(ot.value())).toBe('{"a":"a","x":[3]}' );
    ot.remove('/a');
    expect(str(init) ).toBe(init_s);
    expect(ot.value() !== init ).toBe(true);
    expect(str(ot.value())).toBe('{"x":[3]}' );
  });
 });

 describe("private", function() {
  var private = otree.private;
   it("unescape", function () {
    var unescape = private.unescape;
    expect(unescape('abc~0xyz')).toBe('abc~xyz');
    expect(unescape('abc~1xyz')).toBe('abc/xyz');
    expect(unescape('abc~1xy~0z')).toBe('abc/xy~z');
    expect(unescape('abcxyz')).toBe('abcxyz');
    expect(function(){unescape('ab~2cxyz')})
        .toThrow(new Error('Invalid escape: ~2'));
  });
  it("escape", function () {
    var escape = private.escape;
    expect(escape('abc~xyz')).toBe('abc~0xyz');
    expect(escape('abc/xyz')).toBe('abc~1xyz');
    expect(escape('abc/xy~z')).toBe('abc~1xy~0z');
    expect(escape('abcxyz')).toBe('abcxyz');
  });
  it("isDigit", function () {
    var isDigit = private.isDigit ;
    [ '0','1','2','3',4,'5','6','7',8, '9'].forEach(
        function (d) {
          expect(isDigit(d)).toBe(true);
        }
    );
    [ 'a','z','',undefined,null].forEach(
        function (d) {
          expect(isDigit(d)).toBe(false);
        }
    );
  });
});

/*
  it("get", function() {
    var v = {a: 4, s: [1,0] };
    expect(jp('/s/1').get(v)).toBe(0);
    expect(jp('/s/0').get(v)).toBe(1);
    expect(jp('/a').get(v)).toBe(4);
    expect(jp('/s').get(v)).toEqual([1,0]);
    expect(jp('/d').get(v)).toBe(undefined);
    expect(jp('/').get(v)).toBe(v);
  });

  it("remove", function() {
    var v = {a: 4, s: [1,0] ,x : {z:5,y:{q: undefined}}};
    var s = str(v);
    var next = jp('/s/5').remove(v);
    expect(next).toBe(v);
    next = jp('/s/1').remove(v);
    expect(undefined).toBe(jp('/').remove(v));
    expect(next!==v).toBe(true);
    expect(str(v)).toBe(s);
    expect(str(next)).toBe('{"a":4,"s":[1],"x":{"z":5,"y":{}}}')
    expect(str(jp('/x/z').remove(next))).toBe('{"a":4,"s":[1],"x":{"y":{}}}')
  });
  it("set", function() {
    var v = {a: 4, s: [1,0] ,x : {z:5,y:{q: undefined}}};
    var s = str(v);
    var next = jp('/s/5').set(v,'x');
    expect(next!==v).toBe(true);
    expect(str(v)).toBe(s);
    expect(str(next)).toBe('{"a":4,"s":[1,0,null,null,null,"x"],"x":{"z":5,"y":{}}}');
    expect(0).toBe(jp('/s/1').get(next));
    expect(0).toBe(jp('/s/-1').get(v));
    expect('x').toBe(jp('/s/-1').get(next));
    expect('ha').toBe(jp('/').set(v,'ha'));
    next = jp('/s/x').set(next,'q');
    expect(next!==v).toBe(true);
    expect(str(v)).toBe(s);
    expect(str(next)).toBe('{"a":4,"s":{"0":1,"1":0,"5":"x","x":"q"},"x":{"z":5,"y":{}}}');
    expect(0).toBe(jp('/s/1').get(next));
    next = jp('/q/p/r/s/t').set(next,'q');
    expect(str(next)).toBe('{"a":4,"s":{"0":1,"1":0,"5":"x","x":"q"},"x":{"z":5,"y":{}},"q":{"p":{"r":{"s":{"t":"q"}}}}}');
    next = jp('/q/p2/-/s/t').set(next,'q');
    expect(str(next)).toBe('{"a":4,"s":{"0":1,"1":0,"5":"x","x":"q"},"x":{"z":5,"y":{}},"q":{"p":{"r":{"s":{"t":"q"}}},"p2":[{"s":{"t":"q"}}]}}' );
    next = jp('/q/p2/-/s/t').set(next,'q');
    expect(str(next)).toBe('{"a":4,"s":{"0":1,"1":0,"5":"x","x":"q"},"x":{"z":5,"y":{}},"q":{"p":{"r":{"s":{"t":"q"}}},"p2":[{"s":{"t":"q"}},{"s":{"t":"q"}}]}}');
    next = jp('/a').set(next,'q');
    expect(str(next)).toBe('{"a":"q","s":{"0":1,"1":0,"5":"x","x":"q"},"x":{"z":5,"y":{}},"q":{"p":{"r":{"s":{"t":"q"}}},"p2":[{"s":{"t":"q"}},{"s":{"t":"q"}}]}}');
  });

  it("toString", function() {
    ['/', '/a','/a/5','/x/3/x','/x~0/3/x~1','/~0','/~1'].forEach(function(s){
      expect(s).toBe(jp(s).toString());
    });
  });
  it("walk", function() {
    var dfwalk = [];
    var obj = {a:3,x:{q:[3,{z:0}]}};
    immutils.walk(obj,function(jp,v){
      dfwalk.push(jp.toString());
      dfwalk.push(v);
    });
    //on_anynode
    expect(dfwalk).toEqual([
      '/', { a : 3, x : { q : [ 3, { z : 0 } ] } },
      '/a', 3,
      '/x', { q : [ 3, { z : 0 } ] },
      '/x/q', [ 3, { z : 0 } ],
      '/x/q/0', 3,
      '/x/q/1', { z : 0 },
      '/x/q/1/z', 0 ]);
    dfwalk = [];
    immutils.walk(obj,function(jp,v){
      if( jp.path.length > 2 ){
        return false;
      }
      dfwalk.push(jp.toString());
      dfwalk.push(v);
    });
    //on_anynode
    expect(dfwalk).toEqual([
      '/', { a : 3, x : { q : [ 3, { z : 0 } ] } },
      '/a', 3,
      '/x', { q : [ 3, { z : 0 } ] }, ]);
    dfwalk = [];
    //on_leaf
    immutils.walk(obj, undefined, function(jp,v){
      dfwalk.push(jp.toString());
      dfwalk.push(v);
    });
    expect(dfwalk).toEqual([
      '/a', 3,
      '/x/q/0', 3,
      '/x/q/1/z', 0 ]);
  });
  it("sibling-parent-child", function() {
    var obj = {a:3,x:{q:[3,{z:0}]}};
    var a = jp('/x').sibling('a');
    expect(a.get(obj)).toBe(3);
    var root = a.parent() ;
    expect(root.toString()).toBe('/');
    expect(function(){root.parent()})
        .toThrow(new Error("Root pointer can't have parent"));
    expect(function(){root.sibling('x')})
        .toThrow(new Error("Root pointer cannot have siblings n=x"));
    a = root.child('a') ;
    expect(a.get(obj)).toBe(3);
    var x_q = jp('/x/q/z').parent();
    expect(x_q.toString()).toBe('/x/q');
    expect(x_q.get(obj)).toEqual( [ 3, { z : 0 } ] );
    x_q = jp('/x').child('q');
    expect(x_q.toString()).toBe('/x/q');


  });
 });

  */


