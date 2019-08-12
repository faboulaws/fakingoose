# fakingoose

[![Greenkeeper badge](https://badges.greenkeeper.io/faboulaws/fakingoose.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/faboulaws/fakingoose.svg?branch=master)](https://travis-ci.org/faboulaws/fakingoose)

An automatic fixture generator for mongoose using schema definition.

#  Install
```
npm install fackingoose
```

# Usage
```js
const factory = require('fackingoose');
const entityFactory = factory(model, options);
```
**Options**
- model: Mongoose schema object.
- options: Generation options
  - options.\<fieldName\>.value **\<mixed\>**: A static value for each generated fixture.
  - options.\<fieldName\>.value: **\<function\>** a function for generating dynamic a value per item. This function received the mock object as first argument.
  - options.\<fieldName\>.skip **\<boolean\>**: When set to `true` would skip the field.
  - options.\<fieldName\>.type **\<string\>**: The sub-type for this field type. For example \<String\> schema type supports `email`, `firsname` and `lastname`.

# Usage example
```js
const mongoose = require('mongoose');
const factory = require('fackingoose');
const { Schema } = mongoose;

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
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: { type: Number, min: 0 },
        favs: { type: Number, min: 0 }
    }
});

const options = {
    author: {
        email: {
            type: 'email',
        },
        username: {
            value: (object) => {
                return object.fullname.toLowerCase().replace(/\s/g,'.');
            }
        },
        favoriteQuote: { skip: true }
    },
};
const blogFactory = factory(blogSchema, options);

const mock = blogFactory.generate({ author: { fullname: 'John Doe' } });
```

**sample output**
  ```json
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

# Supported Types
- String
- Array
- Number
- ObjectId
- Boolean
- Mixed
- Buffer
- Embedded
- Date
- Map

# Mongoose version Support

Version 4.x and 5.x are supported.
