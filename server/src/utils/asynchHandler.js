
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            return res.status(err.statusCode).json({
                sucess: false,
                statuscode: err.statusCode,
                message: err.message,
                errors: err.errors,
            });
        });
    };
};
export { asyncHandler };

