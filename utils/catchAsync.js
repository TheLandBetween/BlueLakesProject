// Returns a function that accepts a function which then gets executed, and if any errors arise
// they get caught and passed to next
// is used to wrap asyncronous functions.
module.exports = func => { // passing in func function
    return(req, res, next) => { // return a new function
        func(req, res, next).catch(next); // which executes itself calling .catch
    }
};
