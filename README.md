This code allows you to create a [Reveal.js](http://lab.hakim.se/reveal-js) presentation, controlled by hand motions through a [LeapMotion](https://www.leapmotion.com) device. Using [SendGrid](http://www.sendgrid.com), you can conduct a live voting session where votes are cast via email and updated in real-time using [express](http://expressjs.com/), [socket.io](http://socket.io) and [Highcharts.js](http://www.highcharts.com).

There will be a [companion blog post](http://sendgrid.com/blog) at SendGrid's blog. When it's live I will update the link here.

## Prerequisites ##

* [LeapMotion hardware](https://www.leapmotion.com) - if you want to control your slides using hand motions
* [SendGrid account](http://www.sendgrid.com)

This software was tested on a Macbook Pro Retina and a Macbook Air, both running Mavericks.

## Usage ##

* rename .EXAMPLE.env to .env and update the credentials
* setup your [Incoming Parse API webhook](http://sendgrid.com/docs/API_Reference/Webhooks/parse.html)
* use grunt to run the app
* a complete setup guide will be posted on the [SendGrid blog](http://sendgrid.com/blog) shortly

## Info & Help ##

If you create something cool with this code, let us know so we can include you in the [SendGrid Developer Community](http://sendgrid.com/developers/developers).

Please let me know how I can improve this tutorial with a pull request or open an issue. Happy Hacking!