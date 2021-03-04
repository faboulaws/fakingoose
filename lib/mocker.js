const { generate } = require('./generate');

class Mocker {
  /**
   * @typedef {Object.<string, *>} StaticFields
   */
  /**
   * @typedef {Object.<string, MockerFieldOption>} MockerOptions
   */
  /**
   * @callback valueCallback
  * @typedef {Object} MockerFieldOption
  * @property {string} [type] Depends on the field type for
  *           example a string can have the types email
  * @property {(string|number|boolean|valueCallback)} [value] If the value
  *           is a function, then the function receives the current mock
  *           object as first argument and returns a value
  * @property {boolean} [skip] When this option is present the field is skipped
  */

  /**
  * @typedef {object} MongooseSchema
  */

  /**
  @typedef {object} MongooseModel
  */
  /**
   * @param {MongooseModel|MongooseSchema} model
   * @param {MockerOptions} options
   */
  constructor(model, options = {}) {
    /** @type{MongooseModel|MongooseSchema} */
    this.model = model;
    /** @type{MockerOptions} */
    this.options = options;
    this.globalOptions = {};
  }

  /**
     * A GlobalDecimal128Options
     * @typedef { Object } GlobalDecimal128Options
     * @property {boolean} tostring Auto convert value to string
     */
  /**
   *
   * @param {GlobalObjectIdOptions} options
   */
  setGlobalObjectIdOptions(options) {
    this.globalOptions.objectid = options;
    return this;
  }

  /**
   * A GlobalDecimal128Options
   * @typedef {Object} GlobalDecimal128Options
   * @property {boolean} tostring  Auto convert value to string
   */
  /**
   *
   * @param {GlobalDecimal128Options} options
   */
  setGlobalDecimal128Options(options) {
    this.globalOptions.decimal128 = options;
    return this;
  }

  /**
   * @typedef {Object} StaticFields
   */
  /**
   *
   * @param {StaticFields} staticFields
   * @return {Object} The generated mock object
   */
  generate(staticFields = {}) {
    const schema = this.model.schema || this.model;
    return generate(schema, {
      options: this.options,
      staticFields,
      globalOptions: this.globalOptions,
    });
  }
}

/**
 *
 * @param {MongooseModel|MongooseSchema} mongooseModel
 * @param {MockerOptions} options
 */
const mocker = (mongooseModel, options) => new Mocker(mongooseModel, options);

module.exports = mocker;
