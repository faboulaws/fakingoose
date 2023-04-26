import {
  Model,
  Schema,
  SchemaDefinition
} from 'mongoose';

import { generate } from './generate';
import { GenericObject, FactoryOptions, GlobalOptions, GlobalObjectIdOptions, GlobalDecimal128Options } from './types';

export class Mocker<T extends GenericObject = {}> {
  schema:  Schema | Schema<T> | SchemaDefinition<T>
  globalOptions: GlobalOptions;
  options: FactoryOptions<T>;

  constructor(model: Schema<T> | Model<T> | SchemaDefinition<T>, options: FactoryOptions<T> = {}) {
    this.schema = isModel(model) ? model.schema : model;
    this.options = options;
    this.globalOptions = {};
  }

   setGlobalObjectIdOptions(options: GlobalObjectIdOptions) {
    this.globalOptions.objectid = options;
    return this;
  }

  setGlobalDecimal128Options(options: GlobalDecimal128Options) {
    this.globalOptions.decimal128 = options;
    return this;
  }

  generate(staticFields: Record<string,unknown> = {}, overrideOptions: FactoryOptions<T> = undefined) {
    return generate<T>(this.schema, {
      options: overrideOptions || this.options,
      staticFields,
      globalOptions: this.globalOptions,
    });
  }
}

export function factory<T extends GenericObject >(modelOrSchema:  Schema<T> | Model<T>, options: FactoryOptions<T> = {}): Mocker<T> {
  return new Mocker<T>(modelOrSchema, options);
}

function isModel<T>(m: Model<T> | Schema<T> | SchemaDefinition<T>): m is Model<T> {
  return (m as Model<T>).schema !== undefined;
}
