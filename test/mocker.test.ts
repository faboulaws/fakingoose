import * as get from 'lodash.get';
import { unflatten } from 'flat';

import * as mongoose from 'mongoose';

import { factory as mocker, Mocker } from '../lib/mocker';
import { SchemaDefinition, Schema, Types } from 'mongoose';

const allOfType = (expectedType) => (array) => array.every((item) => typeof item === expectedType);
const allInstanceOf = (expectedType) => (array) => array.every((item) => item instanceof expectedType);
const allOfWithProps = (expectedProps) => (array) =>
    array.every((item) =>
        Object.entries(expectedProps).every(([prop, expectedType]) => typeof item[prop] === expectedType),
    );

describe('mocker test', () => {
    const embedded = new Schema({ name: String, number: Number });

    interface ISomeThing {
      name: string;
      nameDef: string;
      nameLower: string;
      title: 'Mr.' | 'Mrs.' | 'Dr.';
      binary: Buffer;
      living: boolean;
      created: Date;
      updated: Date;
      dateMinMax: Date;
      dateMin: Date;
      dateMax: Date;
      age: number;
      mixed: any;
      _someId: Schema.Types.ObjectId;
      decimal: number;
      array: [];
      ofString: string[];
      ofStringWithDef: string[];
      ofNumber: number[];
      positiveNumber: number;
      ofDates: Date[];
      ofBuffer: Buffer[];
      ofBoolean: boolean[];
      ofMixed: any[];
      ofObjectId: Schema.Types.ObjectId[];
      // ofArrays: [[]],
      // ofArrayOfNumbers: [[Number]],
      nested: {
          stuff: string;
          count: number;
      };
      percent: number;

      embedded: { name: string; number: number };
      ofEmbedded: { name: string; number: number }[];
  }
    const schemaDef: SchemaDefinition<ISomeThing> = {
        name: String,
        nameDef: { type: String },
        nameLower: { type: String, lowercase: true },
        title: { type: String, enum: ['Mr.', 'Mrs.', 'Dr.'] },
        binary: Buffer,
        living: Boolean,
        created: { type: Date },
        updated: { type: Date, default: new Date() },//@ts-ignore
        dateMinMax: { type: Date, min: '2020-12-15', max: '2021-12-30' }, //@ts-ignore
        dateMin: { type: Date, min: '2020-12-15' },//@ts-ignore
        dateMax: { type: Date, max: '2021-12-30' },
        age: { type: Number, min: 18, max: 65 },
        mixed: Schema.Types.Mixed,
        _someId: Schema.Types.ObjectId,
        decimal: Schema.Types.Decimal128,
        array: [],
        ofString: [String],
        ofStringWithDef: [{ type: String }],
        ofNumber: [Number],
        positiveNumber: {
            type: Number,
            min: [0, 'Too small'],
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
        percent: { type: Number, min: 0, max: 100 },

        embedded,
        ofEmbedded: [embedded],
    };

    const schema = new Schema<ISomeThing>(schemaDef);

    // example use

    const Thing = mongoose.model('Thing', schema);

    describe(`mongoose`, () => {
        it('must generate mock', () => {
            const thingMocker = mocker(Thing, {});
            const _mock = thingMocker.generate();
            const mock = new Thing(_mock);
            // check string
            expect(mock).toHaveProperty('name');
            expect(typeof mock.name).toEqual('string');

            expect(mock).toHaveProperty('nameDef');
            expect(typeof mock.nameDef).toEqual('string');

            // lower case string check
            expect(mock).toHaveProperty('nameLower');
            expect(typeof mock.nameLower).toEqual('string');
            expect(mock.nameLower).toEqual(mock.nameLower.toLowerCase());

            // check string array
            expect(mock).toHaveProperty('ofString');
            expect(mock.ofString).toBeInstanceOf(Array);
            expect(mock.ofString.length).toBeGreaterThan(1);

            expect(mock).toHaveProperty('ofStringWithDef');
            expect(mock.ofStringWithDef).toBeInstanceOf(Array);
            expect(mock.ofStringWithDef.length).toBeGreaterThan(1);

            // check string enum
            expect(mock).toHaveProperty('title');
            expect(mock.title).toBeString();
            expect(mock.title).toBeOneOf(['Mr.', 'Mrs.', 'Dr.']);

            // check boolean
            expect(mock).toHaveProperty('living');
            expect(mock.living).toBeBoolean();
            expect(mock.living).toBeOneOf([true, false]);

            expect(mock.ofBoolean).toBeInstanceOf(Array);
            expect(mock.ofBoolean.length).toBeGreaterThan(1);
            expect(mock.ofBoolean).toSatisfy(allOfType('boolean'));

            // check numbers
            expect(mock.age).toBeNumber();
            expect(mock.age).toBeGreaterThanOrEqual(18);
            expect(mock.age).toBeLessThanOrEqual(65);

            expect(mock.percent).toBeNumber();
            expect(mock.percent).toBeGreaterThanOrEqual(0);
            expect(mock.percent).toBeLessThanOrEqual(100);

            expect(mock.positiveNumber).toBeNumber();
            expect(mock.age).toBeGreaterThan(0);

            // check numbers array
            expect(mock).toHaveProperty('ofNumber');
            expect(mock.ofNumber).toBeInstanceOf(Array);
            expect(mock.ofNumber).toSatisfy(allOfType('number'));

            // nested object with string attribute
            expect(mock).toHaveProperty('nested');
            expect(mock.nested).toHaveProperty('stuff');
            expect(typeof mock.nested.stuff).toEqual('string');
            expect(mock.nested).toHaveProperty('count');
            expect(typeof mock.nested.count).toEqual('number');

            // embedded schema
            expect(mock).toHaveProperty('embedded');
            expect(mock.embedded).toHaveProperty('name');
            expect(typeof mock.embedded.name).toEqual('string');
            expect(mock.embedded).toHaveProperty('number');
            expect(typeof mock.embedded.number).toEqual('number');

            // array of embedded schema
            expect(mock).toHaveProperty('ofEmbedded');
            expect(mock.ofEmbedded).toSatisfy(allOfWithProps({ name: 'string', number: 'number' }));

            // date
            expect(mock).toHaveProperty('updated');
            expect(mock.updated).toBeInstanceOf(Date);

            // date - validation
            const minDate = new Date('2020-12-15').getTime();
            const maxDate = new Date('2021-12-30').getTime();
            expect(mock.dateMinMax.getTime()).toBeGreaterThan(minDate - 1);
            expect(mock.dateMinMax.getTime()).toBeLessThan(maxDate + 1);

            expect(mock.dateMin.getTime()).toBeGreaterThan(minDate - 1);

            expect(mock.dateMax.getTime()).toBeLessThan(maxDate + 1);

            // check dates array
            expect(mock).toHaveProperty('ofDates');
            expect(mock.ofDates).toBeInstanceOf(Array);
            expect(mock.ofDates).toSatisfy(allInstanceOf(Date)); //, 'Must contain dates'

            // decimal
            expect(mock).toHaveProperty('decimal');
            expect(mock.decimal.constructor.name).toEqual('Decimal128');

            // buffer
            expect(mock).toHaveProperty('binary');
            expect(mock.binary).toBeInstanceOf(Buffer);

            // check buffer array
            expect(mock).toHaveProperty('ofBuffer');
            expect(mock.ofBuffer).toBeInstanceOf(Array);
            expect(mock.ofBuffer).toSatisfy(allInstanceOf(Buffer)); //, 'Must contain buffer'

            // mixed
            expect(mock).toHaveProperty('mixed');

            // check mixed array
            expect(mock).toHaveProperty('ofMixed');
            expect(mock.ofMixed).toBeInstanceOf(Array);
            expect(mock.ofMixed.length).toBeGreaterThan(1);
        });

        if (mongoose.Types.Map) {
            it('most generate mock for map', () => {
                const mapSchema = {
                    map: Map,
                    mapOfString: {
                        type: Map,
                        of: String,
                    },
                    mapOfSchema: {
                        type: Map,
                        of: new Schema({
                            name: String,
                        }),
                    },
                };

                const MapModel = mongoose.model('MapModel', mapSchema as unknown as mongoose.Schema);
                const thingMocker = new Mocker(MapModel, {});
                const _mock = thingMocker.generate();
                const mock = <any>new MapModel(_mock);

                // map
                expect(mock).toHaveProperty('map');
                expect(mock.map).toBeInstanceOf(Map);

                // map of string
                expect(mock).toHaveProperty('mapOfString');
                expect(mock.mapOfString).toBeInstanceOf(Map);

                for (const value of mock.mapOfString.values()) {
                    expect(value).toBeString();
                }

                // map of embedded Schema
                expect(mock).toHaveProperty('mapOfSchema');
                expect(mock.mapOfSchema).toBeInstanceOf(Map);
                for (const value of mock.mapOfSchema.values()) {
                    expect(value).toBeInstanceOf(Object);
                }
            });
        }

        describe('string', () => {
            it('string at any level must work', () => {
                interface Isch {
                    arrayOfStringsWithEnum: ('string1' | 'string2')[];
                    arrayOfStrings: string[];
                    arrayOfStrings2: string[];
                }
                const sch = <mongoose.Schema>(<unknown>{
                    arrayOfStringsWithEnum: [{ type: String, enum: ['string1', 'string2'] }],
                    arrayOfStrings: [String],
                    arrayOfStrings2: [{ type: String }],
                });

                const Entity = mongoose.model<Isch>('Entity', sch);
                const entityMocker = mocker(Entity, {});
                const data = entityMocker.generate();

                data.arrayOfStringsWithEnum.forEach((value) => {
                    expect(['string1', 'string2']).toContain(value);
                });
                data.arrayOfStrings.forEach((value) => {
                    expect(typeof value).toEqual('string');
                });
                data.arrayOfStrings2.forEach((value) => {
                    expect(typeof value).toEqual('string');
                });
            });
        });

        describe('ObjectId', () => {
            const schema = new Schema({
                id: Schema.Types.ObjectId,
                arrayOfIds: [{ type: Schema.Types.ObjectId }],
                nestedObjectId: { nestedId: Schema.Types.ObjectId },
            });

            const expectTypeOf = (type, mockObject) => {
                // root level
                expect(mockObject).toHaveProperty('id');
                expect(typeof mockObject.id).toBe(type);

                // array
                expect(mockObject).toHaveProperty('arrayOfIds');
                expect(mockObject.arrayOfIds).toBeInstanceOf(Array);
                mockObject.arrayOfIds.forEach((value) => {
                    expect(typeof value).toEqual(type);
                });

                // nested
                expect(mockObject).toHaveProperty('nestedObjectId');
                expect(mockObject.nestedObjectId).toHaveProperty('nestedId');
                expect(typeof mockObject.nestedObjectId.nestedId).toBe(type);
            };

            it('must generate a string value of objectId', () => {
                const factory = mocker(schema, {});
                const mockObject = factory.generate();
                expectTypeOf('string', mockObject);
            });

            it('must generate an objectId', () => {
                const factory = mocker(schema, {
                    _id: { tostring: false },
                    id: { tostring: false },
                    arrayOfIds: { tostring: false },
                    'nestedObjectId.nestedId': { tostring: false },
                });
                const mockObject = factory.generate();
                expectTypeOf('object', mockObject);
            });

            it('must generate an objectId - global config', () => {
                const factory = mocker(schema).setGlobalObjectIdOptions({ tostring: false });
                const mockObject = factory.generate();
                expectTypeOf('object', mockObject);
            });
        });

        describe('decimal', () => {
            const schema = new Schema({
                myDecimal: Schema.Types.Decimal128,
                arrayOfDecimals: [{ type: Schema.Types.Decimal128 }],
                nestedDecimals: { nestedValue: Schema.Types.Decimal128 },
            });

            function expectTypeOf(type, mockObject) {
                // root level
                expect(mockObject).toHaveProperty('myDecimal');
                expect(typeof mockObject.myDecimal).toBe(type);

                // array
                expect(mockObject).toHaveProperty('arrayOfDecimals');
                expect(mockObject.arrayOfDecimals).toBeInstanceOf(Array);
                mockObject.arrayOfDecimals.forEach((value) => {
                    expect(typeof value).toEqual(type);
                });

                // nested
                expect(mockObject).toHaveProperty('nestedDecimals');
                expect(mockObject.nestedDecimals).toHaveProperty('nestedValue');
                expect(typeof mockObject.nestedDecimals.nestedValue).toBe(type);
            }

            it('must generate a string value of decimal128', () => {
                const factory = mocker(schema, {});
                const mockObject = factory.generate();

                expectTypeOf('string', mockObject);
            });

            it('must generate a number', () => {
                const factory = mocker(schema, {
                    myDecimal: { tostring: false },
                    arrayOfDecimals: { tostring: false },
                    'nestedDecimals.nestedValue': { tostring: false },
                });
                const mockObject = factory.generate();
                expectTypeOf('number', mockObject);
            });

            it('must generate a number - global', () => {
                const factory = mocker(schema).setGlobalDecimal128Options({ tostring: false });
                const mockObject = factory.generate();
                expectTypeOf('number', mockObject);
            });
        });

        describe('number', () => {
            interface IEntity {
                myNumber: 0 | 1 | 2;
                arrayOfNumbers: (0 | 1 | 2)[];
                nestedNumbers: {
                    nestedValue: (0 | 1 | 2)[];
                };
            }
            const schema = new Schema<IEntity>({
                myNumber: { type: Schema.Types.Number, enum: [0, 1, 2] },
                arrayOfNumbers: [{ type: Schema.Types.Number, enum: [0, 1, 2] }],
                nestedNumbers: { nestedValue: { type: Schema.Types.Number, enum: [0, 1, 2] } },
            });

            it('must generate a number using enum', () => {
                const factory = mocker(schema);
                const mockObject = factory.generate();
                expect([0, 1, 2]).toContain(mockObject.myNumber);
                mockObject.arrayOfNumbers.forEach(num => expect([0, 1, 2]).toContain(num))
                expect([0, 1, 2]).toContain(mockObject.nestedNumbers.nestedValue);
            });

            //todo
            it.skip('must generate a number using enum - 2', () => {
                enum TicketStatus {
                    CLOSED = 0,
                    OPEN = 1
                  }
                  const mschema = new Schema(
                    {
                      status: {
                        type: Number,
                        default: TicketStatus.OPEN,
                        enum: TicketStatus
                      },
                    
                  });
                const factory = mocker(mschema);
                const mockObject = factory.generate();
                expect([0, 1]).toContain(mockObject.status);
            });
        });

        describe('generate(staticFields)', () => {
            const embed = new Schema({ name: String });
            const thingSchemaDef = {
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
            };
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

            const thingShema = new Schema(thingSchemaDef);

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
                    expect(get(mock, path)).toEqual(get(staticFields, path));
                });
            });

            it('allow static values as object', () => {
                const options = {
                    location: { value: { internal: { type: 'Point', coordinates: [1, 1] } } },
                };
                interface IEntity {
                  location: Record<string, unknown>
                }

                const Example = new Schema<IEntity>({ location: Object });

                const exampleFactory = mocker(Example, options).setGlobalObjectIdOptions({ tostring: false });

                const mock1 = exampleFactory.generate({ _id: new Types.ObjectId() });
                const location = { internal: { type: 'Point', coordinates: [3, 3] } };
                const mock2 = exampleFactory.generate({
                    _id: new Types.ObjectId(),
                    location,
                });
                expect(mock1.location).toEqual(options.location.value);
                expect(mock2.location).toEqual(location);
            });

            if (mongoose.Types.Map) {
                it('should use static value for map', () => {
                    const schemaDef = {
                        map: Map,
                        mapOfString: {
                            type: Map,
                            of: String,
                        },
                        mapOfSchema: {
                            type: Map,
                            of: new Schema({
                                name: String,
                            }),
                        },
                    };

                    const staticFields = {
                        mapOfString: { key: 'mapOfString' },
                        mapOfSchema: { key: { name: 'mapOfSchema' } },
                    };
                    const thingShema = new Schema(schemaDef);
                    const thingMocker = mocker(thingShema);
                    const mock = thingMocker.generate(staticFields);
                    const paths = ['mapOfString', 'mapOfSchema'];
                    paths.forEach((path) => {
                        expect(get(mock, path)).toEqual(get(staticFields, path));
                    });
                });
            }
        });

        describe('options.<propertyName>.value', () => {
          interface IUserInfo {
            firstName: string;
            username: string;
            lastName: string;
        }
            describe('value', () => {
                it('should use static value - at root', () => {
                 
                    const userSchema = new Schema<IUserInfo>({
                        firstName: String,
                        username: String,
                        lastName: String,
                    });
                    const thingMocker = mocker(userSchema, { firstName: { value: 'blabla' } });
                    const mock = thingMocker.generate();
                    expect(mock.firstName).toEqual('blabla');
                });

                it('should use static value - at leaf - key as path', () => {
                    interface IEntity {
                        root: { levelOne: IUserInfo };
                    }
                    const theShema = new Schema<IEntity>({
                        root: { levelOne: { firstName: String, username: String, lastName: String } },
                    });
                    const thingMocker = mocker(theShema, { 'root.levelOne.firstName': { value: 'blabla' } });
                    const mock = thingMocker.generate();
                    expect(mock.root.levelOne.firstName).toEqual('blabla');
                });

                it('should use static value - at leaf - nested key', () => {
                  interface IEntity {
                    root: { levelOne: IUserInfo}
                  }
                    const theShema = new Schema<IEntity>({
                        root: { levelOne: { firstName: String, username: String, lastName: String } },
                    });
                    const thingMocker = mocker(theShema, {
                        root: { levelOne: { firstName: { value: 'blabla' } } },
                    });
                    const mock = thingMocker.generate();
                    expect(mock.root.levelOne.firstName).toEqual('blabla');
                });

                describe('root level property', () => {
                    
                    it('should allow using value from parent property - root key', () => {
                        interface IEntity {
                            root: { levelOne: IUserInfo };
                        }
                        const theShema = new Schema<IEntity>({
                            root: { levelOne: { firstName: String, username: String, lastName: String } },
                        });
                        const thingMocker = mocker(theShema, {
                            root: { value: { levelOne: { firstName: 'blabla' } } },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne.firstName).toEqual('blabla');
                    });

                    it('should allow using value from parent property - sub level(levelOne) - nested option key', () => {
                        interface IEntity {
                            root: { levelOne: IUserInfo };
                        }
                        const theShema = new Schema<IEntity>({
                            root: { levelOne: { firstName: String, username: String, lastName: String } },
                        });
                        const thingMocker = mocker(theShema, {
                            root: { levelOne: { value: { firstName: 'blabla' } } },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne.firstName).toEqual('blabla');
                    });

                    it('should allow using value from parent property - sub level(levelOne) - path option key(root.levelOne)', () => {
                        interface IEntity {
                            root: { levelOne: IUserInfo };
                        }
                        const theShema = new Schema<IEntity>({
                            root: { levelOne: { firstName: String, username: String, lastName: String } },
                        });
                        const thingMocker = mocker(theShema, {
                            'root.levelOne': { value: { firstName: 'blabla' } },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne.firstName).toEqual('blabla');
                    });

                    it('should allow using value from parent property - root key - Array values', () => {
                        interface IEntity {
                            root: { levelOne: { fitstName: string }[] };
                        }
                        const theShema = new Schema<IEntity>({
                            root: { levelOne: [new Schema({ fitstName: String })] },
                        });
                        const thingMocker = mocker(theShema, {
                            root: { value: { levelOne: [{ firstName: 'blabla' }] } },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne).toEqual([{ firstName: 'blabla' }]);
                    });
                });
            });

            describe('value()', () => {
                interface IUser {
                    user: { info: IUserInfo };
                }

                interface IUserInfo {
                    firstName: string;
                    username: string;
                    lastName: string;
                }

                it('should use value() function for property', () => {
                    const userSchema = new Schema<IUserInfo>({
                        firstName: String,
                        username: String,
                        lastName: String,
                    });
                    const thingMocker = mocker(userSchema, {
                        firstName: { value: () => 'John' },
                        username: {
                            value: (object) => `${object.firstName}.${object.lastName}`,
                        },
                    });
                    const mock = thingMocker.generate({ lastName: 'Doe' });
                    expect(mock.firstName).toEqual('John');
                    expect(mock.username).toEqual('John.Doe');
                });

                it('should use value() function for property - nested property', () => {
                    const theShema = new Schema<IUser>({
                        user: { info: { firstName: String, username: String, lastName: String } },
                    });
                    const thingMocker = mocker(theShema, {
                        'user.info.firstName': { value: () => 'John' },
                        'user.info.username': {
                            value: (object) => `${object.user.info.firstName}.${object.user.info.lastName}`,
                        },
                    });
                    const mock = thingMocker.generate({ user: { info: { lastName: 'Doe' } } });
                    expect(mock.user.info.firstName).toEqual('John');
                    expect(mock.user.info.username).toEqual('John.Doe');
                });

                it('should use value() function for property - nested property - nested option key', () => {
                    const theShema = new Schema<IUser>({
                        user: { info: { firstName: String, username: String, lastName: String } },
                    });
                    const thingMocker = mocker(
                        theShema,
                        unflatten({
                            'user.info.firstName': { value: () => 'John' },
                            'user.info.username': {
                                value: (object) => `${object.user.info.firstName}.${object.user.info.lastName}`,
                            },
                        }),
                    );
                    const mock = thingMocker.generate({ user: { info: { lastName: 'Doe' } } });
                    expect(mock.user.info.firstName).toEqual('John');
                    expect(mock.user.info.username).toEqual('John.Doe');
                });

                describe('root level property', () => {
                    interface IUserInfo {
                        firstName: string;
                        username: string;
                        lastName: string;
                    }
                    it('should allow using value from parent property - root key', () => {
                        interface IEntity {
                            root: { levelOne: IUserInfo };
                        }
                        const theShema = new Schema<IEntity>({
                            root: { levelOne: { firstName: String, username: String, lastName: String } },
                        });
                        const thingMocker = mocker(theShema, {
                            root: { value: () => ({ levelOne: { firstName: 'blabla' } }) },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne.firstName).toEqual('blabla');
                    });

                    it('should allow using value from parent property - sub level(levelOne) - nested option key', () => {
                        interface ISchema {
                            root: { levelOne: IUserInfo };
                        }
                        const theShema = new Schema<ISchema>({
                            root: { levelOne: { firstName: String, username: String, lastName: String } },
                        });
                        const thingMocker = mocker(theShema, {
                            root: { levelOne: { value: () => ({ firstName: 'blabla' }) } },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne.firstName).toEqual('blabla');
                    });

                    it('should allow using value from parent property - sub level(levelOne) - path option key(root.levelOne)', () => {
                        interface ITHeShemc {
                            root: {
                                levelOne: IUserInfo;
                            };
                        }

                        const theShema = new Schema<ITHeShemc>({
                            root: { levelOne: { firstName: String, username: String, lastName: String } },
                        });
                        const thingMocker = mocker(theShema, {
                            'root.levelOne': { value: () => ({ firstName: 'blabla' }) },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne.firstName).toEqual('blabla');
                    });

                    it('should allow using value from parent property - root key - Array values', () => {
                        interface ITheSchema {
                            root: { levelOne: IUserWithFirstName[] };
                        }

                        interface IUserWithFirstName {
                            root: { levelOne: { fitstName: string }[] };
                        }

                        const theShema = new Schema<ITheSchema>({
                            root: { levelOne: [new Schema({ fitstName: String })] },
                        });
                        const thingMocker = mocker(theShema, {
                            root: { value: () => ({ levelOne: [{ firstName: 'blabla' }] }) },
                        });
                        const mock = thingMocker.generate();
                        expect(mock.root.levelOne).toEqual([{ firstName: 'blabla' }]);
                    });
                });
            });
        });

        describe('options.<propertyName>.skip', () => {
            describe('direct skip', () => {
                it('should skip property at root', () => {
                    const stringShema = new Schema({ firstName: String, username: String, lastName: String });
                    const thingMocker = mocker(stringShema, { username: { skip: true } });
                    const mock = thingMocker.generate();
                    expect(mock).not.toHaveProperty('username');
                    expect(mock).toHaveProperty('firstName');
                    expect(mock).toHaveProperty('lastName');
                });

                it('should skip nested property - key as path', () => {
                    interface IUser {
                        user: { firstName: string; lastName: string; username: string };
                    }
                    const theSchema = new Schema<IUser>({
                        user: { firstName: String, lastName: String, username: String },
                    });
                    const options = { 'user.username': { skip: true } };
                    const thingMocker = mocker(theSchema, options);
                    const mock = thingMocker.generate();
                    expect(mock).toHaveProperty('user');
                    expect(mock.user).toHaveProperty('firstName');
                    expect(mock.user).toHaveProperty('lastName');
                    expect(mock.user).not.toHaveProperty('username');
                });

                it('should skip nested property - key is nested', () => {
                    interface SomeEntity {
                        root: { name: string; nickname: string };
                        other: { name: string };
                    }
                    const sschema = new Schema<SomeEntity>({
                        root: { name: String, nickname: String },
                        other: { name: String },
                    });
                    const options = { root: { name: { skip: true } } };
                    const thingMocker = mocker(sschema, options);
                    const mock = thingMocker.generate();
                    expect(mock).toHaveProperty('root');
                    expect(mock.root).toHaveProperty('nickname');
                    expect(mock.root).not.toHaveProperty('name');
                });

                it('should skip property of object inside an array', () => {
                    interface ISchema {
                        information: { updated: Date; title: string; content: string }[];
                    }
                    const schema = new Schema<ISchema>({
                        information: [
                            {
                                updated: { type: Date, default: Date.now },
                                title: String,
                                content: String,
                            },
                        ],
                    });

                    const options = {
                        information: {
                            updated: {
                                skip: true,
                            },
                        },
                    };

                    const myFactory = mocker(schema, options);

                    const mock = myFactory.generate();
                    mock.information.forEach((info) => {
                        expect(info).not.toHaveProperty('updated');
                    });
                });
            });

            describe('indirect skip (from parent)', () => {
                it('should skip a subtree - from root', () => {
                    interface SSChema {
                        root: { name: string; nickname: string };
                        other: { name: string };
                    }

                    const sschema = new Schema<SSChema>({
                        root: { name: String, nickname: String },
                        other: { name: String },
                    });
                    const thingMocker = mocker(sschema, { root: { skip: true } });
                    const mock = thingMocker.generate();
                    expect(mock).not.toHaveProperty('root');
                    expect(mock).toHaveProperty('other');
                    expect(mock.other).toHaveProperty('name');
                });

                describe('nested property under root', () => {
                    interface ISchema {
                        root: {
                            levelOne: {
                                name: string;
                                nickname: string;
                            };
                            level1: {
                                other: {
                                    name: string;
                                };
                            };
                        };
                    }

                    const sschema = new Schema<ISchema>({
                        root: {
                            levelOne: {
                                name: String,
                                nickname: String,
                            },
                            level1: {
                                other: {
                                    name: String,
                                },
                            },
                        },
                    });

                    const directOptions = {
                        'root.level1': { skip: true },
                        'root.levelOne.name': { skip: true },
                    };

                    it('direct options keys', () => {
                        const options = directOptions;
                        const thingMocker = mocker(sschema, options);
                        const mock = thingMocker.generate();
                        expect(mock).toHaveProperty('root'); //, 'Must have root'
                        expect(mock.root).toHaveProperty('levelOne'); //, 'Root must have levelOne'
                        expect(mock.root).not.toHaveProperty('level1'); //, 'Root must not have level1'
                        expect(mock.root.levelOne).not.toHaveProperty('name');
                        expect(mock.root.levelOne).toHaveProperty('nickname');
                    });

                    it('nested options keys', () => {
                        const options = unflatten(directOptions);
                        const thingMocker = mocker(sschema, options);
                        const mock = thingMocker.generate();
                        expect(mock).toHaveProperty('root'); //, 'Must have root'
                        expect(mock.root).toHaveProperty('levelOne'); //, 'Root must have levelOne'
                        expect(mock.root).not.toHaveProperty('level1'); //, 'Root must not have level1'
                        expect(mock.root.levelOne).not.toHaveProperty('name');
                        expect(mock.root.levelOne).toHaveProperty('nickname');
                    });
                });
            });
        });

        describe('options.<propertyName>.type', () => {
            describe('string', () => {
                interface IStringThing {
                    str: string;
                }

                const stringShema = new Schema({ str: String });
                const StringThing = mongoose.model<IStringThing>('StringThing', stringShema);

                it('email', () => {
                    const thingMocker = mocker(StringThing, { str: { type: 'email' } });
                    const mock = thingMocker.generate();
                    expect(mock.str).toMatch(/[\w]+@[\w]+.[\w]+/);
                });
            });
        });

        describe('options.<propertyName>.size', () => {
            describe('array', () => {
                interface IThing {
                    arr: string[];
                }
                const arraySchema = new Schema<IThing>({ arr: [String] });
                const ArrayThing = mongoose.model<IThing>('ArrayThing', arraySchema);

                it('default size', () => {
                    const thingMocker = mocker(arraySchema);
                    const mock = thingMocker.generate();
                    expect(mock.arr).toHaveLength(2);
                });

                it('custom size', () => {
                    const thingMocker = mocker(ArrayThing, { arr: { size: 10 } });
                    const mock = thingMocker.generate();
                    expect(mock.arr).toHaveLength(10);
                });
            });
        });

        describe('generate() override options', () => {
            it('must use the correct factory options', () => {
                const schema = new Schema({
                    updated: { type: Date, default: Date.now },
                    title: String,
                    content: String,
                });
                const options = {
                    updated: {
                        skip: true,
                    },
                };

                const myFactory = mocker(schema, options);
                const mock1 = myFactory.generate({});
                expect(mock1).not.toHaveProperty('updated');
                expect(mock1).toHaveProperty('title');

                const mock2 = myFactory.generate({}, { title: { skip: true } });
                expect(mock2).toHaveProperty('updated');
                expect(mock2).not.toHaveProperty('title');
            });
        });

        describe('options.populate', () => {
            it('options.populateWithSchema', () => {
                interface Activity {
                    name: string;
                    value: string;
                }

                const activitySchema = new mongoose.Schema({
                    name: String,
                    value: String,
                });

                interface UserActivity {
                    email: string;
                    name: string;
                    activities: Activity[];
                }

                const schema = new mongoose.Schema<UserActivity>({
                    email: String,
                    name: {
                        type: String,
                    },
                    activities: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'activity',
                        },
                    ],
                });

                const myFactory = mocker(schema, { activities: { populateWithSchema: activitySchema } });
                const mock = myFactory.generate();
                mock.activities.forEach((activity) => {
                    expect(activity).toHaveProperty('name');
                    expect(activity).toHaveProperty('value');
                });
            });

            it('options.populateWithFactory', () => {
                interface Activity {
                    name: string;
                    value: string;
                }

                const activitySchema = new mongoose.Schema<Activity>({
                    name: String,
                    value: String,
                });

                interface UserActivity {
                    email: string;
                    name: string;
                    activities: Activity[];
                }

                const schema = new mongoose.Schema<UserActivity>({
                    email: String,
                    name: {
                        type: String,
                    },
                    activities: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'activity',
                        },
                    ],
                });

                const activityFactory = mocker(activitySchema);

                const myFactory = mocker(schema, {
                    activities: { populateWithFactory: activityFactory },
                });
                const mock = myFactory.generate();
                mock.activities.forEach((activity) => {
                    expect(activity).toHaveProperty('name');
                    expect(activity).toHaveProperty('value');
                });
            });
        });
    });
});
