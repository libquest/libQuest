const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  // all routes
  app.get("/api/data/all", controller.allAccess);

  // user routes
  app.get("/api/data/user", [authJwt.verifyToken], controller.userBoard);

  // admin routes
  app.get("/api/data/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);
  app.get("/api/data/admin/user/username", [authJwt.verifyToken, authJwt.isAdmin], controller.userList);
  app.get("/api/data/admin/user/email", [authJwt.verifyToken, authJwt.isAdmin], controller.emailList);
  app.get("/api/data/admin/user/id", [authJwt.verifyToken, authJwt.isAdmin], controller.idList);
  app.get("/api/data/admin/user/roles", [authJwt.verifyToken, authJwt.isAdmin], controller.roleList);
  app.get("/api/data/admin/users", [authJwt.verifyToken, authJwt.isAdmin], controller.userJson);
  app.get("/api/data/admin/check", [authJwt.verifyToken, authJwt.isAdmin], controller.roleAdmin);
  app.get("/api/data/admin/user/check", [authJwt.verifyToken, authJwt.isAdmin], controller.roleUser);
};
