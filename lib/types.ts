type ValueCallback = (mockObject: Document) => any;

export type MockerFieldOption = {
    /**
     * I sonly used for string fields
     * example a string can have the types email, firstname or lastname
     */
    type?: string;
    /**
     * If the value
     * is a function, then the function receives the current mock
     * object as first argument and returns a value
     */
    value?: (string | number | boolean | ValueCallback);
    /**
     * When this option is present the field is skipped
     */
    skip?: boolean;
};

export interface FactoryOptions {
    [k: string]: MockerFieldOption;
}

export type GlobalDecimal128Options = {
    /**
     * Auto convert value to string
     */
    tostring: boolean;
  }
  
export  type GlobalObjectIdOptions = {
    /**
     * Auto convert value to string
     */
    tostring: boolean;
  }

export type GlobalOptions = {
    objectid?: GlobalObjectIdOptions;
    decimal128?: GlobalDecimal128Options;
  }
  