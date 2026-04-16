module.exports = async function handler(req, res) {
  const mod = await import("../getdressai/api/outfit.js");
  return mod.default(req, res);
};
