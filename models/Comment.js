const mongoose = require('mongoose')


const CommentSchema = mongoose.Schema({
    content:{
        type:String,
        require:true,
    },
    username:{
        type:String,
        require:true,
    },
    userPic:{
        type:String,
        require:true,
    },
    blogId:{
        type:String,
        require:true,
    },
    userId:{
        type:String,
        require:true,
    },
},
{ timestamps: true }
)

module.exports = mongoose.model('Comment',CommentSchema)