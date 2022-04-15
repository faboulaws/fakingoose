const { expect } = require('chai');
const get = require('lodash.get');
const { unflatten } = require('flat');

// const mongoose3 = require('mongoose3');
const mongoose4 = require('mongoose4');
const mongoose5 = require('mongoose5');
const mongooseLatest = require('mongooseLatest');

const { factory: mocker } = require('../dist');

const allOfType = (expectedType) => (array) => array.every((item) => (typeof item === expectedType));
const allInstanceOf = (expectedType) => (array) => array.every((item) => (item instanceof expectedType));
const allOfWithProps = (expectedProps) => (array) => array.every((item) => Object.entries(expectedProps).every(([prop, expectedType]) => (typeof item[prop] === expectedType)));

describe('mocker test', () => {
  const tests = [
    // { version: '3', mongoose: mongoose3 }, TODO not working (see issue #18: https://github.com/faboulaws/fakingoose/issues/18)
    { version: '4', mongoose: mongoose4 },
    { version: '5', mongoose: mongoose5 },
    { version: 'latest', mongoose: mongooseLatest },
  ];

  tests.forEach((test) => {
    const { mongoose } = test;
    const { Schema, Types } = mongoose;
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
      dateMinMax: { type: Date, min: '2020-12-15', max: '2021-12-30' },
      dateMin: { type: Date, min: '2020-12-15' },
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
      percent: { type: Number, min: 0, max: 100},

      embedded,
      ofEmbedded: [embedded],
    };

    const schema = new Schema(schemaDef);

    // example use

    const Thing = mongoose.model('Thing', schema);

    describe.only(`mongoose@${test.version}`, () => {
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

        expect(mock.percent).to.be.a('number');
        expect(mock.percent).to.be.within(0, 100);

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

        // date - validation
        const minDate = (new Date('2020-12-15')).getTime();
        const maxDate = (new Date('2021-12-30')).getTime();
        expect(mock.dateMinMax.getTime()).to.be.above(minDate - 1);
        expect(mock.dateMinMax.getTime()).to.be.below(maxDate + 1)

        expect(mock.dateMin.getTime()).to.be.above(minDate - 1);

        expect(mock.dateMax.getTime()).to.be.below(maxDate + 1)

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
                name: String
              })
            }
          }

          const MapModel = mongoose.model('MapModel', mapSchema)
          const thingMocker = mocker(MapModel, {});
          const _mock = thingMocker.generate();
          const mock = new MapModel(_mock);

          // map
          expect(mock).to.have.property('map');
          expect(mock.map).to.be.an('Map');

          // map of string
          expect(mock).to.have.property('mapOfString');
          expect(mock.mapOfString).to.be.an('Map');

          for (const value of mock.mapOfString.values()) {
            expect(value).to.be.a('string');
          }

          // map of embedded Schema
          expect(mock).to.have.property('mapOfSchema');
          expect(mock.mapOfSchema).to.be.a('Map');
          for (const value of mock.mapOfSchema.values()) {
            expect(value).to.be.an('object');
          }
        })
      }


      describe('string', () => {
        it('string at any level must work', () => {
          const sch = {
            arrayOfStringsWithEnum: [{ type: String, enum: ['string1', 'string2'] }],
            arrayOfStrings: [String],
            arrayOfStrings2: [{ type: String }],
          };
          const Entity = mongoose.model('Entity', sch);
          const entityMocker = mocker(Entity, {});
          const data = entityMocker.generate()

          data.arrayOfStringsWithEnum.forEach(value => {
            expect(['string1', 'string2']).to.include(value)
          })
          data.arrayOfStrings.forEach(value => {
            expect(typeof value).to.equal('string')
          })
          data.arrayOfStrings2.forEach(value => {
            expect(typeof value).to.equal('string')
          })
        })
      })

      describe('ObjectId', () => {
        const schema = new Schema({
          id: Schema.Types.ObjectId,
          arrayOfIds: [{ type: Schema.Types.ObjectId }],
          nestedObjectId: { nestedId: Schema.Types.ObjectId },
        });

        const expectTypeOf = (type, mockObject) => {
          // root level
          expect(mockObject).to.have.property('id');
          expect(mockObject.id).to.be.a(type);

          // array
          expect(mockObject).to.have.property('arrayOfIds');
          expect(mockObject.arrayOfIds).to.be.an('array');
          mockObject.arrayOfIds.forEach((value) => {
            expect(typeof value).to.eql(type);
          });

          // nested
          expect(mockObject).to.have.property('nestedObjectId');
          expect(mockObject.nestedObjectId).to.have.property('nestedId');
          expect(mockObject.nestedObjectId.nestedId).to.be.a(type);
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
          expect(mockObject).to.have.property('myDecimal');
          expect(mockObject.myDecimal).to.be.a(type);

          // array
          expect(mockObject).to.have.property('arrayOfDecimals');
          expect(mockObject.arrayOfDecimals).to.be.an('array');
          mockObject.arrayOfDecimals.forEach((value) => {
            expect(typeof value).to.eql(type);
          });

          // nested
          expect(mockObject).to.have.property('nestedDecimals');
          expect(mockObject.nestedDecimals).to.have.property('nestedValue');
          expect(mockObject.nestedDecimals.nestedValue).to.be.an(type);
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
        const schema = new Schema({
          myNumber: { type: Schema.Types.Number, enum: [0, 1, 2] } ,
          arrayOfNumbers: [{ type: Schema.Types.Number , enum: [0, 1, 2]}],
          nestedNumbers: { nestedValue: { type: Schema.Types.Number, enum: [0, 1, 2] } },
        });

        it('must generate a number using enum', () => {
          const factory = mocker(schema);
          const mockObject = factory.generate();
          expect([0, 1, 2]).to.include(mockObject.myNumber)
          expect([0, 1, 2]).to.include.members(mockObject.arrayOfNumbers)
          expect([0, 1, 2]).to.include(mockObject.nestedNumbers.nestedValue)
        });
      })

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
            expect(get(mock, path)).to.eql(get(staticFields, path));
          });
        });

        it('allow static values as object', () => {
          const options = {
            location: { value: { internal: { type: 'Point', coordinates: [1, 1] } } },
          };
          const Example = new Schema({ location: Object });

          const exampleFactory = mocker(Example, options).setGlobalObjectIdOptions({ tostring: false });

          const mock1 = exampleFactory.generate({ _id: Types.ObjectId('60b4b91e9339c965303aaa10') });
          const location = { internal: { type: 'Point', coordinates: [3, 3] } }
          const mock2 = exampleFactory.generate({ _id: Types.ObjectId('60b4b91e9339c965303baa11'), location });
          expect(mock1.location).to.equal(options.location.value)
          expect(mock2.location).to.equal(location)
        })

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
            }
            const thingShema = new Schema(schemaDef);
            const thingMocker = mocker(thingShema);
            const mock = thingMocker.generate(staticFields);
            const paths = ['mapOfString', 'mapOfSchema'];
            paths.forEach((path) => {
              expect(get(mock, path)).to.eql(get(staticFields, path));
            });
          })
        }


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

          describe('root level property', () => {
            it('should allow using value from parent property - root key', () => {
              const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
              const thingMocker = mocker(theShema, { root: { value: { levelOne: { firstName: 'blabla' } } } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should allow using value from parent property - sub level(levelOne) - nested option key', () => {
              const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
              const thingMocker = mocker(theShema, { root: { levelOne: { value: { firstName: 'blabla' } } } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should allow using value from parent property - sub level(levelOne) - path option key(root.levelOne)', () => {
              const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
              const thingMocker = mocker(theShema, { 'root.levelOne': { value: { firstName: 'blabla' } } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should allow using value from parent property - root key - Array values', () => {
              const theShema = new Schema({ root: { levelOne: [new Schema({ fitstName: String })] } });
              const thingMocker = mocker(theShema, { root: { value: { levelOne: [{ firstName: 'blabla' }] } } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne).to.eql([{ firstName: 'blabla' }]);
            });
          });
        });

        describe('value()', () => {
          it('should use value() function for property', () => {
            const userSchema = new Schema({ firstName: String, username: String, lastName: String });
            const thingMocker = mocker(userSchema, {
              firstName: { value: () => 'John' },
              username: {
                value: (object) => `${object.firstName}.${object.lastName}`,
              },
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
                value: (object) => `${object.user.info.firstName}.${object.user.info.lastName}`,
              },
            });
            const mock = thingMocker.generate({ user: { info: { lastName: 'Doe' } } });
            expect(mock.user.info.firstName).to.eql('John');
            expect(mock.user.info.username).to.eql('John.Doe');
          });

          it('should use value() function for property - nested property - nested option key', () => {
            const theShema = new Schema({ user: { info: { firstName: String, username: String, lastName: String } } });
            const thingMocker = mocker(theShema, unflatten({
              'user.info.firstName': { value: () => 'John' },
              'user.info.username': {
                value: (object) => `${object.user.info.firstName}.${object.user.info.lastName}`,
              },
            }));
            const mock = thingMocker.generate({ user: { info: { lastName: 'Doe' } } });
            expect(mock.user.info.firstName).to.eql('John');
            expect(mock.user.info.username).to.eql('John.Doe');
          });

          describe('root level property', () => {
            it('should allow using value from parent property - root key', () => {
              const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
              const thingMocker = mocker(theShema, { root: { value: () => ({ levelOne: { firstName: 'blabla' } }) } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should allow using value from parent property - sub level(levelOne) - nested option key', () => {
              const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
              const thingMocker = mocker(theShema, { root: { levelOne: { value: () => ({ firstName: 'blabla' }) } } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should allow using value from parent property - sub level(levelOne) - path option key(root.levelOne)', () => {
              const theShema = new Schema({ root: { levelOne: { firstName: String, username: String, lastName: String } } });
              const thingMocker = mocker(theShema, { 'root.levelOne': { value: () => ({ firstName: 'blabla' }) } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne.firstName).to.eql('blabla');
            });

            it('should allow using value from parent property - root key - Array values', () => {
              const theShema = new Schema({ root: { levelOne: [new Schema({ fitstName: String })] } });
              const thingMocker = mocker(theShema, { root: { value: () => ({ levelOne: [{ firstName: 'blabla' }] }) } });
              const mock = thingMocker.generate();
              expect(mock.root.levelOne).to.eql([{ firstName: 'blabla' }]);
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
            expect(mock).not.to.have.property('username');
            expect(mock).to.have.property('firstName');
            expect(mock).to.have.property('lastName');
          });

          it('should skip nested property - key as path', () => {
            const theSchema = new Schema({ user: { firstName: String, lastName: String, username: String } });
            const options = { 'user.username': { skip: true } };
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

          it('should skip property of object inside an array', () => {
            const schema = new Schema({
              information: [{
                updated: { type: Date, default: Date.now },
                title: String,
                content: String,
              }]
            });

            const options = {
              information: {
                updated: {
                  skip: true
                }
              }
            };

            const myFactory = mocker(schema, options);

            const mock = myFactory.generate();
            mock.information.forEach(info => {
              expect(info).not.to.haveOwnProperty('updated')
            })
          })
        });

        describe('indirect skip (from parent)', () => {
          it('should skip a subtree - from root', () => {
            const sschema = new Schema({
              root: { name: String, nickname: String },
              other: { name: String },
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

      describe('generate() override options', () => {
        it('must use the correct factory options', () => {
          const schema = new Schema({
            updated: { type: Date, default: Date.now },
            title: String,
            content: String,
          });
          const options = {
            updated: {
              skip: true
            }
          };

          const myFactory = mocker(schema, options);
          const mock1 = myFactory.generate({});
          expect(mock1).not.to.haveOwnProperty('updated')
          expect(mock1).to.haveOwnProperty('title')

          const mock2 = myFactory.generate({}, { title: { skip: true } });
          expect(mock2).to.haveOwnProperty('updated')
          expect(mock2).not.to.haveOwnProperty('title')
        })
      })

      describe('options.populate', () => {
        it('options.populateWithSchema', () => {
          const activitySchema = new mongoose.Schema({
            name: String,
            value: String,
          });

          const schema = new mongoose.Schema(
            {
              email: String,
              name: {
                type: String,
              },
              activities: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'activity'
              }],
            }
          );

          const myFactory = mocker(schema, { activities: { populateWithSchema: activitySchema } })
          const mock = myFactory.generate()
          mock.activities.forEach(activity => {
            expect(activity).to.haveOwnProperty('name')
            expect(activity).to.haveOwnProperty('value')
          })
        })

        it('options.populateWithFactory', () => {
          const activitySchema = new mongoose.Schema({
            name: String,
            value: String,
          });


          const schema = new mongoose.Schema(
            {
              email: String,
              name: {
                type: String,
              },
              activities: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'activity'
              }],
            }
          );

          const activityFactory = mocker(activitySchema)

          const myFactory = mocker(schema, { activities: { populateWithFactory: activityFactory } })
          const mock = myFactory.generate()
          mock.activities.forEach(activity => {
            expect(activity).to.haveOwnProperty('name')
            expect(activity).to.haveOwnProperty('value')
          })
        })
      })
    });
  });
});
