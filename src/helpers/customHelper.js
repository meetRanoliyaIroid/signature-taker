class CustomHelper {
  static success(res, message = "Success", data = null, meta = null) {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    return res.status(200).json(response);
  }

  static error(res, message = "Something went wrong", statusCode = 422) {
    return res.status(statusCode).json({ success: false, message });
  }
}

export default CustomHelper;
