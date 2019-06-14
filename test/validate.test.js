const expect = require('chai').expect;
const { describe, it, before } = require('mocha');
const joi = require('joi');
const { swaggerDoc } = require('../');
const info = {
  version: '1.0.0',
  title: 'dummy api',
  description: 'an example api',
};
swaggerDoc.createJsonDoc(info, 'http://localhost:4000', '/');

describe('adding a new GET route', () => {
  const schema = {
    query: joi.object({
      id: joi.number().integer().required().description("user's id"),
    }),
    description: 'get user by id',
  };

  const { paths } = swaggerDoc.addNewRoute(schema, '/v1/user', 'get');
  const userPath = paths['/v1/user'];

  it('should use the description to build a summary', async () => {
    expect(userPath.get.summary).to.equal('get user by id');
  });

  it('should have a default tag', async () => {
    expect(userPath.get.tags).to.deep.equal(['default']);
  });

  it('should map a default response', async () => {
    expect(userPath.get.responses).to.deep.equal({
      '200': {
        description: 'success',
      },
    });
  });

  it('should map query parameters to parameters', () => {
    const queryParams = userPath.get.parameters.filter(x => x.in === 'query');
    expect(queryParams).to.deep.equal([{
      in: 'query',
      name: 'id',
      type: 'integer',
      description: "user's id",
    }]);
  });

  it('should prevent me from adding a duplicate path', () => {
    const result = swaggerDoc.addNewRoute(schema, '/v1/user', 'get');
    expect(result).to.equal(false);
  });

  it('should transform express path params to swagger path params', async () => {
    const schema = {
      query: joi.object({
        id: joi.number().integer().required().description("id of the post to retrieve"),
      }),
    };

    const { paths } = swaggerDoc.addNewRoute(schema, '/user/:userId/auth_token', 'post');

    expect(Object.keys(paths)).to.include('/user/{userId}/auth_token');
  });
});

describe('adding a new POST route', () => {
  const schema = {
    params: joi.object({
      organization: joi.number().integer().required().description("user's organization"),
    }),
    body: joi.object({
      firstName: joi.string().required().description('first name for the user'),
      lastName: joi.string().required().description('last name for the user'),
      email: joi.string().email().required().description('you gunna get spammed'),
    }).meta({ modelName: 'userModel' }),
    headers: joi.object({
      'Content-Type': joi.string().default('application/json').optional(),
    }),
    description: 'create a user',
  };

  const { paths, definitions } = swaggerDoc.addNewRoute(schema, '/{organization}/create-user', 'post');
  const postPath = paths['/{organization}/create-user'];

  it('should map params to path parameters', async () => {
    const pathParams = postPath.post.parameters.filter(x => x.in === 'path');

    expect(pathParams).to.deep.equal([{
      in: 'path',
      name: 'organization',
      type: 'integer',
      description: "user's organization",
    }]);
  });

  it('should map body params to body parameters', async () => {
    const bodyParams = postPath.post.parameters.filter(x => x.in === 'body');

    expect(bodyParams).to.deep.equal([{
      in: 'body',
      name: 'body',
      schema: {
        $ref: '#/definitions/userModel',
      }
    }]);
  });

  it('should have created a model definition for the body', async () => {
    expect(definitions.userModel).to.deep.equal({
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'email',
      ],
      properties: {
        firstName: {
          type: 'string',
          description: 'first name for the user'
        },
        lastName: {
          type: 'string',
          description: 'last name for the user'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'you gunna get spammed'
        }
      }
    });
  });

  it('should be able to map headers', async () => {
    const headerParams = postPath.post.parameters.filter(x => x.in === 'header');
    expect(headerParams).to.deep.equal([{
      in: 'header',
      name: 'Content-Type',
      type: 'string',
      default: 'application/json',
    }]);
  });

  it('should create a default model name if one was not provided', async () => {
    const schema = {
      body: joi.object({
        firstName: joi.string()
      }),
    };
    const { paths, definitions } = swaggerDoc.addNewRoute(schema, '/create-person', 'post');
    expect(paths['/create-person'].post.parameters[0].schema.$ref).to.match(/\#\/definitions\/\d+/);

    const ref = paths['/create-person'].post.parameters[0].schema.$ref.split('/');
    const modelName = ref[ref.length-1];

    expect(definitions[modelName]).to.deep.equal({
      type: 'object',
      properties: {
        firstName: { type: 'string' },
      },
    });
  });
});

describe('adding a POST route with the same path as an exiting GET route', () => {
  const postSchema = {
    body: joi.object({
      firstName: joi.string().required().description('first name for the user'),
      lastName: joi.string().required().description('last name for the user'),
    }).meta({ modelName: 'superUserModel' }),
    headers: joi.object({
      'Content-Type': joi.string().default('application/json').optional(),
    }),
    description: 'create a super user',
  };

  const getSchema = {
    headers: joi.object({
      'Content-Type': joi.string().default('application/json').optional(),
    }),
    description: 'get the super user',
  }

  swaggerDoc.addNewRoute(getSchema, '/super-user', 'get');
  const { paths } = swaggerDoc.addNewRoute(postSchema, '/super-user', 'post');

  it('should have added the post path without overwriting the get', () => {
    expect(paths['/super-user'].post.summary).to.equal('create a super user');
    expect(paths['/super-user'].get.summary).to.equal('get the super user');
  });
});

describe('describing an output model', () => {
  const schema = {
    query: joi.object({
      id: joi.number().integer().required().description("id of the post to retrieve"),
    }),
    description: 'get post by id',
    response: joi.object({ name: joi.string(), content: joi.string() }).meta({ modelName: 'blogPost' }),
  };
  const { paths, definitions } = swaggerDoc.addNewRoute(schema, '/posts/:id', 'get');
  const getPostPath = paths['/posts/{id}'];

  it("should add a model reference to describe the path's output schema", async () => {
    expect(getPostPath.get.responses['200']).to.deep.equal({
      description: 'success',
      schema: { $ref: '#/definitions/blogPost' },
    });
  });

  it('should have created a definition for the output model', async () => {
    expect(definitions.blogPost).to.deep.equal({
      type: 'object',
      properties: {
        content: { type: 'string' },
        name: { type: 'string' },
      },
    });
  });

  it('should create a default model name if one was not provided', async () => {
    const schema = {
      response: joi.object({ name: joi.string(), content: joi.string() }),
    };
    const { paths, definitions } = swaggerDoc.addNewRoute(schema, '/runningOutOfPathNames', 'get');
    const path = paths['/runningOutOfPathNames'];

    expect(path.get.responses[200].schema.$ref).to.match(/\#\/definitions\/\d+/);

    const ref = paths['/runningOutOfPathNames'].get.responses[200].schema.$ref.split('/');
    const modelName = ref[ref.length-1];

    expect(Object.keys(definitions)).to.include(modelName);
  });
});

describe('#createJsonDoc', () => {
  it('should be able to be called at the very end', async () => {
    const schema = {
      query: joi.object({
        id: joi.number().integer().required().description("id of the post to retrieve"),
      }),
      description: 'get post by id',
      response: joi.object({ name: joi.string(), content: joi.string() }).meta({ modelName: 'blogPost' }),
    };

    const addNewRouteOutput = swaggerDoc.addNewRoute(schema, '/swagger/examples', 'get');
    const createJsonDocOutput = swaggerDoc.createJsonDoc(info, 'http://localhost:4000', '/');

    expect(addNewRouteOutput).to.deep.equal(createJsonDocOutput);
  });
});
