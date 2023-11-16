/* Swagger configuration */
const options = {
  openapi: "OpenAPI 3", // Enable/Disable OpenAPI. By default is null
  language: "en-US", // Change response language. By default is 'en-US'
  disableLogs: false, // Enable/Disable logs. By default is false
  autoHeaders: false, // Enable/Disable automatic headers capture. By default is true
  autoQuery: false, // Enable/Disable automatic query capture. By default is true
  autoBody: false, // Enable/Disable automatic body capture. By default is true
};

// const config = require("../config/cloud");
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    version: "1.0.0", // by default: '1.0.0'
    title: "SpeakShift", // by default: 'REST API'
    description: "SpeakShift", // by default: ''
    contact: {
      name: "API Support",
      email: "faizanrauf6@gmail.com",
    },
  },
  host: "localhost:3535", // by default: 'localhost:3535'
  basePath: "/api/v1", // by default: '/'
  schemes: ["http"], // by default: ['http']
  consumes: ["application/json"], // by default: ['application/json']
  produces: ["application/json"], // by default: ['application/json']
  tags: [
    {
      name: "Auth",
      description: "Auth System", // Tag description
    },
    {
      name: "User",
      description: "User Management", // Tag description
    },
    {
      name: "Storage",
      description: "Storage Management", // Tag description
    },
  ],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  }, // by default: empty object
  definitions: {
    user: {
      name: "faizan",
      email: "faizanrauf6@gmail.com",
      password: "123456",
      role: "user",
    },
  }, // by default: empty object (Swagger 2.0)
};

const outputFile = "./doc/swagger.json";
const endpointsFiles = ["../routes/index.js"];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as: app.js, app.js, routes.js, ... */
swaggerAutogen(outputFile, endpointsFiles, doc);

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("../app.js"); // Your project's root file
});
