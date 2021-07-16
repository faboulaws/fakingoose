import { Model, Schema, Document } from "mongoose";
import { Mocker } from "./mocker";

type ValueCallback = (mockObject: Document) => any;

export type MockerFieldOption = SkipFieldOptions | FieldValueOptions | StringFieldOptions | ObjectIdFieldOptions<any>;
export interface SkipFieldOptions {

  /**
   * When this option is present the field is skipped
   */
  skip: boolean;
}

export interface FieldValueOptions {
  /**
    * If the value
    * is a function, then the function receives the current mock
    * object as first argument and returns a value
    */
  value: (string | number | boolean | ValueCallback);
}

export interface StringFieldOptions {
  /**
    * Is only used for string fields
    * example a string can have the types email, firstname or lastname
    */
  type: 'email' | 'firstname' | 'lastname';
}

export type ObjectIdFieldOptions<T extends Document> = PopulateWithFactory<T> | PopulateWithSchema<T>

export interface PopulateWithFactory<T extends Document> {
  populateWithFactory: Mocker<T>
}

export interface PopulateWithSchema<T extends Document> {
  populateWithSchema: Model<T> | Schema
}

export function isStringFieldOptions(o: MockerFieldOption): o is StringFieldOptions {
  return (o as StringFieldOptions).type !== undefined
}


export function isPopulateWithFactory<T extends Document>(o: MockerFieldOption): o is PopulateWithFactory<T> {
  return (o as PopulateWithFactory<T>).populateWithFactory !== undefined
}

export function isPopulateWithSchema<T extends Document>(o: MockerFieldOption): o is PopulateWithSchema<T> {
  return (o as PopulateWithSchema<T>).populateWithSchema !== undefined
}

export interface FactoryOptions {
  [k: string]: MockerFieldOption;
}

export type GlobalDecimal128Options = {
  /**
   * Auto convert value to string
   */
  tostring: boolean;
}

export type GlobalObjectIdOptions = {
  /**
   * Auto convert value to string
   */
  tostring: boolean;
}

export type GlobalOptions = {
  objectid?: GlobalObjectIdOptions;
  decimal128?: GlobalDecimal128Options;
}
