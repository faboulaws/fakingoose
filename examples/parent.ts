import { Schema } from 'mongoose'
import { factory } from '../lib/mocker'

interface Parent {
    name?: string
}

const ParentSchema = new Schema<Parent>({
    name: String
})

const parentFactory = factory(ParentSchema);
const mock = parentFactory.generate()
console.log(mock);