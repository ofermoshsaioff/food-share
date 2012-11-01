food-share
==========

The Food Share web app enables you to share what you want to have for lunch, and see what your collegues want to have for lunch as well.
Essentially, its a tool for connecting people to eat or order in lunch together, instead of eating alone.

Development
===========

- FoodShare is still in Beta, but is fairly stable.
- The backend is written in javascript using node.js with several node modules:
	1. express - framework for node.js
	2. mongodb - mongodb client for node.js (mongoHQ for hosting db)
	3. socket.io - websockets implementation for node.js 
	4. ejs - for template rendering
	5. formidable - for form handling
	
- The frontend is written in HTML+CSS3+javascript using Twitter Bootsrap.
- ToDo list specified below.

Dependencies
=======
FoodShare uses serveral node_modules that are listed below, to install each module type: npm install <module_name>
	1. express 
	2. mongodb  
	3. socket.io
	4.ejs
	5.formidable

To Do List
==========

1. Add user authentication mechanism and login page.
2. Add links to user's E-mail and restaurant pages.
3. Implement sticky footer
