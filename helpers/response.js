const sendResponse = (
  res,
  status,
  statusCode,
  message,
  data = null,
  token = null,
  pagination = null
) => {
  const response = {
    status: status,
    statusCode: statusCode,
    message: message,
  };

  if (data !== null) {
    response.data = data;
  }
  if (token !== null) {
    response.token = token;
  }
  if (pagination !== null) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendResponse,
};
