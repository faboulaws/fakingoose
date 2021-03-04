export = mocker;
/**
 *
 * @param {MongooseModel|MongooseSchema} mongooseModel
 * @param {MockerOptions} options
 */
declare function mocker(mongooseModel: MongooseModel | MongooseSchema, options: MockerOptions): Mocker;
declare namespace mocker {
    export { StaticFields, MockerOptions, valueCallback, MockerFieldOption, MongooseSchema, MongooseModel, GlobalDecimal128Options };
}
type MongooseModel = object;
type MongooseSchema = object;
type MockerOptions = {
    [x: string]: MockerFieldOption;
};
declare class Mocker {
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
    constructor(model: MongooseModel | MongooseSchema, options?: MockerOptions);
    /** @type{MongooseModel|MongooseSchema} */
    model: MongooseModel | MongooseSchema;
    /** @type{MockerOptions} */
    options: MockerOptions;
    globalOptions: {};
    /**
       * A GlobalDecimal128Options
       * @typedef { Object } GlobalDecimal128Options
       * @property {boolean} tostring Auto convert value to string
       */
    /**
     *
     * @param {GlobalObjectIdOptions} options
     */
    setGlobalObjectIdOptions(options: any): Mocker;
    /**
     * A GlobalDecimal128Options
     * @typedef {Object} GlobalDecimal128Options
     * @property {boolean} tostring  Auto convert value to string
     */
    /**
     *
     * @param {GlobalDecimal128Options} options
     */
    setGlobalDecimal128Options(options: GlobalDecimal128Options): Mocker;
    /**
     * @typedef {Object} StaticFields
     */
    /**
     *
     * @param {StaticFields} staticFields
     * @return {Object} The generated mock object
     */
    generate(staticFields?: StaticFields): any;
}
type StaticFields = {
    [x: string]: any;
};
type valueCallback = () => any;
type MockerFieldOption = {
    /**
     * Depends on the field type for
     * example a string can have the types email
     */
    type?: string;
    /**
     * If the value
     * is a function, then the function receives the current mock
     * object as first argument and returns a value
     */
    value?: (string | number | boolean | valueCallback);
    /**
     * When this option is present the field is skipped
     */
    skip?: boolean;
};
/**
 * A GlobalDecimal128Options
 */
type GlobalDecimal128Options = {
    /**
     * Auto convert value to string
     */
    tostring: boolean;
};
