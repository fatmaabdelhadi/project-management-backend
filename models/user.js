const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { ObjectId } = mongoose.Schema.Types

const User = new Schema({
    username: {
        type: String,
        required: true
    },
    email: String,
    password: String,
    role: {
        managedProjects: [{type: ObjectId, ref: 'Project'}],
        contributedTasks: [{type: ObjectId, ref: 'Task'}]
    },
    profile: {
        fullName: String,
        jobTitle: String,
        contactInfo: {
            email: String,
            phone: String,
            address: String
        }
    },
    preferences: {
        theme: String,
        notifications: {
            email: Boolean,
            sms: Boolean
        }
    }
    // image: {
    //     type: String
    // }
},
{
    timestamps: true
})

module.exports = mongoose.model('user', User)