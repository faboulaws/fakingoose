const Chance = require('chance');
const set = require('lodash.set');
const get = require('lodash.get');
const flatten = require('flat');
const isPlainObject = require('lodash.isplainobject');
const ObjectId = require('bson-objectid');

const UNDEFINED_PROP_VIA_PARENT = Symbol('UndefinedPropFromParent');
const OBJECT_ID_STRINGIFY_BY_DEFAULT = true;
const DECIMAL_128_STRINGIFY_BY_DEFAULT = true;
const NO_STATIC_VALUE = Symbol('No static value');

const chance = new Chance();

function getTypeOf(type) {
  if (typeof type.name === 'string') {
    return type.name.toLowerCase();
  } if (type.constructor.name === 'Schema') {
    return 'map_value_embedded';
  }
  throw new Error('Unknown type');
}

function getRandomInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const generators = {
  string: (pathDef, { options }) => {
    if (Array.isArray(pathDef.enumValues) && pathDef.enumValues.length) {
      return chance.pickone(pathDef.enumValues);
    }
    if (options && options.type) {
      switch (options.type) {
        case 'email':
          return chance.email();
        case 'firstname':
          return chance.first();
        case 'lastname':
          return chance.last();
        default:
          return chance.string();
      }
    }
    return pathDef.lowercase ? chance.string().toLowerCase() : chance.string();
  },
  array: (pathDef, { options, staticFields, globalOptions }) => {
    const num = 2;
    if (typeof pathDef.caster === 'object') {
      const innerType = pathDef.caster.instance.toLowerCase();
      const generator = generators[innerType];

      return Array.from(Array(num)).map(() => generator(pathDef.options,
        { options, globalOptions }));
    } if (typeof pathDef.caster === 'function') {
      // eslint-disable-next-line no-use-before-define
      return Array.from(Array(num)).map(() => generate(pathDef.schema,
        { options, staticFields, globalOptions }));
    }
    return null;
  },
  objectid: (pathDef, { options, globalOptions }) => {
    if (get(options, 'tostring', OBJECT_ID_STRINGIFY_BY_DEFAULT) === false || get(globalOptions, 'objectid.tostring', OBJECT_ID_STRINGIFY_BY_DEFAULT) === false) {
      return ObjectId();
    }
    return ObjectId().toString();
  },
  number: (pathDef) => {
    const numOpt = ['min', 'max'].reduce((opts, att) => {
      if (pathDef.options && pathDef.options[att]) {
        const attrValue = Array.isArray(pathDef.options[att]) ? pathDef.options[att][0]
          : pathDef.options[att];
        return Object.assign(opts, { [att]: attrValue });
      }
      return opts;
    }, {});
    return chance.integer(numOpt);
  },
  decimal128: (pathDef, { options, globalOptions }) => {
    if (get(options, 'tostring', DECIMAL_128_STRINGIFY_BY_DEFAULT) === false || get(globalOptions, 'decimal128.tostring', DECIMAL_128_STRINGIFY_BY_DEFAULT) === false) {
      return chance.floating();
    }
    return `${chance.floating()}`;
  },
  boolean: () => chance.pickone([true, false]),
  date: (pathDef) => {
    let max = 8640000000000000;
    let min = -8640000000000000;
    if (pathDef.options && (pathDef.options.min || pathDef.options.max)) {
      min = pathDef.options.min ? Date.parse(pathDef.options.min) : min;
      max = pathDef.options.max ? Date.parse(pathDef.options.max) : max;
    }
    const timestamp = getRandomInclusive(min, max);
    return new Date(timestamp);
  },
  buffer: () => Buffer.alloc(1),
  mixed: (pathDef, { options, globalOptions }) => {
    const generatorName = chance.pickone(['boolean', 'date', 'number', 'string', 'objectid']);
    if (!generators[generatorName]) {
      throw new Error(`Type ${generatorName} not supported`);
    }
    return generators[generatorName](pathDef, { options, globalOptions });
  },
  embedded: (pathDef, { options, staticFields, globalOptions }) => {
    const { schema } = pathDef;
    // eslint-disable-next-line no-use-before-define
    return generate(schema, { options, staticFields, globalOptions });
  },
  map_value_embedded: (pathDef, { options, staticFields, globalOptions }) => {
    const schema = pathDef.options.of;
    // eslint-disable-next-line no-use-before-define
    return generate(schema, { options, staticFields, globalOptions });
  },
  map: (pathDef, { options, globalOptions, staticFields }) => {
    const generatorName = pathDef.options.of ? getTypeOf(pathDef.options.of) : 'mixed';
    if (!generators[generatorName]) {
      throw new Error(`Type ${generatorName} not supported`);
    }
    const generator = generators[generatorName];
    const keyCount = chance.integer({ min: 1, max: 10 });
    const keys = Array.from(new Array(keyCount))
      .map(() => chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' }));
    const mock = keys.reduce(
      (obj, key) => Object.assign(obj, { [key]: generator(pathDef, { options, globalOptions, staticFields }) }),
      {},
    );
    return mock;
  },
};

const getPropertyByPath = (object, path) => get(object, path);

const getPropertyByName = (object, propName) => object[propName];

const propertyIsSkipped = (path, options) => {
  const fieldOptions = getPropertyByName(options, path) || getPropertyByPath(options, path) || {};
  return fieldOptions.skip === true;
};

const propertyParentIsSkipped = (path, options) => {
  const pathProps = path.split('.');
  if (pathProps.length > 1) {
    let parentPath = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const pathProp of pathProps) {
      parentPath = parentPath.length === 0 ? pathProp : `${parentPath}.${pathProp}`;
      const parentObject = getPropertyByPath(options, parentPath)
        || getPropertyByName(options, parentPath) || {};
      if (parentObject.skip === true) {
        return true;
      }
    }
  }
  return false;
};

