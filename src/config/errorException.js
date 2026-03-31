export class BadRequestException extends Error {
  constructor(message = "Bad Request") {
    super(message);
    this.statusCode = 400;
  }
}

export class NotFoundException extends Error {
  constructor(message = "Not Found") {
    super(message);
    this.statusCode = 404;
  }
}

export class UnprocessableEntityException extends Error {
  constructor(message = "Unprocessable Entity") {
    super(message);
    this.statusCode = 422;
  }
}

export class InternalServerError extends Error {
  constructor(message = "Internal Server Error") {
    super(message);
    this.statusCode = 500;
  }
}
