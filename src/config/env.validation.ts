import Joi from 'joi';

export const envValidationSchema = Joi.object({
  // JWT (seu login)
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_TTL: Joi.number().integer().positive().default(3600),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),

  AUTH_HEADER: Joi.string().default('admgestao'),

  // crypto response
  RESPONSE_ENC_KEY_BASE64: Joi.string().required(),
  RESPONSE_ENCRYPTION_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),
});