const shouldSkipProperty = (path, options) => propertyIsSkipped(path, options)
  || propertyParentIsSkipped(path, options);

function populateField(mockObject, {
  schema, path, options, staticValue, indirectValues = {}, globalOptions = {},
}) {
  const fieldOptions = getPropertyByName(options, path) || getPropertyByPath(options, path) || {};
  if (!shouldSkipProperty(path, options)) {
    let value;
    const pathDef = schema.path(path);
    const type = pathDef.instance.toLowerCase();

    if (staticValue !== undefined && !isPlainObject(staticValue)) {
      value = staticValue;
    } else if (staticValue !== undefined && type === 'map') {
      value = staticValue;
    } else if (fieldOptions.value && typeof fieldOptions.value === 'function') {
      value = fieldOptions.value(mockObject);
    } else if (fieldOptions.value) {
      ({ value } = fieldOptions);
    } else if (indirectValues[path]) {
      value = indirectValues[path];
    } else {
      if (!generators[type]) {
        throw new Error(`Type ${pathDef.instance} not supported`);
      }
      const generator = generators[type];
      value = generator(pathDef,
        { options: fieldOptions, staticFields: staticValue, globalOptions });
    }

    set(mockObject, path, value);
  }
}

const getOptionFromParentProperty = (path, options, optionName) => {
  const pathProps = path.split('.');
  if (pathProps.length > 1) {
    let parentPath = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const pathProp of pathProps) {
      parentPath = parentPath.length === 0 ? pathProp : `${parentPath}.${pathProp}`;
      const parentObject = getPropertyByPath(options, parentPath)
        || getPropertyByName(options, parentPath) || {};
      if (parentObject[optionName]) {
        return [parentPath, parentObject[optionName]];
      }
    }
  }
  return UNDEFINED_PROP_VIA_PARENT;
};

const setIndirectValues = (parentPath, rootValue, indirectVals) => {
  const rootValues = flatten(rootValue, { safe: true });
  Object.entries(rootValues).forEach(([keyPath, value]) => {
    // eslint-disable-next-line no-param-reassign
    indirectVals[`${parentPath}.${keyPath}`] = value;
  });
  return indirectVals;
};

const generate = (schema, { options, staticFields, globalOptions }) => {
  const mockObject = {};
  const fieldGeneration = [];
  const delayedFieldGeneration = [];
  const indirectValues = {};
  const inderectValuesTasks = {};
  schema.eachPath((path) => {
    if (!path.includes('$*')) {
      if (typeof get(options, `${path}.value`) === 'function' || typeof get(options, `['${path}'].value`, undefined) === 'function') {
        delayedFieldGeneration.push(
          () => populateField(
            mockObject, {
            schema, path, options, staticValue: get(staticFields, path, undefined), globalOptions,
          },
          ),
        );
      } else {
        const indirectVals = getOptionFromParentProperty(path, options, 'value');
        if (indirectVals !== UNDEFINED_PROP_VIA_PARENT) {
          const [parentPath, value] = indirectVals;
          if (!inderectValuesTasks[parentPath]) {
            if (typeof value === 'function') {
              fieldGeneration.push(() => {
                const rootValue = value(mockObject);
                setIndirectValues(parentPath, rootValue, indirectValues);
              });
            } else {
              const rootValue = value;
              setIndirectValues(parentPath, rootValue, indirectValues);
            }
            inderectValuesTasks[parentPath] = true;
          }
        }

        fieldGeneration.push(() => populateField(
          mockObject, {
          schema,
          path,
          options,
          staticValue: get(staticFields, path, undefined),
          indirectValues,
          globalOptions,
        },
        ));
      }
    }
  });
  [...fieldGeneration, ...delayedFieldGeneration].forEach((fn) => fn());
  return mockObject;
};


class Mocker {
  constructor(model, options = {}) {
    this.model = model;
    this.options = options;
    this.globalOptions = {};
  }

  setGlobalObjectIdOptions(options) {
    this.globalOptions.objectid = options;
    return this;
  }

  setGlobalDecimal128Options(options) {
    this.globalOptions.decimal128 = options;
    return this;
  }

  generate(staticFields = {}) {
    const schema = this.model.schema || this.model;
    return generate(schema, {
      options: this.options,
      staticFields,
      globalOptions: this.globalOptions,
    });
  }
}

const mocker = (mongooseModel, options) => new Mocker(mongooseModel, options);

module.exports = mocker;
