const Chance = require('chance');
const set = require('lodash.set');
var ObjectId = require('bson-objectid');

const chance = new Chance();

const generators = {
    string: (pathDef, options) => {
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
            }
        }
        return pathDef.lowercase ? chance.string().toLowerCase() : chance.string();
    },
    array: (pathDef, options, staticFields) => {
        const num = 2;
        const value = [];
        // chance.integer({ min: -20, max: 20 })
        if (typeof pathDef.caster === 'object') {
            const innerType = pathDef.caster.instance.toLowerCase();

            const generator = generators[innerType];
            for (var i = 0; i < num; i++) {
                value.push(generator(pathDef.options));
            }
            return value;
        } else if (typeof pathDef.caster === 'function') {
            for (var i = 0; i < num; i++) {
                value.push(generate(pathDef.schema, options, staticFields));
            }
            return value;
        }
        return null;
    },
    objectid: () => ObjectId(),
    number: (pathDef, options) => {
        const numOpt = ['min', 'max'].reduce((opts, att) => {
            if (pathDef.options && pathDef.options[att]) {
                return Object.assign(opts, { [att]: pathDef.options[att] });
            }
            return opts;
        }, {});
        return chance.integer(numOpt);
    },
    decimal128: () => `${chance.floating()}`,
    boolean: () => chance.pickone([true, false]),
    date: () => new Date(),
    buffer: () => Buffer.alloc(1),
    mixed: (pathDef, options) => {
        const generatorName = chance.pickone(['boolean', 'date', 'number', 'string', 'objectid']);
        if (!generators[generatorName]) {
            throw new Error(`Type ${generatorName} not supported`);
        }
        return generators[generatorName](pathDef, options);
    },
    embedded: (pathDef, options, staticFields) => {
        const schema = pathDef.schema;
        return generate(schema, options, staticFields);
    },
    map: (pathDef, options) => {
        const generatorName = pathDef.options.of ? getOfType(pathDef.options.of) : 'mixed';
        if (!generators[generatorName]) {
            throw new Error(`Type ${generatorName} not supported`);
        }
        const generator = generators[generatorName];
        const keyCount = chance.integer({ min: 1, max: 10 });
        const keys = Array.from(new Array(keyCount)).map(() => chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' }))
        const mock = keys.reduce((obj, key) => {
            return Object.assign(obj, { [key]: generator(pathDef, options) })
        }, {})
        console.log(mock, 'mock');
        return mock;

    }
};

function getOfType(of) {
    return of.name.toLowerCase();
}

const generate = (schema, options, staticFields) => {
    const mockObject = {};
    schema.eachPath((path) => {
        if (!path.includes('$*')) {
            populateField(mockObject, schema, path, options, staticFields);
        }
    });
    return mockObject;
};

function populateField(object, schema, path, options, staticFields) {
    const fieldOptions = options[path] || {};
    if (!fieldOptions.skip) {
        let value;
        if (staticFields[path]) {
            value = staticFields[path];
        } else if (fieldOptions.value && typeof fieldOptions.value === 'function') {
            value = fieldOptions.value(object);
        } else if (fieldOptions.value) {
            value = fieldOptions.value;
        } else {
            const pathDef = schema.path(path);
            // skip if default value is defined. Mongoose would take care of it
            if (!hasDefinedDefaultValue(pathDef)) {
                const type = pathDef.instance.toLowerCase();
                if (!generators[type]) {
                    throw new Error(`Type ${pathDef.instance} not supported`);
                }
                const generator = generators[type];
                value = generator(pathDef, fieldOptions, staticFields);
            }
        }
        set(object, path, value);

    }
}

function hasDefinedDefaultValue(pathDef) {
    return !!pathDef.options.default;
}

class Mocker {
    constructor(model, options = {}) {
        this.model = model;
        this.options = options;
    }

    generate(staticFields = {}) {
        const schema = this.model.schema || this.model;
        return generate(schema, this.options, staticFields);
    }
}

const mocker = function (mongooseModel, options) {
    return new Mocker(mongooseModel, options);
};

module.exports = mocker;
