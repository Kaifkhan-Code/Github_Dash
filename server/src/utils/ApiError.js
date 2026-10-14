// Small error class so routes can say "this is a 404" and the
// error middleware knows what status code to send back.
export default class ApiError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}
