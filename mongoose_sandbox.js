'use strict';

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/sandbox");

var db = mongoose.connection;

db.on("error", function(err){
	console.error("Error occured",err);
});

db.on("open", function(){
	console.log("Database successfully connected");

	var Schema = mongoose.Schema;

	var AnimalSchema = new Schema({
		type:  {type: String, default: "Mamel"},
		color: {type: String, default: "Blue"},
		size:  String,
		mass:   {type: Number, default: 10},
		name:  {type: String, default: "Whale"}
	});

	AnimalSchema.pre("save", function(next){
		if (this.mass >= 100) {
			this.size = "big";
		} else if (this.mass >=10 && this.mass < 100 ) {
			this.size = "meidum";
		} else {
			this.size = "small";
		}
		next();
	});

	AnimalSchema.statics.findSize = function(size, callback) {
		this.find({size: size},callback);
	}

	var Animal = mongoose.model("Animal",AnimalSchema);

	var elephant = new Animal({
		type: "animal",
		color: "black",
		mass: 250,
		name: "elephant"
	});

	var animal = new Animal({});

	var animalsList = [
		{
			type: "Bird",
			color: "black",
			mass: 10,
			name: "crow"
		},
		{
			type: "Reptail",
			color: "black",
			mass: 30,
			name: "cobra"
		},
		{
			type: "Dog",
			color: "White",
			mass: 40,
			name: "german shepard"
		},
		animal,
		elephant
	];

	Animal.remove({}, function(err) {
		if(err) console.log("Error in connection",err);
		Animal.create(animalsList, function(err){
			if(err) console.log("Error in connection",err);
			Animal.findSize("small", function(err, animals) {
				if(err) console.log("Error in connection",err);
				animals.forEach(function(animal){
					console.log(animal.name + " " +animal.type + " " +animal.color);
				});
				db.close(function(){
					console.log("Database successfully closed")
				});
			});
		});
	});

});