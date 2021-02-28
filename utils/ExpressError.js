class ExpressError extends Error {
    constructor(message, statusCode){
        super();  // Create Error parent class
        this.message = message; // assign passed in message
        this.statusCode = statusCode; // assign passed in status code

        // Add new information here that you want to include in the error.
    }
}

module.exports = ExpressError;
