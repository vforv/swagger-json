swagger-json
===========

Generate swagger json schema

## Installation
```
npm install swagger-json
```
## Usage

```
const swJson = require('swagger-json');

const info = {
			"version": "1.0.0",
			"title": "Title Example",
			"description": "Description API example",
			"termsOfService": "http://swagger.io/terms/",
			"contact": {
				"name": "Example team"
			},
			"license": {
				"name": "MIT"
			}
		}

const host = 'localhost:3000';

const basePath = '/';
// This will generate initial doc
swJson.swaggerDoc.createJsonDoc(info, host, basePath);

const joiSchema = {
    body: {
        email: Joi.string().email().required().description('Email address for new user').example('vladimir@gmail.com'),
        password: Joi.string().min(7).max(24).required().description('Password for new user').example("Somestrongpasswrod#"),
        salt: Joi.string().required().description('Salt for new user').example('asdsdgdsafs324eqwedagsdfafsdf')
    },
    headers: {
        authorization: Validaiton.tokenValidation.string().token().required().description('Auth tokne').example('asdasfadfasdsasdas')
    },
    model: "Register",
    group: 'Register routes',
    description: 'Route to register user to the system' 
}

// This create new route
swJson.swaggerDoc.addNewRoute(joiSchema, '/v1/user/register', 'post');
```

