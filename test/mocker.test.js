const mongoose = require('mongoose');
const { expect } = require('chai');
const mocker = require('../');

const { Schema } = mongoose;

const allOfType = expectedType => array => array.every(item => (typeof item === expectedType));
const allInstanceOf = expectedType => array => array.every(item => (item instanceof expectedType));
const allOfWithProps = expectedProps => array => array.every(item => Object.entries(expectedProps).every(([prop, expectedType]) => (typeof item[prop] === expectedType)));

/**
todo
+ schema default
+ options:
 - string: firstname, lastname, email
*/

const embedded = new Schema({ name: String, number: Number });

const schemaDef = {
    name: String,
    nameDef: { type: String },
    nameLower: { type: String, lowercase: true },
    title: { type: String, enum: ['Mr.', 'Mrs.', 'Dr.'] },
    binary: Buffer,
    living: Boolean,
    created: { type: Date },
    updated: { type: Date, default: Date.now },
    age: { type: Number, min: 18, max: 65 },
    mixed: Schema.Types.Mixed,
    _someId: Schema.Types.ObjectId,
    decimal: Schema.Types.Decimal128,
    array: [],
    ofString: [String],
    ofStringWithDef: [{ type: String }],
    ofNumber: [Number],
    ofDates: [Date],
    ofBuffer: [Buffer],
    ofBoolean: [Boolean],
    ofMixed: [Schema.Types.Mixed],
    ofObjectId: [Schema.Types.ObjectId],
    // ofArrays: [[]],
    // ofArrayOfNumbers: [[Number]],
    nested: {
        stuff: { type: String, lowercase: true, trim: true },
        count: Number,
    },

    embedded,
    ofEmbedded: [embedded],
};


if (mongoose.Types['Map']) {
    Object.assign(schemaDef, {
        map: Map,
        mapOfString: {
            type: Map,
            of: String
        },
    })
}
const schema = new Schema(schemaDef);

// example use

const Thing = mongoose.model('Thing', schema);

