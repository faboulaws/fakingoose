import {
  Model,
  Schema,
  Document
} from 'mongoose';

import { generate } from './generate';
import { FactoryOptions, GlobalOptions, GlobalObjectIdOptions, GlobalDecimal128Options } from './types'

class Mocker<T extends Document> {
  schema: Schema<T>
  globalOptions: GlobalOptions;
  options: FactoryOptions;

  constructor(model: Schema<T> | Model<T>, options: FactoryOptions = {}) {
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

  generate(staticFields: Record<string,unknown> = {}) {
    return generate<T>(this.schema, {
      options: this.options,
      staticFields,
      globalOptions: this.globalOptions,
    });
  }
}

export function factory<T extends Document>(modelOrSchema: Schema<T> | Model<T>, options: FactoryOptions = {}): Mocker<T> {
  return new Mocker<T>(modelOrSchema, options);
}

function isModel<T extends Document>(m: Model<T> | Schema<T>): m is Model<T> {
  return (m as Model<T>).schema !== undefined;
}
