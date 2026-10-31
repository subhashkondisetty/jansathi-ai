import crypto from 'node:crypto';

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export const requestId = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];

  const id =
    typeof incomingId === 'string' && SAFE_REQUEST_ID_REGEX.test(incomingId)
      ? incomingId
      : crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);

  next();
};

export default requestId;
