export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  let message = err.message || "Server error";
  
  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }
  
  // Handle mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} is already in use`;
  }
  
  // Handle mongoose cast error
  if (err.name === "CastError") {
    message = "Invalid ID format";
  }

  // Log error in development and production
  if (process.env.NODE_ENV !== "production") {
    console.error("[Error]", {
      status: statusCode,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Log errors in production but don't expose stack trace
    console.error(`[Error] [${new Date().toISOString()}] ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
};
