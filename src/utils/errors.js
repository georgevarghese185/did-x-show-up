
const internalError = (error) => {
  throw {
    code: 500,
    message: "Internal Server Error",
    error
  }
}

const badRequest = (error) => {
  throw {
    code: 400,
    message: "Bad Request",
    error
  }
}

const unauthorized = (error) => {
  throw {
    code: 401,
    message: "Unauthorized",
    error
  }
}


const isSeqeulizeError = e => { return e.name != null && e.errors != null }

const isCodeError = e => {
  return e.error && e.code;
}

const formatError = (e, message) => {
  if(e.error && e.message && e.description) {
    return e;
  }

  if(typeof e !== "string") {
    e = e.toString();
    console.trace(e);
  }

  return {
    error: true,
    message: message || "Unexpected Error",
    description: e
  };
}



const sequelizeError = e => {
  let name = e.name;
  let errors = e.errors
    .map(error => { return error.message })
    .reduce((acc, error) => {
      return acc + ", " + error;
    });

  return {
    error: true,
    message: "Internal Server Error",
    description: `${name}: ${errors}`
  };
}

const codeError = (resp, e) => {
  resp.status(e.code);
  resp.send(formatError(e.error, e.message));
}

const errorHandler = (resp) => {
  return e => {
    console.log("ERROR " + JSON.stringify(e));
    if(isSeqeulizeError(e)) {
      resp.status(500);
      resp.json(sequelizeError(e));
    } else if(isCodeError(e)) {
      codeError(resp, e);
    } else {
      resp.status(500);
      resp.json(formatError(e));
    }
  }
}

module.exports = {
  errorHandler,
  sequelizeError,
  internalError,
  badRequest,
  unauthorized
}
