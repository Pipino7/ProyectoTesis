const validationMiddleware = (schemaFunction, context = null) => (req, res, next) => {
  const schema = typeof schemaFunction === 'function' ? schemaFunction(context) : schemaFunction;

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, 
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    console.error('❌ Error de validación Joi:', messages);
    return res.status(400).json({
      error: 'Error en la validación',
      details: messages
    });
  }

  req.validated = value; 
  next();
};

export default validationMiddleware;
