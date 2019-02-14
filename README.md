# swagger-json

Generate swagger json schema based on Joi schemas.

## Installation

```bash
npm install swagger-json
```

## Usage

```javascript
const fs = require('fs');
const { swaggerDoc } = require('swagger-json');
const Joi = require('joi');

const host = 'localhost:3000';
const basePath = '/';
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
};

const joiSchema = {
  body: Joi.object({
    email: Joi.string().email().required().description('Email address for new user').example('vladimir@gmail.com'),
    password: Joi.string().min(7).max(24).required().description('Password for new user').example("Somestrongpasswrod#"),
    salt: Joi.string().required().description('Salt for new user').example('asdsdgdsafs324eqwedagsdfafsdf')
  }).meta({ modelName: 'Register' }),
  headers: Joi.object({
    authorization: Validaiton.tokenValidation.string().token().required().description('Auth tokne').example('asdasfadfasdsasdas')
  }),
  group: 'Register routes',
  description: 'Route to register user to the system'
}

// create a new route
swaggerDoc.addNewRoute(joiSchema, '/v1/user/register', 'post');

// get the swagger doc returned as an object
const swaggerSpec = swaggerDoc.createJsonDoc(info, host, basePath);

// now you can write it to the file system or do something else like servie it from express, etc.
fs.write('swagger.json', JSON.stringify(swaggerSpec));
```
