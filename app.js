"use strict";

// Declare variables here
const express = require("express");
const cors = require('cors');
const app = express();
const https = require('https');
const port = process.env.PORT || 3000;
const checkout = require('./routes/checkout');

// All access from all origins
app.use(cors());

// Allows app to handle JSON POST data
app.use(express.json());

// use checkout.js file to handle endpoints with /checkout
app.use("/checkout", checkout);

// For the home route
app.get("/", (req, res) => {
	res.send("Error");
});


app.listen(port, err => {
	if (err) {
		return console.log("ERROR", err);
	}
	console.log(`Example app listening at http://localhost:${port}`)
})
