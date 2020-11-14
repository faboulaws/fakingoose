# fakingoose

[![Greenkeeper badge](https://badges.greenkeeper.io/faboulaws/fakingoose.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/faboulaws/fakingoose.svg?branch=master)](https://travis-ci.org/faboulaws/fakingoose)
[![Coverage Status](https://coveralls.io/repos/github/faboulaws/fakingoose/badge.svg?branch=master)](https://coveralls.io/github/faboulaws/fakingoose?branch=master)

An automatic mock data generator for mongoose using schema definition.

#  Install

``` 
npm install fakingoose
```

# Usage

``` js
const factory = require('fakingoose');
const entityFactory = factory(model, options);
```

#### factory(model, options)

* model **\<[Schema](https://mongoosejs.com/docs/api/schema.html)\>** or **\<[Model](https://mongoosejs.com/docs/api/model.html)\>**: Mongoose [model](https://mongoosejs.com/docs/api/model.html) or [schema](https://mongoosejs.com/docs/api/schema.html).
* options **\<? Object\>**: Generation options are optional. The factory would generate data for all fields based on the schema alone. For cases where there is a need for custom values, options can be used to define custom values or data generation setting per field.
  + options.\<propertyName\>.value **\<mixed\>**: A static value for each generated mock object.
  + options.\<propertyName\>.value: **\<function\>** a function for generating a dynamic value per item. This function receives the mock object as first argument.
  + options.\<propertyName\>.skip **\<boolean\>**: When set to `true` would skip the field.
  + options.\<propertyName\>.type **\<string\>**: The sub-type for this field type. For example \<String\> schema type supports `email` , `firsname` and `lastname` .

# Usage example

``` js
const mongoose = require('mongoose');
const factory = require('fakingoose');
const {
    Schema
} = mongoose;

const authorSchema = new Schema({
    id: Schema.Types.ObjectId,
    title: {
        type: String,
        enum: ['Mr', 'Mrs', 'Dr']
    },
    fullname: String,
    username: String,
    email: String,
    favoriteQuote: String,
});

const blogSchema = new Schema({
    title: String,
    author: authorSchema,
    body: String,
    comments: [{
        body: String,
        date: Date
    }],
    date: {
        type: Date,
        default: Date.now
    },
    hidden: Boolean,
    meta: {
        votes: {
            type: Number,
            min: 0
        },
        favs: {
            type: Number,
            min: 0
        }
    }
});

const options = {
    author: {
        email: {
            type: 'email',
        },
        username: {
            value: (object) => {
                return object.fullname.toLowerCase().replace(/\s/g, '.');
            }
        },
        favoriteQuote: {
            skip: true
        }
    },
};
const blogFactory = factory(blogSchema, options);

const mock = blogFactory.generate({
    author: {
        fullname: 'John Doe'
    }
});
```

**sample output**
  

``` json
{
  "title":"8tnkcjplr",
  "author":{
    "id":"5d513f762a48134adb1868d7",
    "title":"Dr",
    "fullname":"John Doe",
    "username":"john.doe",
    "email":"re@sisuki.mc",
    "_id":"5d513f762a48134adb1868d8"
  },
  "body":"ebjwad6*keskl",
  "comments":[
    {
      "body":"d$*t9y3",
      "date":"2019-08-12T10:29:10.193Z",
      "_id":"5d513f762a48134adb1868d9"
    },
    {
      "body":"jv5o[",
      "date":"2019-08-12T10:29:10.193Z",
      "_id":"5d513f762a48134adb1868da"
    }
  ],
  "hidden":false,
  "meta":{"votes":-3419053502758912,"favs":3323094479405056},
  "_id":"5d513f762a48134adb1868db"
}
 ```

# Define options for nested properties

 To define options for nested a property use the nested property path (property names sperated by a dot).
 Example: 

``` js
const options = {
    "meta.votes": {
        value: 0
    }, // set value for 'votes' property under meta
    "meta.favs": {
        skip: true
    } // skip value for 'favs' property under meta
}
``` 

# Skipping multiple nested properties

Multiple nested properties can be skipped from parent property.
Example:

```js
const accountSchema = new mongoose.Schema({
    user: {
        generalInfo: {
            firstName: String,
            lastName: String,
            age: Number
        },
        address: {
            postCode: String,
            street: String
        }
    }
});
const accountFactory = factory(accountSchema, options);
```

To generate mocks without an address define options as below

``` js
const options = {
    'user.address': {
        skip: true
    }
}
```

 or 

 
``` js
const options = {
    user: {
        address: {
            skip: true
        }
    }
}
```

then

```js
const mockObject = accountFactory.generate(options);
```

# Generating ObjectId values
When generating ObjectId values, you can choose to Stringify the generated ObjectId by using the `tostring` option. By default this options is `true`, so all generated ObjectIds would be converted to a String. Set `tostring` to false to disable this behaviour.

Example: In the snippet below all ObjectIds generated are not stringified.
```js
const friendSchema = new Schema({
    id: Schema.Types.ObjectId
    friendIds: [{type: Schema.Types.ObjectId}],
    bestFriend: {
        id: Schema.Types.ObjectId
    }
});

const amigoFactory = factory(friendSchema, { 
    id: { tostring: false }
    friendIds: { tostring: false }
    'bestFriend.id': { tostring: false }
}); 
```

# Generating decimal ([Decimal128](https://developer.mongodb.com/quickstart/bson-data-types-decimal128)) values
When generating decimal values, you can choose to Stringify the generated number by using the `tostring` option. By default this options is `true`, so all generated numbers would be converted to a String. Set `tostring` to false to disable this behaviour.

Example: In the snippet below all numbers generated are not stringified.
```js
const productSchema = new Schema({
    price: Schema.Types.Decimal128
});

const productFactory = factory(productSchema, {
    price: { tostring: false }
}); 
```

# Supported Types

* String
* Array
* Number
* Decimal128
* ObjectId
* Boolean
* Mixed
* Buffer
* Embedded
* Date
* Map

# Mongoose version Support

Version 4.x and 5.x are supported.

