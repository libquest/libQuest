exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  getUserCount().then(function (user_count) {
    res.status(200).json({ user_count: user_count });
  });
};

exports.userList = (req, res) => {
  getUsername().then(function (username) {
    res.status(200).json(username);
  });
};

exports.idList = (req, res) => {
  getID().then(function (id) {
    res.status(200).json(id);
  });
};

exports.roleList = (req, res) => {
  getRoles().then(function (roles) {
    res.status(200).json(roles);
  });
};

exports.emailList = (req, res) => {
  getEmail().then(function (email) {
    res.status(200).json(email);
  });
};

exports.userJson = (req, res) => {
  getUserJson().then(function (jsonFile) {
    res.status(200).json(jsonFile);
  });
};

exports.roleAdmin = (req, res) => {
  getAdmin().then(function (isAdmin) {
    res.status(200).json(isAdmin);
  });
};

exports.roleUser = (req, res) => {
  getUser().then(function (isUser) {
    res.status(200).json(isUser);
  });
};