describe('mocker test', () => {
    it('must generate mock', () => {
        const thingMocker = mocker(Thing, {});
        const _mock = thingMocker.generate();
        const mock = new Thing(_mock);
        console.log(mock);
        // check string
        expect(mock).to.have.property('name');
        expect(typeof mock.name).to.eql('string');

        expect(mock).to.have.property('nameDef');
        expect(typeof mock.nameDef).to.eql('string');

        // lower case string check
        expect(mock).to.have.property('nameLower');
        expect(typeof mock.nameLower).to.eql('string');
        expect(mock.nameLower).to.eql(mock.nameLower.toLowerCase());

        // check string array
        expect(mock).to.have.property('ofString');
        expect(mock.ofString).to.be.a('array');
        expect(mock.ofString).to.have.lengthOf.above(1);

        expect(mock).to.have.property('ofStringWithDef');
        expect(mock.ofStringWithDef).to.be.a('array');
        expect(mock.ofStringWithDef).to.have.lengthOf.above(1);

        // check string enum
        expect(mock).to.have.property('title');
        expect(mock.title).to.be.a('string');
        expect(mock.title).to.be.oneOf(['Mr.', 'Mrs.', 'Dr.']);

        // check boolean
        expect(mock).to.have.property('living');
        expect(mock.living).to.be.a('boolean');
        expect(mock.living).to.be.oneOf([true, false]);

        expect(mock.ofBoolean).to.be.an('array');
        expect(mock.ofBoolean).to.have.lengthOf.above(1);
        expect(mock.ofBoolean).to.satisfy(allOfType('boolean'));

        // check numbers
        expect(mock.age).to.be.a('number');
        expect(mock.age).to.be.within(18, 65);

        // check numbers array
        expect(mock).to.have.property('ofNumber');
        expect(mock.ofNumber).to.be.an('array');
        expect(mock.ofNumber).to.satisfy(allOfType('number'));

        // nested object with string attribute
        expect(mock).to.have.property('nested');
        expect(mock.nested).to.have.property('stuff').that.is.a('string');
        expect(mock.nested).to.have.property('count').that.is.a('number');


        // embedded schema
        expect(mock).to.have.property('embedded');
        expect(mock.embedded).to.have.property('name').that.is.a('string');
        expect(mock.embedded).to.have.property('number').that.is.a('number');

        // array of embedded schema
        expect(mock).to.have.property('ofEmbedded');
        expect(mock.ofEmbedded).to.satisfy(allOfWithProps({ name: 'string', number: 'number' }));

        // date
        expect(mock).to.have.property('updated');
        expect(mock.updated).to.be.a('date');

        // check dates array
        expect(mock).to.have.property('ofDates');
        expect(mock.ofDates).to.be.an('array');
        expect(mock.ofDates, 'Must contain dates').to.satisfy(allInstanceOf(Date));

        // decimal
        expect(mock).to.have.property('decimal');
        expect(mock.decimal.constructor.name).to.eql('Decimal128');

        // buffer
        expect(mock).to.have.property('binary');
        expect(mock.binary).to.be.an.instanceof(Buffer);

        // check buffer array
        expect(mock).to.have.property('ofBuffer');
        expect(mock.ofBuffer).to.be.an('array');
        expect(mock.ofBuffer, 'Must contain buffer').to.satisfy(allInstanceOf(Buffer));

        // mixed
        expect(mock).to.have.property('mixed');

        // check mixed array
        expect(mock).to.have.property('ofMixed');
        expect(mock.ofMixed).to.be.an('array');
        expect(mock.ofMixed).to.have.lengthOf.above(1);

        if (mongoose.Types['Map']) {
            // map
            expect(mock).to.have.property('map');
            expect(mock.map).to.be.an('Map');

            // map of string
            expect(mock).to.have.property('mapOfString');
            expect(mock.mapOfString).to.be.an('Map');
            mock.mapOfString.values(value => {
                expect(value).to.be.a('string');
            });
        }

    });

    describe('static values', () => {
        const stringShema = new Schema({ str: String });
        const StringThing = mongoose.model('SomeThing', stringShema);

        it('should use static value', () => {
            const thingMocker = mocker(StringThing);
            const mock = thingMocker.generate({ str: 'hello' });
            expect(mock.str).to.eql('hello');
        });
    });

    it('defaul values', () => {
        const stringShema = new Schema({ str: { type: String, default: 'hello' } });
        const StringThing = mongoose.model('NiceThing', stringShema);

        const thingMocker = mocker(StringThing);

        const mock = thingMocker.generate();
        const thing = new StringThing(mock);
        expect(thing.str).to.eql('hello');
    });

    describe('value overrides via options', () => {
        const stringShema = new Schema({ str: String });
        const StringThing = mongoose.model('StrThing', stringShema);

        it('should use static value', () => {
            const thingMocker = mocker(StringThing, { str: { value: 'blabla' } });
            const mock = thingMocker.generate();
            expect(mock.str).to.eql('blabla');
        });

        it('should use function value', () => {
            const thingMocker = mocker(StringThing, { str: { value: () => 'blabla' } });
            const mock = thingMocker.generate();
            expect(mock.str).to.eql('blabla');
        });

        it('skip value', () => {
            const thingMocker = mocker(StringThing, { str: { skip: true } });
            const mock = thingMocker.generate();
            console.log(mock);
            expect(mock).not.to.have.property('str');
        });
    });

    describe('options', () => {
        describe('string', () => {
            const stringShema = new Schema({ str: String });
            const StringThing = mongoose.model('StringThing', stringShema);

            it('email', () => {
                const thingMocker = mocker(StringThing, { str: { type: 'email' } });
                const mock = thingMocker.generate();
                expect(mock.str).to.match(/[\w]+\@[\w]+.[\w]+/);
            });
        });
    });
});
