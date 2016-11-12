function unescape (s) {
  var new_s = null;
  for( var i = 0 ; i < s.length ; i++ ){
    var ch = s[i];
    if( '~' === ch ){
      if( new_s === null) {
        new_s = s.substr(0, i);
      }
      ch = s[++i];
      if( ch === '0' ){
        new_s += '~';
      }else if( ch === '1' ){
        new_s += '/';
      }else{
        throw new Error('Invalid escape: ~' + ch)
      }
    }else if(new_s !== null ){
      new_s += s[i];
    }
  }
  return new_s != null ? new_s : s ;
}

function escape (s) {
  var new_s = null;
  for( var i = 0 ; i < s.length ; i++ ){
    var ch = s[i];
    if( '~' === ch || '/' === ch ){
      if( new_s === null) {
        new_s = s.substr(0, i);
      }
      new_s += ( ch === '~' ) ? '~0' : '~1';
    }else if(new_s !== null ){
      new_s += s[i];
    }
  }
  return new_s !== null ? new_s : s ;
}

function isDigit(ch) {
  return ch != null && ch >= '0' && ch <= '9';
}

function str(v,fn){
  fn = fn || function() { return ''; }
  return v == null ? fn() : v.toString();
}

function iterateParts(s){
  var p = (''+s).split('/').map(unescape);
  if( p.length < 2 ){
    throw new Error('invalid path:' + s);
  }
  if( p[0] !== '' ){
    throw new Error('Path has to start with "/"');
  }
  var i = 1;
  return {
    root: p.length === 2 && p[1] === '',
    hasMore: function () {
      return i < p.length;
    },
    next: function () {
      return p[i++];
    }
  };
}

function Path (s,iterator) {
  if(!iterator){
    iterator = iterateParts(s);
  }
  this.key = iterator.next();
  this.root = iterator.root ;
  if( !iterator.root ){
    if( this.key === '' ){
      throw new Error('key is empty, please no repeating "/a//b" or trailing slashes "/a/b/c/" in path');
    }
    if( iterator.hasMore() ){
      this.next = new Path(undefined,iterator);
    }
  }
}

Object.assign(Path.prototype, {
  is_last: function () {
    return this.next == null;
  },
  last: function () {
    return this.is_last() ? this : this.next.last();
  },
  toString: function () {
    if (this.str == null) {
      this.str = '/' + escape(this.key) + str(this.next);
    }
    return this.str;
  }
});

var container_types = {
  array: {
    detect: function(container) {
      return Array.isArray(container);
    },
    detect_key: function(key){
      if(!key) return false;
      if(key === '-') return true;
      for ( var i = 0 ; i < key.length ; i++){
        var ch = key[i];
        if(ch === '-' && i === 0 )
          continue;
        if(!isDigit(ch)){
          return false;
        }
      }
      return true;
    },
    resolve_key: function(key,storage){
      if( Array.isArray(storage) ){
        var len = storage.length;
        if(key === '-'){
          return len;
        }else{
          var p = +key;
          if (p >= 0){
            return p;
          }else{
            return len+p;
          }
        }
      }else{
        return key;
      }
    },
    clone: function(source){
      return source == null ? [] : source.slice() ;
    },
    remove: function (storage, key) {
      storage.splice(key,1);
    },
    contains: function (storage, key) {
      return storage.length > key && key >= 0 ;
    }
  },
  object: {
    detect: function(container) {
      return container !== null && typeof container == 'object' && container.constructor == Object;
    },
    resolve_key: function(key,container){
      return key;
    },
    clone: function (source) {
      var output = {};
      if (source != null) {
        for (var nextKey in source) {
          if (source.hasOwnProperty(nextKey)) {
            output[nextKey] = source[nextKey];
          }
        }
      }
      return output;
    },
    remove: function (storage, key) {
      delete storage[key];
    },
    contains: function (storage, key) {
      return storage.hasOwnProperty(key) ;
    }
  }
};

function is_container( container ){
  return container_types.array.detect(container) ? container_types.array :
      container_types.object.detect(container) ? container_types.object :
          undefined ;
}

function detect_container_type(container_type,key){
  var array = container_types.array;
  if( container_type == null || container_type === array){
    if(array.detect_key(key)){
      return array;
    }
  }
  if( container_type == null ) {
    return container_types.object;
  }
  return container_type;
}

