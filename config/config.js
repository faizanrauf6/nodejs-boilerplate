const dotenv = require("dotenv");
const Joi = require("joi");
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3535),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_EXPIRE: Joi.string()
      .default("1d")
      .description("days after which access tokens expire"),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
    AWS_ACCESS_KEY_ID: Joi.string().required().description("AWS access key id"),
    AWS_SECRET_ACCESS_KEY: Joi.string()
      .required()
      .description("AWS secret access key"),
    AWS_REGION: Joi.string().required().description("AWS region"),
    AWS_BUCKET_NAME: Joi.string().required().description("AWS bucket name"),
    AWS_URL: Joi.string().required().description("AWS url"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationDays: envVars.JWT_EXPIRE,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    awsUrl: envVars.AWS_URL,
    region: envVars.AWS_REGION,
    bucketName: envVars.AWS_BUCKET_NAME,
  },
};
