'use strict';

var express = require("express");
var bodyParser = require("body-parser").json;
var logger = require("morgan");
var _ = require("underscore");
var app = express();

var middleware = {
	requireAuthentication: function(req,res,next){
		next();
	}
}

app.use(middleware.requireAuthentication);
app.use(bodyParser());
app.use(logger());

var port = process.env.PORT || 3000;

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/cmspost");

var db = mongoose.connection;

var Post = require("./models").Post;
var Comment = require("./models").Comment;

db.on("error", function(err){
	console.error("Error occured",err);
});

db.on("open", function(){
	console.log("Database successfully connected");
});

app.get("/post", function(req, res, next) {
	Post.find({}).exec(function(err, posts){
		if(err) return next(err);
		res.json(posts);
	});
});

app.post("/post", function(req, res, next){
	var post = new Post(req.body);
	post.save(function(err, post) {
		if(err) return next(err);
		res.status(201);
		res.json(post);
	});
});

app.get("/post/:pID", function(req, res, next) {
	Post.findById(req.params.pID).exec(function(err, doc){
		if(err) return next(err);
		req.post = doc;
		res.json(doc);
	});
});

app.put("/post/:pID",function(req, res, next) {
	var body = _.pick(req.body, "description");
	var attributes = {};

	if(body.hasOwnProperty("description")) {
		attributes.description = body.description;
	}

	Post.findByIdAndUpdate(req.params.pID,attributes,{new: true}).exec(function(err, post) {
		if(err) return next(err);
		res.json(post);
	});
});

app.put("/post/:pID/comments/:cID",function(req, res, next) {
	var body = _.pick(req.body, "text");
	var attributes = {};

	if(body.hasOwnProperty("text")) {
		attributes.text = body.text;
	}

	Post.findById(req.params.pID).exec(function(err, post) {
		if(err) return next(err);
		console.log(req.params.cID);
		post.comments.findByIdAndUpdate(req.params.cID, attributes, {new: true}).exec(function(err, comment) {
			if(err) return next(err);
			res.json(comment);
		});
	});
});

app.get("/post/:pID/comments", function(req, res, next) {
	Post.findById(req.params.pID).exec(function(err, post){
		if(err) return next(err);
		res.json(post.comments);
	});
});

app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message
		}
	});
});

app.listen(port, function() {
	console.log("Listening to the port",port);
});