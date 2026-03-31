const errorHandler = (err, req, res, next) => {
  // Joi validation errors
  if (err && err.error && err.error.isJoi) {
    const message = err.error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(422).json({ success: false, message });
  }

  // Custom exceptions (BadRequestException, NotFoundException, etc.)
  if (err && err.statusCode) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  // Unexpected errors
  console.error("Unhandled Error:", err);
  return res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
};

export default errorHandler;
