class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors=[],
        stack=""
    ){
        super(message);
        this.statusCode=statusCode;
        this.message=message
        this.success=false
        this.errors=errors

        if(stack){
            this.stack=stack
        }else{
            // Capture stack trace, omitting the constructor call
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}