import AppDataSource from '../config/ConfigDB.js'; 

const dbManagerMiddleware = (req, res, next) => {
  req.manager = AppDataSource.manager;
  next();
};

export default dbManagerMiddleware;
