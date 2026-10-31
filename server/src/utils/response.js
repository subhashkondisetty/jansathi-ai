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

export const sendPaginated = (res, items, { page, limit, total }, status = 200) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 12);
  const totalNum = Math.max(0, Number(total) || 0);
  const totalPages = Math.ceil(totalNum / limitNum) || 1;

  return sendSuccess(
    res,
    items,
    {
      page: pageNum,
      limit: limitNum,
      total: totalNum,
      totalPages,
    },
    status
  );
};

export const sendError = (res, { code, message, details, requestId }, status = 500) => {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    payload.error.details = details;
  }

  if (requestId) {
    payload.error.requestId = requestId;
  }

  return res.status(status).json(payload);
};
