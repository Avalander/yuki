module.exports.runWith = (cmd, {
  text,
  message,
  options,
}) => (text_ = text, message_ = message, options_ = options) =>
  cmd(text_, message_, options_)
