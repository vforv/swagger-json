const fs = require('fs');
const joi = require('joi');
const swaggerJson = require('./swagger-json');
const j2s = require('joi-to-swagger');

class Swagger {
    createJsonDoc(info, host, basePath) {
        let swaggerData = swaggerJson.get;

        if (info) {
            swaggerData = {
                ...swaggerData,
                info
            }
        }

        if (host) {
            swaggerData = {
                ...swaggerData,
                host
            }
        }

        if (basePath) {
            swaggerData = {
                ...swaggerData,
                basePath
            }
        }
        
        return fs.writeFileSync('swagger.json', JSON.stringify(swaggerData));
    }

    addNewRoute(joiDefinistions, path, method) {
        const swaggerData = fs.readFileSync('swagger.json', 'utf-8');
        const { definitions, paths, ...otherData } = JSON.parse(swaggerData);
        const name = joiDefinistions.model || Date.now();
        const toSwagger = j2s(joiDefinistions).swagger;

        const updatedDefinitions = {
            ...definitions,
            [name]: toSwagger
        }

        const pathArray = path.split(':');
        const transformPath = pathArray.map((path) => {
            if (path != pathArray[0]) {
                if (path.substr(path.length - 1) === '/') {
                    return `{${path.slice(0, -1)}}/`;
                }
                return `{${path}}`;
            }

            return path;
        })
            .join('');

        const parameters = [];

        const { body, params, query, headers } = joiDefinistions;

        if (body) {
            parameters.push({
                "in": "body",
                "name": "body",
                "description": "Pet object that needs to be added to the store",
                "required": true,
                ...toSwagger.properties.body
            })
        }

        if (params) {
            const getParams = [];
            const rxp = /{([^}]+)}/g;
            let curMatch;

            while (curMatch = rxp.exec(transformPath)) {
                getParams.push(curMatch[1]);
            }

            getParams.forEach((param) => {
                parameters.push({
                    "name": param,
                    "in": "path",
                    "description": "ID of pet to return",
                    "required": true,
                    ...toSwagger.properties.params.properties[param]
                })
            })

        }

        if (query) {
            const keys = Object.keys(toSwagger.properties.query.properties).map((key) => key);

            keys.forEach((key) => {
                parameters.push({
                    "in": "query",
                    "name": key,
                    "description": "Pet object that needs to be added to the store",
                    "required": true,
                    ...toSwagger.properties.query.properties[key]
                })
            })
        }

        if (headers) {
            const keys = Object.keys(toSwagger.properties.headers.properties).map((key) => key);
            keys.forEach((key) => {
                parameters.push({
                    "in": "header",
                    "name": key,
                    "description": "Pet object that needs to be added to the store",
                    "required": true,
                    ...toSwagger.properties.headers.properties[key]
                })
            })
        }
        const updatePaths = {
            ...paths,
            [transformPath]: {
                [method]: {
                    responses:
                        {
                            200: {
                                description: "success"
                            }
                        },
                    parameters,
                }
            }
        }

        const newData = {
            ...otherData,
            definitions: updatedDefinitions,
            paths: updatePaths
        }

        return fs.writeFileSync('swagger.json', JSON.stringify(newData));
    }
};

exports.swaggerDoc = new Swagger();
