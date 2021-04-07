"use strict";
const express = require('express');
let router = express.Router();

require('dotenv').config({path: './.env'});

const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Create Customer Route
router
.route("/create-customer")
.get((req, res) => {
	res.redirect('https://www.enrollify.org');
})
.post((req, res) => {

	stripe.customers.create({
		name: req.body.firstname,
		email: req.body.email,
		metadata: {
			company: req.body.company
		}
	})
	.then(customer => {
		res.type('.js');
		res.send({customerID: customer.id});
	})
	.catch(error => console.error(error));

});

// Create Setup Intent Route
router
.route("/create-setupintent")
.get((req, res) => {
	red.redirect('https://www.enrollify.org');
})
.post((req, res) => {

	var setupIntentID;
	var paymentMethodID = req.body.paymentMethodID;
	var customerID = req.body.customerID;

	stripe.setupIntents.create({
		payment_method_types: ['card'],
		payment_method: paymentMethodID ,
		customer: customerID,
	})
	.then(setupIntent => {
		setupIntentID = setupIntent.id;
		confirmSetupIntent(setupIntentID);
	})
	.catch(error => console.error(error));

// Confirm the setup intent
function confirmSetupIntent(setupIntentID){
	stripe.setupIntents.confirm(
		setupIntentID,
		{payment_method: paymentMethodID}
		)
	.then(setupIntent => {
		setupIntentID = setupIntent.id;
		updateCustomer();
	})
	.catch(error => console.error(error));
};

	// Update the customer with the payment method
	function updateCustomer(){
		stripe.customers.update(
			customerID,
			{invoice_settings: {default_payment_method: paymentMethodID}}
			)  
		.then(customer => {
			res.type('.js');
			res.send({customerObject: customer});
		}
		)
		.catch(error => console.error(error));
	};
});

// Create Subscription Route
router
.route('/create-subscription')
.get((req, res) => {
	red.redirect('https://www.enrollify.org');
})
.post((req, res) => {

	var email = req.body.email;
	var contactId;
	var customObjectSub;
	var subscription_id;
	var customer_id;
	var price_id;
	var product_id;
	var firstname;
	var lastname;

	console.log(req.body.email);

	stripe.subscriptions.create({
		customer: req.body.customerID,
		items: [
		{price: req.body.priceID}
		],
		metadata: {
			Company: req.body.company
		}
	})
	.then(subscription => {

		var subscriptionObject = {
			subscriptionID: subscription.id,
			subscriptionAmount: subscription.items.data[0].price.unit_amount,
			subscriptionInterval: subscription.items.data[0].price.recurring.interval,
			invoice: subscription.latest_invoice
		}

		customObjectSub = {
			subscription_id: subscription.id,
			customer_id: subscription.customer,
			price_id: subscription.items.data[0].price.id,
			product_id: subscription.items.data[0].price.product
		};

		res.type('.js');
		res.send({subscriptionOutput: subscriptionObject});
		res.send(console.log(subscriptionObject));
		findContact();
	})
	.catch(error => console.error(error));

// update the contact in HubSpot with subscription info
function findContact(){
	var request = require("request");
	var options = { 
		method: 'GET',
		url: 'https://api.hubapi.com/contacts/v1/contact/email/' + req.body.email + '/profile',
		qs: { hapikey: process.env.HS_API_KEY },
	  	headers: {accept: 'application/json'}
	  };

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		var body = JSON.parse(body);
		contactId = body.vid;
		updateContact(contactId);
	});
}

function updateContact(contactId){
	var request = require("request");

	var options = {
		method: 'PATCH',
		url: 'https://api.hubapi.com/crm/v3/objects/contacts/' + contactId,
		qs: {hapikey: process.env.HS_API_KEY},
		headers: {accept: 'application/json', 'content-type': 'application/json'},
		body: {
			properties: customObjectSub,
		},
		json: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		console.log(body);

	});
};

});


router
.route('/request-invoice')
.get((req, res) => {
	red.redirect('https://www.enrollify.org');
})
.post((req, res) => {
	stripe.invoices.retrieve(
		req.body.invoiceID,
		[]
		)
	.then(invoice => {
		res.type('.js');
		res.send({invoiceLink: invoice.invoice_pdf});
	})
	.catch(error => console.error(error));
});

module.exports = router;
