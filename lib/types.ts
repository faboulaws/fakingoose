import { Model, Schema, Document } from "mongoose";
import { Mocker } from "./mocker";

export type GenericObject = { [key: string]: any };

type ValueCallback<T> = (mockObject: T) => any;

export type MockerFieldOption<T> = SkipFieldOptions  | FieldValueOptions<T> | StringFieldOptions | SizeFieldOptions | ObjectIdFieldOptions<any>;
export interface SkipFieldOptions {

  /**
   * When this option is present the field is skipped
   */
  skip: boolean;
}

export interface FieldValueOptions<T> {
  /**
    * If the value
    * is a function, then the function receives the current mock
    * object as first argument and returns a value
    */
  value: (string | number | boolean | ValueCallback<T> | GenericObject);
}

export interface StringFieldOptions {
  /**
    * Is only used for string fields
    * example a string can have the types email, firstname or lastname
    */
  type: 'email' | 'firstname' | 'lastname';
}

export interface SizeFieldOptions {
  /**
    * Is only used for array fields
    */
  size: number;
}

export type ObjectIdFieldOptions<T extends  GenericObject> = PopulateWithFactory<T> | PopulateWithSchema<T> | ObjectIdToStringOption

export interface PopulateWithFactory<T extends GenericObject>{
  populateWithFactory: Mocker<T>
}

export interface PopulateWithSchema<T extends GenericObject> {
  populateWithSchema: Model<T> | Schema<Document<T>>
}
export interface ObjectIdToStringOption {
  tostring: boolean
}

export function isStringFieldOptions<T extends  Record<string, unknown>>(o: MockerFieldOption<T>): o is StringFieldOptions {
  return (o as StringFieldOptions).type !== undefined
}


export function isPopulateWithFactory<T>(o: MockerFieldOption<T>): o is PopulateWithFactory<T> {
  return (o as PopulateWithFactory<T>).populateWithFactory !== undefined
}

export function isPopulateWithSchema<T extends  Record<string, unknown>>(o: MockerFieldOption<T>): o is PopulateWithSchema<T> {
  return (o as PopulateWithSchema<T>).populateWithSchema !== undefined
}

export interface FactoryOptions<T> {
  [k: string]: MockerFieldOption<T> | FactoryOptions<T> | FactoryOptions<T>[];
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
