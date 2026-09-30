const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorDetails}`,
        errors: parsed.error.format(),
      });
    }
    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
