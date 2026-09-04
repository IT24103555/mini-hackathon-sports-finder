import Joi from 'joi';

const username = Joi.string().trim().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(30).required().messages({
  'string.empty': 'Username is required.',
  'string.pattern.base': 'Username must use only letters, numbers, or underscores.',
  'string.min': 'Username must be at least 3 characters.',
  'string.max': 'Username must be at most 30 characters.'
});

const password = Joi.string().min(8).max(128).required().messages({
  'string.empty': 'Password is required.',
  'string.min': 'Password must be at least 8 characters.',
  'string.max': 'Password must be at most 128 characters.'
});

export const loginSchema = Joi.object({ username, password }).options({ stripUnknown: true });

export const registerSchema = Joi.object({
  username,
  password,
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
    'any.required': 'Password confirmation is required.'
  })
}).options({ stripUnknown: true });

export const gameSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Title is required.',
    'string.max': 'Title must be at most 100 characters.'
  }),
  sport: Joi.string().valid('Cricket', 'Football', 'Volleyball').required().messages({
    'any.only': 'Sport must be Cricket, Football, or Volleyball.'
  }),
  location: Joi.string().trim().min(1).max(160).required().messages({
    'string.empty': 'Location is required.',
    'string.max': 'Location must be at most 160 characters.'
  }),
  startTime: Joi.date().iso().required().messages({
    'date.format': 'Start time must be a valid ISO datetime.',
    'date.base': 'Start time must be a valid datetime.'
  }),
  deadlineTime: Joi.date().iso().required().messages({
    'date.format': 'Deadline must be a valid ISO datetime.',
    'date.base': 'Deadline must be a valid datetime.'
  }),
  maxPlayers: Joi.number().integer().min(2).max(100).required().messages({
    'number.base': 'Maximum players must be a whole number.',
    'number.min': 'Maximum players must be at least 2.',
    'number.max': 'Maximum players cannot exceed 100.'
  })
}).options({ stripUnknown: true });

export const roleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin').required().messages({
    'any.only': 'Role must be user or admin.',
    'any.required': 'Role is required.'
  })
}).options({ stripUnknown: true });

export function validateRequest(schema, req, res) {
  const { error, value } = schema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    const errors = Object.fromEntries(error.details.map((detail) => [detail.path[0], detail.message]));
    res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
    return null;
  }
  req.body = value;
  return value;
}
