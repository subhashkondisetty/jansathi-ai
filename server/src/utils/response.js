export const sendSuccess = (res, data, meta = undefined, status = 200) => {
  const payload = {
    success: true,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
};
