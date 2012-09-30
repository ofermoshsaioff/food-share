food-share
==========

The Food Share web app enables you to share what you want to have for lunch, and see what your collegues want to have for lunch as well.
Essentially, its a tool for connecting people to eat or order in lunch together, instead of eating alone.

Development
===========

- FoodShare is still in Beta, but is fairly stable.
- The backend is written in javascript using node.js with several node modules:
	1. express - framework for node.js
	2. cradle - couchdb client for node.js
	3. socket.io - websockets implementation for node.js 
	4. ejs - for template rendering
	5. formidable - for form handling
- The frontend is written in HTML+CSS3+javascript using Twitter Bootsrap.
- ToDo list specified below.

License
=======

TBA

To Do List
==========

1. Add user authentication mechanism and login page.
2. Filter results for the specific date.
3. Add links to user's E-mail and restuarant pages.
4. Fix MapReduce function bug with rereduce.
5. Move to mongoDB and mongoJS + cloud hosting solution (mongoHQ)
6. Implement sticky footer
