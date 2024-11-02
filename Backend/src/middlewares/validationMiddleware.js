const validationMiddleware = (schemaFunction, context = null) => (req, res, next) => {
    const schema = typeof schemaFunction === 'function' ? schemaFunction(context) : schemaFunction;
    const bodyToValidate = { ...req.body };
    delete bodyToValidate.estado; 

    const { error } = schema.validate(bodyToValidate, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        error: `Error en la validación: ${errorMessage}`,
      });
    }
    
    next(); 
};

export default validationMiddleware; 