const mongoose = require('mongoose');
const {factory} = require('../');

// const factory = require('fackingoose');

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
console.log(mock);

