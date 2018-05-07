'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	text: String,
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now},
	votes: {type: Number, default: 0}
});

CommentSchema.method("update", function(updates,callback) {
	Object.assign(this, updates, {updatedAt: new Date()});
	this.parent().save(callback);
});

var PostSchema = new Schema({
	description: String,
	createdAt: {type: Date, default: Date.now},
	comments: [CommentSchema]
});

var Post = mongoose.model("Post",PostSchema);
var Comment = mongoose.model("Comment",CommentSchema);

module.exports.Post = Post;
module.exports.Comment = Comment;