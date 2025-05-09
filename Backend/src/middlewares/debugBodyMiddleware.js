const debugBodyMiddleware = (req, res, next) => {
    console.log("🧾 BODY recibido por backend:", JSON.stringify(req.body, null, 2));
    next();
  };
export default debugBodyMiddleware;