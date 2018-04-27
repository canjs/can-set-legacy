require("steal-qunit");
var QueryLogic = require("can-query-logic");

var set = require('../can-set-legacy');

var ignoreProp = function(){ return true; };

QUnit.module("can-set-legacy set.Translate - nested where");

QUnit.test('set.equal', function(){

	var algebra = new set.Algebra(
		new set.Translate("where","$where"),
        set.props.ignore("count")
	);

	var res;

	res = algebra.isEqual(
		{$where: {type: 'FOLDER' } },
		{$where: { type: 'FOLDER', count: 5 }}
	);
	ok(res, 'count ignored');

	res = algebra.isEqual(
		{$where: { type: 'FOLDER' }},
		{$where: { type: 'FOLDER' }}
	);

	ok(res, 'folder case ignored');

});


QUnit.test('set.isSubset', function(){

	var algebra = new set.Algebra(
		new set.Translate("where","$where"),
        set.props.ignore("foo"),
        set.props.ignore("bar"),
        set.props.ignore("kind"),
        set.props.ignore("count")
	);

	var res;

	res = algebra.isSubset({$where:{ type: 'FOLDER' }}, {$where:{ type: 'FOLDER' }});
	ok(res, 'equal sets');

	res = algebra.isSubset({$where:{ type: 'FOLDER', parentId: 5 }}, {$where:{ type: 'FOLDER' }});
	ok(res, 'sub set');

	res = algebra.isSubset({$where:{ type: 'FOLDER' }}, {$where:{ type: 'FOLDER', parentId: 5 }});
	ok(!res, 'wrong way');

	res = algebra.isSubset(
		{$where:{ type: 'FOLDER', parentId: 7 }},
		{$where:{ type: 'FOLDER', parentId: 5 }}
	);
	ok(!res, 'different values');

	res = algebra.isSubset(
		{$where:{ type: 'FOLDER', count: 5 }},
		{$where:{ type: 'FOLDER' }}
	);
	ok(res, 'count ignored');

	res = algebra.isSubset(
		{$where:{ type: 'FOLDER', category: 'tree' }},
		{$where:{ type: 'FOLDER', foo: true, bar: true }}
	);
	ok(res, 'understands a subset');

	res = algebra.isSubset(
		{$where:{ type: 'FOLDER', foo: true, bar: true }},
		{$where:{ type: 'FOLDER', kind: 'tree' }}
	);
	ok(res,	'ignores nulls');

});

test('set.isProperSubset', function(){
	var algebra = new set.Algebra(
		new set.Translate("where","$where")
	);

	equal( algebra.isProperSubset( {$where:{foo: "bar"}}, {$where:{}}), true );
	equal( algebra.isProperSubset({$where:{}},{$where:{}}), false );
	equal( algebra.isProperSubset({$where:{}},{$where:{foo: "bar"}}), false );
});


test('set.difference', function(){

	var algebra = new set.Algebra(
		new set.Translate("where","$where")
	);

	var res = algebra.difference({$where:{}}, {$where:{ completed: true }});
	equal(res, QueryLogic.UNDEFINABLE, "diff should be true");


	res = algebra.difference({$where:{ completed: true }}, {$where:{ completed: true }});
	equal(res, QueryLogic.EMPTY);

	res = algebra.difference({$where:{ completed: true }}, {$where:{}});
	equal(res,  QueryLogic.EMPTY);

	res = algebra.difference({$where:{ completed: true }}, {$where:{ userId: 5 }});
	equal(res, QueryLogic.UNDEFINABLE); // TODO: probably should be undefined

});



test('set.union', function(){

	var algebra = new set.Algebra( new set.Translate("where","$where") );

	// set / subset
	var res = algebra.union({$where:{}}, {$where:{ completed: true }});
	deepEqual(res , {}, "set / subset");

	res = algebra.union({$where:{ completed: true }}, {$where:{}});
	deepEqual(res , {}, "subset / set");

	res = algebra.union({$where:{foo: "bar"}},{$where:{foo: "bar"}});
	deepEqual(res, {$where:{foo: "bar"}}, "equal");

	res = algebra.union({$where:{foo: "bar"}},{$where:{foo: "zed"}});
	deepEqual(res, {$where:{foo: ["bar","zed"]}}, "values not equal");

	res = algebra.union({$where:{foo: "bar"}},{$where:{name: "A"}});
	deepEqual(res,set.UNDEFINABLE, "values not equal");
});

test('set.union Array', function(){
	var algebra = new set.Algebra( new set.Translate("where","$where") );

	// set / subset
	var res = algebra.union({$where:{foo: ["a","b"]}}, {$where:{ foo: ["a","c"] }});
	deepEqual(res , {$where:{foo: ["a","b","c"]}}, "set / subset");

});



test('set.intersection', function(){
	var algebra = new set.Algebra(
		new set.Translate("where","$where")), res;

	res = algebra.intersection({$where:{}}, {$where:{ completed: true }});
	deepEqual(res , {$where:{ completed: true }}, "set / subset");

	res = algebra.intersection({$where:{ completed: true }}, {$where:{}});
	deepEqual(res , {$where:{ completed: true }}, "subset / set");

	res = algebra.intersection({$where:{foo: "bar"}},{$where:{foo: "bar"}});
	deepEqual(res, {$where:{foo: "bar"}}, "equal");

	res = algebra.intersection({$where:{foo: "bar"}},{$where:{foo: "zed"}});
	deepEqual(res,QueryLogic.EMPTY,  "values not equal");

	res = algebra.intersection({$where:{foo: 'bar'}},{$where:{completed: true}});
	deepEqual(res, {$where:{foo: 'bar', completed: true}}, 'intersection should combine definitions');
});


test('set.intersection Array', function(){

	var algebra = new set.Algebra(
		new set.Translate("where","$where"));

	// set / subset
	var res = algebra.intersection({$where:{foo: ["a","b"]}}, {$where:{ foo: ["a","c"] }});
	deepEqual(res , {$where:{foo: "a"}}, "intersection");

});


test('set.has', function(){

	var algebra = new set.Algebra(
		new set.Translate("where","$where"),
        set.props.ignore("count"),
        set.props.ignore("foo"),
        set.props.ignore("bar"),
        set.props.ignore("kind")
	);

	ok( algebra.isMember({$where: {someId: 5}}, {someId: 5, name: "foo"}), 'contains');

	var res;

	res = algebra.isMember({$where:{ type: 'FOLDER' }}, { type: 'FOLDER' });
	ok(res, 'equal sets');

	res = algebra.isMember({$where:{ type: 'FOLDER', parentId: 5 }}, { type: 'FOLDER' });
	equal(res, false, 'doesnt match');

	res = algebra.isMember({$where:{ type: 'FOLDER' }}, { type: 'FOLDER', parentId: 5 });
	ok(true, 'is a subset');

	res = algebra.isMember(
		{$where:{ type: 'FOLDER', parentId: 7 }},
		{ type: 'FOLDER', parentId: 5 }
	);
	ok(!res, 'different values');

	res = algebra.isMember(
		{$where:{ type: 'FOLDER', count: 5 }},
		{ type: 'FOLDER' },
		{ count: ignoreProp }
	);
	ok(res, 'count ignored');

	res = algebra.isMember(
		{$where:{ type: 'FOLDER', kind: 'tree' }},
		{ type: 'FOLDER', foo: true, bar: true }
	);
	ok(res, 'understands a subset');

	res = algebra.isMember(
		{$where:{ type: 'FOLDER', foo: true, bar: true }},
		{ type: 'FOLDER', kind: 'tree' }
	);
	ok(res,	'ignores nulls');
});
