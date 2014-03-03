This code allows you to create a [Reveal.js](http://lab.hakim.se/reveal-js) presentation, controlled by hand motions through a [LeapMotion](https://www.leapmotion.com) device. Using [SendGrid](http://www.sendgrid.com), you can conduct a live voting session where votes are cast via email and updated in real-time using [express](http://expressjs.com), [socket.io](http://socket.io) and [Highcharts.js](http://www.highcharts.com).

There will be a [companion blog post](http://sendgrid.com/blog) at SendGrid's blog. When it's live I will update the link here.

## Prerequisites ##

* [LeapMotion hardware](https://www.leapmotion.com) - if you want to control your slides using hand motions
* [SendGrid account](http://www.sendgrid.com)

This software was tested on a Macbook Pro Retina and a Macbook Air, both running Mavericks. If you test on Linux or Windows, please let me know the results.

## Usage ##

* clone this repository
* create a local MySQL database, the schema is at DB/votes.sql
* rename .EXAMPLE.env to .env and update the credentials
* run npm install in the root directory of the project
* run grunt
* run ngrock 3000
* setup your [Incoming Parse API webhook](http://sendgrid.com/docs/API_Reference/Webhooks/parse.html) in your SendGrid account
	* setup your hostname and MX records per [these instructions](http://sendgrid.com/docs/API_Reference/Webhooks/parse.html)
	* e.g. 
		* my hostname is elmer.bymail.in
		* my URL is https://38b1f7bz.ngrok.com/inbound
	* for more help on setup, check the [docs](http://sendgrid.com/docs/API_Reference/Webhooks/parse.html) or reach out to me.
* go to http://localhost:3000 and try using the leapmotion to navigate to the next page (voting)
	* currently, you can swipe backwards/forwards/up/down and point for a simulated laser pointer. 
* send an email to inbound@the-host-you-setup-for-the-parse-webhook (e.g. mine would be inbound@elmer.bymail.in) with Python as the subject, the vote should register automatically in a few seconds
* check your email inbox for an email from community@sendgrid.com. Say hi :)
* check your DB and verify the new entry
* modify the slides at views/index.html and keep your assets in the /public folder

## Info & Help ##

If you create something cool with this code, let us know so we can include you in the [SendGrid Developer Community](http://sendgrid.com/developers/developers).

Please let me know how I can improve this tutorial with a pull request or open an issue. Happy Hacking!