var HasCloneMixin = {
  toString: function () {
    if (this.str == null) {
      this.str = this.parent.toString() + '/' + escape(this.key);
    }
    return this.str;
  },

  hasClone: function () {
    return this.clone != null;
  },
  initClone:function(walk) {
    var newClone ;
    if( this.hasClone() ) {
      if (this.type == null || walk.type !== this.type) {
        this.type = walk.type ;
        newClone = this.type.clone(this.clone);
      }
    }else {
      this.type = walk.type ;
      newClone = this.type.clone(this.getInitial());
    }
    if(newClone !== undefined) {
      this.clone = newClone;
      if(this.parent){
        this.parent.clone[this.key] = this.clone;
      }
    }
    return this;
  },
  ensureClone: function (w) {
    if(!this.clone){
      this.initClone(w);
    }
  },
  getType: function(){
    return this.type;
  },
  onTypeChange: function(walk){
    this.initClone(walk);
  },
  getStorage: function(){
    return this.clone;
  },
  get: function(walk){
    return this.clone[walk.key];
  },
  set: function(walk,val){
    this.clone[walk.key]=val;
  },
  child: function(walk){
    this.ensureClone(walk) ;
    return this.children[walk.key] || new Tree(this, walk.key )
  }
};

function Container(storage){
  this.storage = storage;
}
Object.assign(Container.prototype,{
  getType: function(){
    return is_container(this.storage);
  },
  getStorage: function(){
    return this.storage;
  },
  onTypeChange: function(){}, //NoOp
  get: function(walk){
    return this.storage[walk.key];
  },
  child:function(walk){
    var storage = this.get(walk);
    if(is_container(storage)) {
      return new Container(storage);
    }
  }
});

function Walk(container, path) {
  if( !(path instanceof Path) ) {
    path = new Path(path);
  }
  this.container = container ;
  this.path = path;
  var type = this.container.getType();
  this.type = detect_container_type(type, path.key);
  if(type !== this.type ){
    container.onTypeChange(this);
  }
  this.key = this.type.resolve_key(path.key, this.container.getStorage());
  if (this.path.next) {
    var child = this.container.child(this);
    if(child){
      this.next = new Walk(child, this.path.next);
    }
  }
}

Object.assign( Walk.prototype , Path.prototype );

Object.assign(Walk.prototype, {
  value: function () {
    return this.container.get(this);
  }
});


function Shadow ( initial ){
  this.initial = initial ;
  this.children = {} ;
  this.str = '/';
}
Object.assign(Shadow.prototype, HasCloneMixin );
Object.assign(Shadow.prototype, {
      getInitial: function () {
        return this.initial;
      },

      get: function (path) {
        var last = new Walk(new Container(this.value()), path).last();
        return last.path.is_last() ? last.value() : undefined;
      },

      set: function (path, value) {
        var w = new Walk(this, path);
        var last = w.last();
        last.container.set(last, value);
        return w.toString();
      },

      remove: function (path) {
        var walk = new Walk(new Container(this.value()), path);
        var last = walk.last();
        if ( last.path.next == null ){
          if( last.type.contains(last.container.getStorage(), last.key) ){
            walk = new Walk(this, path); // ensure clones for whole walk
            last = walk.last();
            last.type.remove(last.container.getStorage(), last.key);
            if (last.type === container_types.array) {
              // in array keys may shift, and lastBranch.children
              // may start pointing to wrong keys
              last.container.children = {};
            }
          }
        }
      },
      value: function () {
        return this.clone || this.initial;
      },
    }
);

function Tree( parent, key ){
  this.children = {} ;
  this.parent = parent;
  this.key = key ;
  this.parent.children[this.key] = this ;
  if( this.parent instanceof Shadow){
    this.str = '/' + escape(key);
  }
}
Object.assign(Tree.prototype, HasCloneMixin );
Object.assign(Tree.prototype,
    {
      getInitial: function () {
        return this.parent.value()[this.key];
      },
      value: function () {
        return this.clone;
      }
    }
);

module.exports = {
  Path: Path ,
  Shadow: Shadow,
  private: {
    isDigit: isDigit,
    escape: escape,
    unescape: unescape,
  }
};
