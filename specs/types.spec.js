
var t_ = require("../types");
var _ = require("lodash");


describe( 'types',function(){

  it( '#parseDateUTC', function() {
    var isoDate = t_.parseDateUTC('2014-09-08 17:00:00');
    expect('2014-09-08T17:00:00.000Z').toBe(isoDate.toISOString());
  });
  it( '#relativeDateString', function() {
    var s = t_.relativeDateString(
        t_.parseDateUTC('2014-09-08 17:00:00'),
        t_.parseDateUTC('2014-09-08 18:01:20'));
    expect(s).toBe('-01:01');
    s = t_.relativeDateString(
        t_.parseDateUTC('2014-09-08 18:01:20'),
        t_.parseDateUTC('2014-09-08 17:00:00')
    );
    expect(s).toBe('+01:01');
    s = t_.relativeDateString(
        t_.parseDateUTC('2014-09-08 18:01:20'),
        t_.parseDateUTC('2014-09-09 17:00:00')
    );
    expect(s).toBe( '-22:59');
    s = t_.relativeDateString(
        t_.parseDateUTC('2014-09-08 18:01:20'),
        t_.parseDateUTC('2014-09-10 17:00:00')
    );
    expect(s).toBe( '2014-09-08 18:01');
  });
  it( '#dateToIsoString', function() {
    var isoDate = new Date(Date.UTC(1980, 0, 1)).toISOString();
    expect(isoDate).toBe('1980-01-01T00:00:00.000Z');
    expect(new Date(isoDate).toISOString()).toBe('1980-01-01T00:00:00.000Z');
  });
  it( '#sorting', function() {
    expect(0).toBe(t_.sorting(0));
    expect(0).toBe(t_.sorting('0'));
    expect(0).toBe(t_.sorting(''));
    expect(0).toBe(t_.sorting('A'));
    expect(0).toBe(t_.sorting('ASC'));
    expect(0).toBe(t_.sorting('ASCENDING'));
    expect(0).toBe(t_.sorting('xxx'));
    expect(1).toBe(t_.sorting('D'));
    expect(1).toBe(t_.sorting('DESC'));
    expect(1).toBe(t_.sorting('DESCENDING'));
    expect(1).toBe(t_.sorting(1));
    expect(1).toBe(t_.sorting('1'));
  });
  it( '#binarySearch', function() {
    var array = [ 1, 2, 4, 6, 8, 10, 25 ];
    function test(value, position) {
      var found = t_.binarySearch(value, array, t_.types.number.compare);
      expect(found).toBe(position);
    }
    test(10, 5);
    test(25, 6);
    test(-1, -1);
    test(3, -3);
    test(5, -4);
    test(6, 3);
    test(7, -5);
    test(8, 4);
    test(9, -6);
    test(24, -7);
    test(26, -8);
    array.splice(5, 1);
    test(10, -6);
    test(25, 5);
    test(-1, -1);
    test(3, -3);
    test(5, -4);
    test(6, 3);
    test(7, -5);
    test(8, 4);
    test(9, -6);
    test(24, -6);
    test(26, -7);
  });
  it( '#isArrayEmpty', function() {
    var nope = [ 'Nope', 'Nope' ];
    expect(t_.isArrayEmpty(nope)).toBe(false);
    expect(t_.isArrayEmpty([null])).toBe(false);
    expect(t_.isArrayEmpty(null)).toBe(true);
    expect(t_.isArrayEmpty(undefined)).toBe(true);
    expect(t_.isArrayEmpty([])).toBe(true);
  });
  it( '#parse_date', function() {
    function test(to_s,to_d,s){
      expect(s).toBe(to_s(to_d(s)));
    }

    var to_utc_s = t_.date_to_string_fn("YYYY_MM_DD_hh_mm_ss",t_.utc_components);
    test(to_utc_s,t_.parseDateUTC, "2015-12-31 23:59:59");
    var to_local_s = t_.date_to_string_fn("YYYY_MM_DD_hh_mm_ss",t_.date_components);
    test(to_local_s,t_.parseDate, "2015-12-31 23:59:59");

  });
});

