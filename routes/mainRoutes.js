const express = require("express");
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const controller = require("../controllers/mainController");

router.get("/", controller.getDashboard);
router.get("/dashboard", controller.getDashboard);
router.get("/login", controller.getLogin);
router.get("/users", controller.getUsers);
router.get("/add-user", controller.addUser);
router.get("/errors", controller.getErrors);
router.get("/add-error", controller.addError);
router.get("/clients", controller.getClients);
router.get("/add-client", controller.addClient);
router.get("/add-service", controller.addService);
router.get("/edit-user/:id", controller.editUser);
router.get("/edit-error/:id", controller.editError);
router.get("/edit-client/:id", controller.editClient);
router.get("/service-list", controller.getServices);
router.get("/view-form/:id", controller.viewForm);
router.get("/mailview/:id", controller.getMail);
router.get("/delete-error/:id", controller.deleteError);
router.get("/delete-client/:id", controller.deleteClient);
router.get("/delete-user/:id", controller.deleteUser);
router.get("/approve-reject/:id", controller.approveSheet);

router.post("/login", controller.postLogin);
router.post("/add-user", controller.createUser);
router.post("/add-error", controller.createError);
router.post("/add-client", controller.createClient);
router.post("/add-service", controller.createService);
router.post("/update-user/:id", controller.updateUser);
router.post("/update-error/:id", controller.updateError);
router.post("/update-client/:id", controller.updateClient);
router.post("/approve-reject/:id", controller.approveSheet);
router.post("/import-users",upload.single('csv_file'), controller.ImportUsers);


module.exports = router;
