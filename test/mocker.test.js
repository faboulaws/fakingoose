const mongoose = require('mongoose');
const { expect } = require('chai');
const get = require('lodash.get');
const { unflatten } = require('flat');
const mocker = require('../');

const { Schema } = mongoose;

const allOfType = expectedType => array => array.every(item => (typeof item === expectedType));
const allInstanceOf = expectedType => array => array.every(item => (item instanceof expectedType));
const allOfWithProps = expectedProps => array =>
    array.every(item => Object.entries(expectedProps).every(([prop, expectedType]) => (typeof item[prop] === expectedType)));

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
    positiveNumber: {
        type: Number, min: [0, 'Too small'],
    },
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


if (mongoose.Types.Map) {
    Object.assign(schemaDef, {
        map: Map,
        mapOfString: {
            type: Map,
            of: String,
        },
    });
}
const schema = new Schema(schemaDef);

// example use

const Thing = mongoose.model('Thing', schema);

describe('mocker test', () => {
    it('must generate mock', () => {
        const thingMocker = mocker(Thing, {});
        const _mock = thingMocker.generate();
        const mock = new Thing(_mock);
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

        expect(mock.positiveNumber).to.be.a('number');
        expect(mock.age).to.be.above(0);

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

        if (mongoose.Types.Map) {
            // map
            expect(mock).to.have.property('map');
            expect(mock.map).to.be.an('Map');

            // map of string
            expect(mock).to.have.property('mapOfString');
            expect(mock.mapOfString).to.be.an('Map');
            mock.mapOfString.values((value) => {
                expect(value).to.be.a('string');
            });
        }
    });

    describe('generate(staticFields)', () => {
        const embed = new Schema({ name: String });
        const thingShema = new Schema({
            str: { type: String },
            nested: { name: String },
            doubleNested: {
                nested: { name: String },
            },
            embedded: embed,
            doubleEmbed: {
                nested: embed,
            },
            ofString: [String],
            ofObject: [{ name: String }],
            ofEmbedded: [embed],
        });

        const staticFields = {
            str: 'hello',
            nested: { name: 'nested' },
            doubleNested: {
                nested: { name: 'doubleNested' },
            },
            embedded: { name: 'embedded' },
            doubleEmbed: {
                nested: { name: 'doubleEmbed' },
            },
            ofString: ['ofString', 'ofSTring'],
            ofObject: [{ name: 'ofObject' }, { name: 'ofObject' }],
            ofEmbedded: [{ name: 'ofEmbedded' }, { name: 'ofEmbedded' }],
        };

        it('should use static value', () => {
            const thingMocker = mocker(thingShema);
            const mock = thingMocker.generate(staticFields);
            // expect(mock).to.deep.include(staticFields);
            const paths = [
                'str',
                'nested.name',
                'doubleNested.nested.name',
                'embedded.name',
                'doubleEmbed.nested.name',
                'ofString',
                'ofObject',
                'ofEmbedded',
            ];
            paths.forEach((path) => {
                expect(get(mock, path)).to.eql(get(staticFields, path));
            });
        });

    });

    describe('options.<propertyName>.value', () => {
        describe('value', () => {
            it('should use static value - at root', () => {
                const userSchema = new Schema({ firstName: String, username: String, lastName: String });
                const thingMocker = mocker(userSchema, { firstName: { value: 'blabla' } });
                const mock = thingMocker.generate();
                expect(mock.firstName).to.eql('blabla');
            });

            it('should use static value - at leaf - key as path', () => {
                const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
                const thingMocker = mocker(theShema, { 'root.levelOne.firstName': { value: 'blabla' } });
                const mock = thingMocker.generate();
                expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should use static value - at leaf - nested key', () => {
                const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
                const thingMocker = mocker(theShema, { root: { levelOne: { firstName: { value: 'blabla' } } } });
                const mock = thingMocker.generate();
                expect(mock.root.levelOne.firstName).to.eql('blabla');
            });
        });

        describe('value()', () => {
            it('should use value() function for property', () => {
                const userSchema = new Schema({ firstName: String, username: String, lastName: String });
                const thingMocker = mocker(userSchema, {
                    firstName: { value: () => 'John' },
                    username: {
                        value: (object) => `${object.firstName}.${object.lastName}`
                    }
                });
                const mock = thingMocker.generate({ lastName: 'Doe' });
                expect(mock.firstName).to.eql('John');
                expect(mock.username).to.eql('John.Doe');
            });

            it('should use value() function for property - nested property', () => {
                const theShema = new Schema({ user: { info: { firstName: String, username: String, lastName: String } } });
                const thingMocker = mocker(theShema, {
                    'user.info.firstName': { value: () => 'John' },
                    'user.info.username': {
                        value: (object) => `${object.user.info.firstName}.${object.user.info.lastName}`
                    }
                });
                const mock = thingMocker.generate({ user: { info: { lastName: 'Doe' } } });
                expect(mock.user.info.firstName).to.eql('John');
                expect(mock.user.info.username).to.eql('John.Doe');
            });
        });
    });

    describe('options.<propertyName>.skip', () => {
        describe('direct skip', () => {
            it('should skip property at root', () => {
                const stringShema = new Schema({ firstName: String, username: String, lastName: String });
                const thingMocker = mocker(stringShema, { username: { skip: true } });
                const mock = thingMocker.generate();
                expect(mock).not.to.have.property('username');
                expect(mock).to.have.property('firstName');
                expect(mock).to.have.property('lastName');
            });

            it('should skip nested property - key as path', () => {
                const theSchema = new Schema({ user: { firstName: String, lastName: String, username: String } });
                const options = { "user.username": { skip: true } }
                const thingMocker = mocker(theSchema, options);
                const mock = thingMocker.generate();
                expect(mock).to.have.property('user');
                expect(mock.user).to.have.property('firstName');
                expect(mock.user).to.have.property('lastName');
                expect(mock.user).not.to.have.property('username');
            });

            it('should skip nested property - key is nested', () => {
                const sschema = new Schema({ root: { name: String, nickname: String }, other: { name: String } });
                const options = { root: { name: { skip: true } } };
                const thingMocker = mocker(sschema, options);
                const mock = thingMocker.generate();
                expect(mock).to.have.property('root');
                expect(mock.root).to.have.property('nickname');
                expect(mock.root).not.to.have.property('name');
            });
        });

        describe('indirect skip (from parent)', () => {
            it('should skip a subtree - from root', () => {
                const sschema = new Schema({
                    root: { name: String, nickname: String },
                    other: { name: String }
                });
                const thingMocker = mocker(sschema, { root: { skip: true } });
                const mock = thingMocker.generate();
                expect(mock).not.to.have.property('root');
                expect(mock).to.have.property('other');
                expect(mock.other).to.have.property('name');
            });

            describe('nested property under root', () => {
                const sschema = new Schema({
                    root: {
                        levelOne: {
                            name: String,
                            nickname: String
                        },
                        level1: {
                            other: {
                                name: String
                            }
                        }
                    }
                });

                const directOptions = {
                    "root.level1": { skip: true },
                    "root.levelOne.name": { skip: true },
                }

                it('direct options\'s keys', () => {
                    const options = directOptions;
                    const thingMocker = mocker(sschema, options);
                    const mock = thingMocker.generate();
                    expect(mock, 'Must have root').to.have.property('root');
                    expect(mock.root, 'Root must have levelOne').to.have.property('levelOne');
                    expect(mock.root, 'Root must not have level1').not.to.have.property('level1');
                    expect(mock.root.levelOne).not.to.have.property('name');
                    expect(mock.root.levelOne).to.have.property('nickname');
                });

                it('nested options\'s keys', () => {
                    const options = unflatten(directOptions);
                    const thingMocker = mocker(sschema, options);
                    const mock = thingMocker.generate();
                    expect(mock, 'Must have root').to.have.property('root');
                    expect(mock.root, 'Root must have levelOne').to.have.property('levelOne');
                    expect(mock.root, 'Root must not have level1').not.to.have.property('level1');
                    expect(mock.root.levelOne).not.to.have.property('name');
                    expect(mock.root.levelOne).to.have.property('nickname');
                });
            });
        });
    });

    describe('options.<propertyName>.type', () => {
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
