class ApiError extends Error {
    constructor(
        statuscode,
        message = "Something Went Wrong",
        errors,
        stack = ""
    ) {
        super(message);
        this.statuscode = statuscode;
        this.errors = errors;
        this.data = null;
        this.success = false;
        if (stack) {
            this.stack = stack;
        } else {
            this.stack = Error.captureStackTrace(this, this.constructor);
        }
    }
}
export { ApiError };
