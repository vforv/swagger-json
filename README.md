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
			"title": "VPN Server",
			"description": "VPN Server API",
			"termsOfService": "http://swagger.io/terms/",
			"contact": {
				"name": "VPN team"
			},
			"license": {
				"name": "MIT"
			}
		}

const host = 'localhost:3000';

const basePath = '/';
// This will generate initial doc
swJson.swaggerDoc.createJsonDoc(info, host, basePath);

// This create new route
swJson.swaggerDoc.addNewRoute(joiSchema, path, routeMehtod.method);
```