function smartAssert(expected, result, msg) {
  if( _.isUndefined(expected) )  {
    expect( _.isUndefined(result) ).toBe(true, msg);
  }else if( expected == null )  {
    expect( result==null ).toBe(true, msg);
  }else if (expected instanceof t_.Link){
    expect(expected.href).toBe(result.href, msg + ' e:'+expected.href+ ' r:'+result.href);
    expect(expected.text).toBe(result.text, msg + ' e:'+expected.href+ ' r:'+result.href);
  } else if (_.isDate(expected)){
    var r = result && result.valueOf();
    var e =expected.valueOf() ;
    expect(e).toBe(r, msg + ' e:'+e+ ' r:'+r);
  } else if (isNaN(expected)){
    expect(isNaN(result)).toBe(true, msg);
  } else  {
    expect(result).toBe(expected, msg);
  }
}

describe( 'types',function(){
    it('Link', function() {
      var s = '[a](b)';
      expect(new t_.Link.parse(s).toString(),s);
    });
    it('Sort & Order', function() {
      var cmp = t_.types.string.compare;
      expect(cmp(undefined,null)).toBe(-1);
      expect(cmp(null,undefined)).toBe(1);
      expect(cmp(null,'z')).toBe(-1);
      expect(cmp('z',null)).toBe(1);
      expect(cmp(undefined,'z')).toBe(-1);
      expect(cmp('z', undefined)).toBe(1);
      expect(cmp('z','a')).toBe(1);
      expect(cmp('a','z')).toBe(-1);
      var array = ['a','A',null,'z','r',undefined ] ;
      var index = _.range(array.length);
      var mapper = function(idx){return array[idx];};
      expect(array).toEqual(['a','A',null,'z','r',undefined ],'sanity');
      expect(index).toEqual([0,1,2,3,4,5 ],'index');
      index.sort(t_.orderWithResolver(cmp,mapper));
      expect(index.map(mapper)).toEqual([ undefined, null, "A", "a", "r", "z" ],'check order');
      expect(index).toEqual([ 5, 2, 1, 0, 4, 3 ],'check index');
      expect(array).toEqual(['a','A',null,'z','r',undefined ],'original array unchanged');
      index.sort(t_.orderInverse(t_.orderWithResolver(cmp,mapper)));
      expect(index).toEqual([ 3, 4, 0, 1, 2, 5 ]);
    });
    it('types[*].from_string', function() {
      var cases = {
        string : {
          positive: {'' : null, 'a' : 'a', '3' : '3' },
          negative: []
        },
        number : {
          positive: {
            '' : NaN, 'NaN': NaN, '3' : 3, '0' : 0,
            '0x15' : 21, '1e8' : 1e8, 'null' : NaN },
          negative: ['3a', 's']
        },
        link : {
          positive: {
            '' : null, '[](3)' : new t_.Link('3'),
            '[a](/a)' : new t_.Link('/a','a'),
            null: null },
          negative: [ 'NaN' ,'3a', 's', '[)', '[](','[]','[])']
        },
        boolean : {
          positive: {
            '' : null, null: null, '1' : true, '0' : false,
            'Y' : true, 'true' : true, 'no' : false ,
            '.0001':true , '2.7':true, '5':true, '1e-10':false },
          negative: ['3a', 's' ],
          positive_strict: {
            '' : null, null: null, '1' : true, '0' : false,
            'Y' : true, 'true' : true, 'no' : false },
          negative_strict: ['3a', 's' , '5', '2.7']
        },
        date : {
          positive_strict: {
            '' : null ,
            '2015-09-15' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915' : new Date(Date.UTC(2015,8,15,0,0,0)),
          },
          negative_strict: ['3a', 's' , '5', '2.7', '2015-09-15T17:00:14','2015-09-15 17:00:14'],
          positive: {
            '' : null ,
            '2015-09-15' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915170014' : new Date(Date.UTC(2015,8,15)),
            '20150915-170014' : new Date(Date.UTC(2015,8,15)),
          },
          negative: ['3a', 's' , '5', '2.7']
        },
        datetime : {
          positive_strict: {
            '2015-09-15T17:00:14' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15 17:00:14' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915170014' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '20150915-170014' : new Date(Date.UTC(2015,8,15,17,0,14)),},
          negative_strict: ['3a', 's' , '5', '2.7', '2015-09-15T17:00:14.023Z' ,'2015-09-15T17:00:14.023' ],
          positive: {
            '2015-09-15T17:00:14' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15 17:00:14' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915170014' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15 17:00:14.345' : new Date(Date.UTC(2015,8,15,17,0,14)),},
          negative: ['3a', 's' , '5', '2.7' ,'2015-09-15-17:00:14.345']
        },
        timestamp : {
          positive: {
            '2015-09-15T17:00:14' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15 17:00:14' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915' : new Date(Date.UTC(2015,8,15,0,0,0)),
            '20150915170014' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '20150915-170014' : new Date(Date.UTC(2015,8,15,17,0,14)),
            '2015-09-15T17:00:14.023' : new Date(Date.UTC(2015,8,15,17,0,14,23)),
            '2015-09-15T17:00:14.023Z' : new Date(Date.UTC(2015,8,15,17,0,14,23)), },
          negative: ['3a', 's' , '5', '2.7']
        },
      };
      var input, out, expected, msg ;

      function test_fromstring(t,strict) {

        var c = cases[t];
        var suffix = strict ? '_strict' : '';
        var positive_cases = c['positive'+suffix];
        var negative_cases = c['negative'+suffix];
        for (input in positive_cases) {
          out = t_.types[t].from_string(input, strict);
          expected = positive_cases[input];
          msg = t + suffix + ' in:' + input + ' expected:' + expected;
          smartAssert(expected, out, msg);
        }
        for (var i in negative_cases) {
          input = negative_cases[i];
          out = t_.types[t].from_string(input, strict);
          msg = t +suffix+ ' in:' + input + ' should be undefined:' + out;
          expect(undefined === out).toBe(true, msg);
        }
      }

      //test_fromstring('link',false);
      for(var t in  cases){
        test_fromstring(t,false);
        test_fromstring(t,true);
      }

    });
    it('types[*].to_string', function() {
      var cases = {
        string : [ [null , ''], ['a' , 'a'], [ '3' , '3'] ],
        number : [ [ NaN,''],[3,'3'],[null,''],[1e8,'100000000']],
        link : [ [ null,''],
          [new t_.Link('/a'),'[](/a)'],
          [new t_.Link('/a','xx'),'[xx](/a)'],
        ],
        boolean : [ [true,'true'],[false,'false'],[null,'']],
        date : [ [new Date(Date.UTC(2015,8,15,17,0,14)),'2015-09-15'],[null,""]],
        datetime : [ [new Date(Date.UTC(2015,8,15,17,0,14)),'2015-09-15 17:00:14'],[null,""]],
        timestamp : [ [new Date(Date.UTC(2015,8,15,17,0,14,134)),'2015-09-15 17:00:14.134'],[null,""]],
      };
      var input, out, expected, msg ;
      for(var t in  cases){
        for(var i in cases[t]){
          input = cases[t][i][0];
          out = t_.types[t].to_string(input);
          expected = cases[t][i][1];
          msg = t+' result:'+out+' expected:'+expected;
          expect(out).toBe( expected, msg );
        }
      }
//    var x = '2015-09-15T17:00:14';
//    expect(moment(x).format('YYYY-MM-DDTHH:mm:ss')).toBe(x);
    });
  });
  describe('detect_possible_array_types', function() {
    function matchArrays(a,b){
      expect(_.isArray(a)).toBe(true);
      expect(_.isArray(b)).toBe(true);
      expect(a.length).toBe(b.length);
      for(var i = 0 ; i < a.length ; i++){
        smartAssert( a[i], b[i], JSON.stringify([a[i],b[i]]) );
      }
    }
    function match(a,b,selected){
      expect(Object.keys(a).sort()).toEqual(Object.keys(b).sort());
      Object.keys(a).forEach(function(k){
        expect(a[k].hasMissing).toBe(b[k].hasMissing);
        matchArrays(a[k].array,b[k].array);
      });
      expect(t_.choose_column_type(b).type.name).toBe(selected);
    }

    describe('has missing', function() {
      it('number', function() {

        match(  {
              string:{ array:['5','0',''],hasMissing:true},
              number:{ array:[5,0,NaN],hasMissing:true},
            },
            t_.detect_possible_array_types( ['5','0',''] ),
            'number');
      });
      it('number and boolean', function() {
        match(  {
              string:{ array:['1','0',''],hasMissing:true},
              boolean:{ array:[true,false,null],hasMissing:true},
              number:{ array:[1,0,NaN],hasMissing:true},
            },
            t_.detect_possible_array_types(['1','0',''] ),
            'number');
      });
      it('link', function() {
        match(  {
              string:{ array:['[rr](x)','[](/a)',''],hasMissing:true},
              link:{ array:[new t_.Link('x','rr'),new t_.Link('/a',''),null],hasMissing:true},
            },
            t_.detect_possible_array_types(['[rr](x)','[](/a)',''] ),
            'link');
      });
      it('date', function() {
        match(  {
              string:{ array:['1994-10-17','2015-02-03',''],hasMissing:true},
              date:{ array:[ new Date(Date.UTC(1994,9,17)),new Date(Date.UTC(2015,1,3)),null],hasMissing:true},
              timestamp:{ array:[ new Date(Date.UTC(1994,9,17)),new Date(Date.UTC(2015,1,3)),null],hasMissing:true},
              datetime:{ array:[new Date(Date.UTC(1994,9,17)),new  Date(Date.UTC(2015,1,3)),null],hasMissing:true},
            },
            t_.detect_possible_array_types(['1994-10-17','2015-02-03',''] ),
            'date');
      });
      it('string', function() {
        match(  {
              string:{ array:['1994-10-17','2015',''],hasMissing:true},
            },
            t_.detect_possible_array_types(['1994-10-17','2015',''] ),
            'string');
      });
    });
    describe('no missing', function() {
      it('number', function() {
        match(  {
              string:{ array:['5','0'],hasMissing:false},
              number:{ array:[5,0],hasMissing:false},
            },
            t_.detect_possible_array_types(['5','0'] ),'number');
      });
      it('number and boolean', function() {
        match(  {
              string:{ array:['1','0'],hasMissing:false},
              boolean:{ array:[true,false],hasMissing:false},
              number:{ array:[1,0],hasMissing:false},
            },
            t_.detect_possible_array_types(['1','0'] ),'number');
      });
      it('link', function() {
        match(  {
              string:{ array:['[rr](x)','[](/a)'],hasMissing:false},
              link:{ array:[new t_.Link('x','rr'),new t_.Link('/a','')],hasMissing:false},
            },
            t_.detect_possible_array_types(['[rr](x)','[](/a)'] ),
            'link');
      });
      it('date', function() {
        match(  {
              string:{ array:['1994-10-17','2015-02-03'],hasMissing:false},
              date:{ array:[ new Date(Date.UTC(1994,9,17)),new Date(Date.UTC(2015,1,3))],hasMissing:false},
              timestamp:{ array:[ new Date(Date.UTC(1994,9,17)),new Date(Date.UTC(2015,1,3))],hasMissing:false},
              datetime:{ array:[new Date(Date.UTC(1994,9,17)),new  Date(Date.UTC(2015,1,3))],hasMissing:false},
            },
            t_.detect_possible_array_types(['1994-10-17','2015-02-03'] ),'date');
      });
      it('datetime', function() {
        match(  {
              string:{ array:['1994-10-17','2015-02-03'],hasMissing:false},
              timestamp:{ array:[new Date(Date.UTC(1994,9,17,17,3,5)),new  Date(Date.UTC(2015,1,3))],hasMissing:false},
              datetime:{ array:[new Date(Date.UTC(1994,9,17,17,3,5)),new  Date(Date.UTC(2015,1,3))],hasMissing:false},
            },
            t_.detect_possible_array_types(['1994-10-17 17:03:05','2015-02-03']),'datetime');
      });
      it('datetime number', function() {
        match(  {
              string:{ array:['19941017170305','20150203'],hasMissing:false},
              number:{ array:[19941017170305,20150203],hasMissing:false},
              timestamp:{ array:[new Date(Date.UTC(1994,9,17,17,3,5)),new  Date(Date.UTC(2015,1,3))],hasMissing:false},
              datetime:{ array:[new Date(Date.UTC(1994,9,17,17,3,5)),new  Date(Date.UTC(2015,1,3))],hasMissing:false},
            },
            t_.detect_possible_array_types(['19941017170305','20150203']), 'number');
      });
      it('string', function() {
        match(  {
              string:{ array:['1994-10-17','2015'],hasMissing:false},
            },
            t_.detect_possible_array_types(['1994-10-17','2015'] ),'string');
      });
    });
  it('types.coerce', function() {
    var cases = {
      string: {
        number: [[null, NaN], ['a', undefined], ['3', 3]],
        boolean: [[null, null],['',null], ['0',false],
          ['1',true], ['n',false],['Y',true],['yes',true],['true',true],
          ['yada sddfs',null],['nada sddfs',null]],
        date: [[null,null],['flkdjflk',undefined],
          ['1995-12-17',new Date(Date.UTC(1995,11,17))],
          ['1995-12-17 18:30:45',new Date(Date.UTC(1995,11,17))],
        ],
        datetime: [[null,null],['flkdjflk',undefined],
          ['1995-12-17',new Date(Date.UTC(1995,11,17))],
          ['1995-12-17 18:30:45',new Date(Date.UTC(1995,11,17,18,30,45))],
          ['1995-12-17 18:30:45.345',new Date(Date.UTC(1995,11,17,18,30,45))],
        ],
        timestamp: [[null,null],['flkdjflk',undefined],
          ['1995-12-17',new Date(Date.UTC(1995,11,17))],
          ['1995-12-17 18:30:45',new Date(Date.UTC(1995,11,17,18,30,45))],
          ['1995-12-17 18:30:45.345',new Date(Date.UTC(1995,11,17,18,30,45,345))],
        ]
      },
      number: {
        string: [[NaN, ''], [5, '5'], [null, '']],
        boolean: [[null, null],[1,true], [0,false], [0.5,true],[NaN,null]],
        date: [[null,null],[NaN,null],
          [Date.UTC(2015,7,17), new Date(Date.UTC(2015,7,17))],
          [Date.UTC(2015,7,17,12,5,13), new Date(Date.UTC(2015,7,17))],
          [Date.UTC(2015,7,17,12,5,13,345), new Date(Date.UTC(2015,7,17))],
        ],
        datetime: [[null,null],[NaN,null],
          [Date.UTC(2015,7,17), new Date(Date.UTC(2015,7,17))],
          [Date.UTC(2015,7,17,12,5,13), new Date(Date.UTC(2015,7,17,12,5,13))],
          [Date.UTC(2015,7,17,12,5,13,345), new Date(Date.UTC(2015,7,17,12,5,13))],
        ],
        timestamp: [[null,null],[NaN,null],
          [Date.UTC(2015,7,17), new Date(Date.UTC(2015,7,17))],
          [Date.UTC(2015,7,17,12,5,13), new Date(Date.UTC(2015,7,17,12,5,13))],
          [Date.UTC(2015,7,17,12,5,13,345), new Date(Date.UTC(2015,7,17,12,5,13,345))],
        ]
      },
      boolean: {
        string: [[null, ''], [false, 'false'], [true, 'true']],
        number: [[null, NaN],[true,1], [false,0], ],
        date: [[null,null],[false,null],[true,null]],
        datetime: [[null,null],[false,null],[true,null]],
        timestamp: [[null,null],[false,null],[true,null]]
      },
      date: {
        string: [[null, ''],[new Date(Date.UTC(2015,8,15)), '2015-09-15']] ,
        number: [[null, NaN],[new Date(Date.UTC(2015,8,15)), Date.UTC(2015,8,15) ]] ,
        boolean: [[null,null],[new Date(Date.UTC(2015,8,15)),null]],
        datetime: [[null,null],[new Date(Date.UTC(2015,8,15)),new Date(Date.UTC(2015,8,15))]],
        timestamp: [[null,null],[new Date(Date.UTC(2015,8,15)),new Date(Date.UTC(2015,8,15))]]
      },
      datetime: {
        string: [[null, ''],[new Date(Date.UTC(2015,8,15,17,22,42)), '2015-09-15 17:22:42']] ,
        number: [[null, NaN],[new Date(Date.UTC(2015,8,15,17,22,42)), Date.UTC(2015,8,15,17,22,42) ]] ,
        boolean: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42)),null]],
        date: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42)),new Date(Date.UTC(2015,8,15))]],
        timestamp: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42)),new Date(Date.UTC(2015,8,15,17,22,42))]]
      },
      timestamp: {
        string: [[null, ''],[new Date(Date.UTC(2015,8,15,17,22,42,432)), '2015-09-15 17:22:42.432']] ,
        number: [[null, NaN],[new Date(Date.UTC(2015,8,15,17,22,42,432)), Date.UTC(2015,8,15,17,22,42,432) ]] ,
        boolean: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),null]],
        date: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),new Date(Date.UTC(2015,8,15))]],
        datetime: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),new Date(Date.UTC(2015,8,15,17,22,42))]]
      },
      unknown:{
        string: [[null, ''],[new Date(Date.UTC(2015,8,15,17,22,42,432)), '2015-09-15 17:22:42.432']] ,
        number: [[null, NaN],[new Date(Date.UTC(2015,8,15,17,22,42,432)), Date.UTC(2015,8,15,17,22,42,432) ]] ,
        boolean: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),null]],
        date: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),new Date(Date.UTC(2015,8,15))]],
        datetime: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),new Date(Date.UTC(2015,8,15,17,22,42))]],
        timestamp: [[null,null],[new Date(Date.UTC(2015,8,15,17,22,42,432)),new Date(Date.UTC(2015,8,15,17,22,42,432))]]
      }
    };

    function test_coerceFromTo(tf,tt) {
      var input, result, expected, msg;
      var type_from = t_.types[tf];
      var type_to = t_.types[tt];
      var from_to = tf + '->' + type_to.name;
      for (var i in cases[tf][tt]) {
        var c = cases[tf][tt][i];
        input = c[0];
        result = type_to.coerce(input, type_from);
        expected = c[1];
        msg = from_to + ' input:'+input+' result:' + result + ' expected:' + expected;
        smartAssert(expected, result, msg);
      }
    }
    //test_coerceFromTo('unknown','boolean');
    for(var tf in  cases){
      for(var tt in cases[tf]) {
        test_coerceFromTo(tf,tt);
      }
    }
  });
  it('findTypeByValue',function(){
    function test_find(v, typeName) {
      expect(t_.findTypeByValue(v).name).toBe( typeName);
    }
    test_find(null, 'string');
    test_find(new Date(Date.UTC(2015,8,15,17,22,42,432)), 'timestamp');
    test_find(new Date(Date.UTC(2015,8,15,17,22,42)), 'datetime');
    test_find(new Date(Date.UTC(2015,8,15)), 'date');
    test_find('2015-09-15', 'string');
    test_find('ddll', 'string');
    test_find(NaN, 'number');
    test_find(false, 'boolean');
    test_find(undefined, 'string');
    test_find(3, 'number');
  });

});


