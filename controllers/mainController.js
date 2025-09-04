// const User = require('../models/mainModel');
const User = require("../models/User");
const Client = require("../models/Client");
const ServiceSheet = require("../models/ServiceSheet");
// const { sendApprovalEmail } = require("../utils/mailer");
const Issue = require("../models/Issue");
const bcrypt = require("bcrypt");
const fs = require("fs");
require("dotenv").config();
const path = require("path");
const { parse } = require('csv-parse/sync');
const puppeteer = require("puppeteer"); // For PDF generation
const { sendApprovalEmailWithAttachment } = require("../utils/mailer"); // Custom email sender with attachment

exports.getDashboard = async (req, res) => {
  try {
    const total_users = await User.countDocuments();
    const total_clients = await Client.countDocuments({ isactive: "1" });
    const total_service = await ServiceSheet.countDocuments();
    const total_issues = await Issue.countDocuments();

    // Fetch all issues to create label-value pairs
    const allIssues = await Issue.find(
      {},
      { error_code: 1, description: 1 }
    ).lean();
    const labels = allIssues.map(
      (issue) => `${issue.description} - ${issue.error_code}`
    );
    const allIssueTypes = await ServiceSheet.distinct("issue_type"); // Get unique issue_type values

    const data = await Promise.all(
      allIssueTypes.map(async (type) => {
        const count = await ServiceSheet.countDocuments({ issue_type: type });
        return count;
      })
    );

    res.render("dashboard", {
      labels,
      data,
      currentRoute: "dashboard",
      total_users,
      total_clients,
      total_service,
      total_issues,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send("Server Error");
  }
};

// GET Login Page
exports.getLogin = (req, res) => {
  res.render("login", {
    currentRoute: "login",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// POST Login Handler
exports.postLogin = (req, res) => {
  const { username, password } = req.body;

  // Example logic
  if (username !== "admin" || password !== "1234") {
    req.flash("error", "Invalid username or password");
    return res.redirect("/login");
  }

  req.flash("success", "Login successful");
  res.redirect("/dashboard");
};

// GET User Page
exports.getUsers = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
      // return res.redirect('/login');
    }

    // Fetch active users (not deleted)
    const records = await User.find({
      deleted_at: null,
      active: true,
    });

    res.render("users", {
      currentRoute: "users",
      title: "Users",
      records,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    req.flash("error", "Unable to load users");
    res.redirect("/dashboard");
  }
};

// GET Clients Page
exports.getClients = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
      // return res.redirect('/login');
    }

    // Fetch active users (not deleted)
    const records = await Client.find();

    res.render("clients", {
      currentRoute: "clients",
      title: "Clients",
      records,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    req.flash("error", "Unable to load clients");
    res.redirect("/dashboard");
  }
};

// GET Errors Page
exports.getErrors = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
      // return res.redirect('/login');
    }

    // Fetch active users (not deleted)
    const records = await Issue.find();

    res.render("errors", {
      currentRoute: "errors",
      title: "Issues",
      records,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching Errors:", err);
    req.flash("error", "Unable to load Errors");
    res.redirect("/dashboard");
  }
};

// Get Service list
exports.getServices = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
      // return res.redirect('/login');
    }

    // Fetch active users (not deleted)
    const records = await ServiceSheet.find();

    res.render("service_list", {
      currentRoute: "service-list",
      title: "Service List",
      records,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching Service List", err);
    req.flash("error", "Unable to load Service List");
    res.redirect("/dashboard");
  }
};

exports.addUser = (req, res) => {
  res.render("add_user", {
    currentRoute: "login",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.addClient = (req, res) => {
  res.render("add_client", {
    currentRoute: "login",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.addError = (req, res) => {
  res.render("add_error", {
    currentRoute: "login",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.addService = async (req, res) => {
  const Issues = await Issue.find();
  // console.log(Issues);
  res.render("add_service", {
    sections: {
      "DC Side": [
        "dc_module_earthing",
        "dc_fuse",
        "dc_mc4_connector",
        "dc_loose_wires",
        "dc_voltage",
        "dc_current",
        "dc_loose_connection",
      ],
      "AC Side": [
        "ac_line_voltage",
        "ac_line_current",
        "ac_pn_voltage",
        "ac_islanding_test",
        "ac_loose_connection",
      ],
      Earthing: ["earthing_resistance"],
      "Auto Cleaning System": [
        "auto_timer_program",
        "auto_sprinkler",
        "auto_solenoid_valve",
      ],
      Mounting: [
        "mount_mid_clamp",
        "mount_end_clamp",
        "mount_spring_nut",
        "mount_intensity_strength",
        "mount_corrosion",
      ],
      Thermography: [
        "thermo_hotspot_modules",
        "thermo_hotspot_inverter",
        "thermo_hotspot_switchgear",
      ],
      Miscellaneous: [
        "misc_cable_tie",
        "misc_safety_signs",
        "misc_anti_rust_paint",
      ],
    },
    issue_master: Issues,
    currentRoute: "login",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// Edit block
exports.editUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).lean();
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users");
    }

    res.render("edit_user", {
      currentRoute: "edit_user",
      title: "Edit User",
      user,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Edit User Error:", err);
    req.flash("error", "Unable to load user");
    res.redirect("/users");
  }
};

exports.editClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const clientData = await Client.findById(clientId).lean();

    if (!clientData) {
      req.flash("error", "Client not found");
      return res.redirect("/clients");
    }

    res.render("edit_client", {
      currentRoute: "edit-client",
      clientData,
      errorMsg: req.flash("error"),
      successMsg: req.flash("success"),
    });
  } catch (err) {
    console.error("Edit Client Error:", err);
    req.flash("error", "Unable to load client");
    res.redirect("/clients");
  }
};

exports.editError = async (req, res) => {
  try {
    const errorId = req.params.id;
    const errorData = await Issue.findById(errorId).lean();

    if (!errorData) {
      req.flash("error", "Error record not found");
      return res.redirect("/errors");
    }

    res.render("edit_error", {
      currentRoute: "edit-error",
      errorData,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Edit Error Record Error:", err);
    req.flash("error", "Unable to load error record");
    res.redirect("/errors");
  }
};
// edit block end

exports.createUser = async (req, res) => {
  try {
    const { name, username, email, mobile, role, password } = req.body;

    // Basic validation
    if (!name || !username || !email || !mobile || !role || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/add-user");
    }

    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash("error", "Username already exists.");
      return res.redirect("/add-user");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      username,
      email,
      mobile,
      role,
      password: hashedPassword,
    });

    await newUser.save();

    req.flash("success", "User created successfully.");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/add-user");
  }
};

exports.createClient = async (req, res) => {
  try {
    const {
      client_name,
      company_name,
      email_address,
      mobile,
      address,
      description,
      isactive,
    } = req.body;

    if (
      !client_name ||
      !company_name ||
      !email_address ||
      !mobile ||
      !address ||
      !description
    ) {
      req.flash("error", "All fields are required.");
      return res.redirect("/add-client");
    }

    const existingClient = await Client.findOne({ email_address });
    if (existingClient) {
      req.flash("error", "Client with this email already exists.");
      return res.redirect("/add-client");
    }

    const newClient = new Client({
      client_name,
      company_name,
      email_address,
      mobile,
      address,
      description,
      isactive: isactive || 1,
    });

    await newClient.save();

    req.flash("success", "Client created successfully.");
    res.redirect("/clients");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/add-client");
  }
};

exports.createError = async (req, res) => {
  try {
    const { error_code, description } = req.body;

    if (!error_code || !description) {
      req.flash("error", "Error code and description are required.");
      return res.redirect("/add-error");
    }

    const newError = new Issue({
      error_code,
      description,
      created_at: new Date(),
      active: true,
    });

    await newError.save();

    req.flash("success", "Error logged successfully.");
    res.redirect("/errors");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/add-error");
  }
};

exports.createService = async (req, res) => {
  try {
    // Step 1: Define checkbox fields expected as Boolean
    const booleanFields = [
      "thermo_hotspot_modules",
      "thermo_hotspot_inverter",
      "misc_safety_signs",
      "misc_anti_rust_paint",
      "other_fault_analysis",
      "other_function_check",
      "ser_quarterly",
      "ser_emergency",
      "ser_ad_hoc",
      "ser_client_call",
      "ser_module_cleaning",
      "dc_module_earthing",
      "dc_fuse",
      "dc_mc4_connector",
      "dc_loose_wires",
      "dc_voltage",
      "dc_current",
      "dc_loose_connection",
      "ac_line_voltage",
      "ac_line_current",
      "ac_pn_voltage",
      "ac_islanding_test",
      "ac_loose_connection",
      "earthing_resistance",
      "auto_timer_program",
      "auto_sprinkler",
      "auto_solenoid_valve",
      "mount_mid_clamp",
      "mount_end_clamp",
      "mount_spring_nut",
      "mount_intensity_strength",
      "mount_corrosion",
      "thermo_hotspot_modules",
      "thermo_hotspot_inverter",
      "thermo_hotspot_switchgear",
      "other_fault_analysi",
      "other_function_chec",
      "misc_cable_tie",
      "misc_safety_signs",
      "misc_anti_rust_paint",
    ];

    //Step 2: Normalize checkbox values
    function normalizeCheckboxes(body, fields) {
      fields.forEach((field) => {
        body[field] = body[field] === "on";
      });
      return body;
    }
    const serviceData = normalizeCheckboxes(req.body, booleanFields);

    serviceData.issue_type = req.body.issue_type;

    // Step 3: Create and save the document
    const newService = new ServiceSheet(serviceData);
    await newService.save();

    req.flash("success", "Service data inserted successfully");
    res.redirect("/service-list");
  } catch (err) {
    console.error("Insert Error:", err.message, err.errors);
    res.status(500).json({ error: "Server error" });
  }
};

exports.viewForm = async (req, res) => {
  try {
    // Enforce login check
    if (!req.session.isLoggedIn) {
      // req.flash('error', 'Please log in to view this page');
      // return res.redirect('/login');
    }

    // Validate ID format before querying
    const serviceId = req.params.id;
    if (!serviceId || !serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      // req.flash('error', 'Invalid service ID');
      return res.redirect("/service-list");
    }

    // Fetch service record by ID
    const record = await ServiceSheet.findById(serviceId);
    if (!record) {
      req.flash("error", "Service record not found");
      return res.redirect("/service-list");
    }

    // const issue = await Issue.findById(record['issue_type']);
    const issuedata = await Issue.findOne({ error_code: record.issue_type }).select('description');
    let issue = issuedata.description;

    // console.log(record.issue_type);
    // console.log(issue);
    // Render view with fetched data
    res.render("viewform", {
      currentRoute: "view-form",
      title: "View Service",
      issue,
      record,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching Service:", err.message);
    req.flash("error", "Unable to load Service");
    res.redirect("/service-list");
  }
};

exports.getMail = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const record = await ServiceSheet.findById(serviceId);
    const issuedata = await Issue.findOne({ error_code: record.issue_type }).select('description');
    let issue = issuedata.description;
    res.render("mailview", {
      baseUrl: process.env.BASE_URL,
      currentRoute: "view-form",
      title: "View Service",
      issue,
      record,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (err) {
    console.error("Error fetching Service:", err.message);
    req.flash("error", "Unable to load Service");
    res.redirect("/service-list");
  }
};

exports.approveSheet = async (req, res) => {
  try {
    const sheetId = req.params.id;
    const newStatus = req.body.status;
    console.log(newStatus);

    if (!["approved", "rejected"].includes(newStatus)) {
      req.flash("error", "Invalid status value");
      return res.redirect("back");
    }

    const updated = await ServiceSheet.findByIdAndUpdate(sheetId, {
      status: newStatus,
      updated_at: new Date(),
    }, { new: true });

    if (!updated) {
      req.flash("error", "Service sheet not found");
      return res.redirect("back");
    }

    const issuedata = await Issue.findOne({ error_code: updated.issue_type }).select("description");
    const issue = issuedata?.description || "N/A";

    // Render HTML from mailview template
    const formHtml = await new Promise((resolve, reject) => {
      res.render("mailview", { baseUrl: process.env.BASE_URL, issue, record: updated }, (err, html) => {
        if (err) reject(err);
        else resolve(html);
      });
    });

    // Generate PDF from HTML using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(formHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    const clientName = updated.client_name?.replace(/\s+/g, "_") || "Client";
    const visitDate = updated.visit_date?.toISOString().split("T")[0] || "Date";
    const sanitize = str => str.replace(/[^a-z0-9_\-]/gi, "");
    const filename = `${sanitize(clientName)}_${visitDate}_ServiceSheet.pdf`;
    // const filename = `${clientName}_${visitDate}_ServiceSheet.pdf`;

    // Send email with PDF attachment
    const recipientEmail = updated.email || "manepooja0000@gmail.com";
    const subject = `Service Sheet ${newStatus.toUpperCase()}`;
    const message = `Your service sheet has been ${newStatus}. Please find the attached PDF.`;

    await sendApprovalEmailWithAttachment(recipientEmail, subject, message, pdfBuffer, filename);

    req.flash("success", `Service sheet successfully ${newStatus}`);
    res.redirect("/service-list");
  } catch (err) {
    console.error("Approval Error:", err.message);
    req.flash("error", "Something went wrong during approval");
    res.redirect("back");
  }
};


// Update block start here
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, email, mobile, role, password } = req.body;

    const updateData = {
      name,
      username,
      email,
      mobile,
      role,
    };

    // Only hash and update password if it's provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      req.flash("error", "User not found or update failed");
      return res.redirect(`/edit-user/${userId}`);
    }

    req.flash("success", "User updated successfully");
    res.redirect("/users");
  } catch (err) {
    console.error("Update User Error:", err);
    req.flash("error", "Something went wrong while updating user");
    res.redirect(`/edit-user/${req.params.id}`);
  }
};


exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updateData = req.body;

    const updatedClient = await Client.findByIdAndUpdate(clientId, updateData, {
      new: true,
    });

    if (!updatedClient) {
      req.flash("error", "Client not found or update failed");
      return res.redirect(`/edit-client/${clientId}`);
    }

    req.flash("success", "Client updated successfully");
    res.redirect("/clients");
  } catch (err) {
    console.error("Update Client Error:", err);
    req.flash("error", "Something went wrong while updating client");
    res.redirect(`/edit-client/${req.params.id}`);
  }
};

exports.updateError = async (req, res) => {
  try {
    const errorId = req.params.id;
    const updateData = req.body;

    const updatedError = await Issue.findByIdAndUpdate(errorId, updateData, {
      new: true,
    });

    if (!updatedError) {
      req.flash("error", "Error record not found or update failed");
      return res.redirect(`/edit-error/${errorId}`);
    }

    req.flash("success", "Error record updated successfully");
    res.redirect("/errors");
  } catch (err) {
    console.error("Update Error Record Error:", err);
    req.flash("error", "Something went wrong while updating error record");
    res.redirect(`/edit-error/${req.params.id}`);
  }
};

exports.deleteError = async (req, res) => {
  try {
    const errorId = req.params.id;
    const deletedError = await Issue.findByIdAndDelete(errorId);

    if (!deletedError) {
      req.flash('error', "Error record not found or deletion failed");
      return res.redirect("/errors");
    }

    req.flash("success", "Record deleted successfully");
    res.redirect("/errors");
  }
  catch (err) {
    console.error("Delete Error Record Error:", err);
    req.flash("error", "Something went wrong while deleting error record");
    res.redirect("/errors");
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      req.flash("error", "Client record not found or deletion failed");
      return res.redirect("/clients");
    }
    req.flash("success", "Client deleted successfully");
    res.redirect("/clients");

  }
  catch (err) {
    console.log("Delete Client Record Error:", err)
    req.flash("error", "Something went wrong while deleting client record");
    return res.redirect("/clients");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deleteduser = await User.findByIdAndDelete(userId);

    if (!deleteduser) {
      req.flash("error", "User not found or deletion failed");
      return res.redirect("/users");
    }

    req.flash("success", "User deleted successfully");
    res.redirect("/users");
  }
  catch {
    console.log("Delete User Record Error:", err)
    req.flash("error", "Something went wrong while deleting user record");
    return res.redirect("/users");
  }
}

exports.ImportUsers = async (req, res) => {
  try {
    const file = req.file;

    if (!file || path.extname(file.originalname).toLowerCase() !== '.csv') {
      req.flash('error', 'Invalid file type. Only CSV files are allowed.');
      return res.redirect('/upload'); // adjust route as needed
    }

    const csvContent = file.buffer.toString('utf-8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });

    const failedEntries = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 to account for header and 0-index

      try {
        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) {
          failedEntries.push(`Row ${rowNumber}: Email "${row.email}" already exists.`);
          continue;
        }

        const newUser = new User({
          role: row.role,
          name: row.name,
          email: row.email,
          username: row.username,
          mobile: row.mobile,
          password: row.password, // Consider hashing this before saving!
          active: true,
        });

        await newUser.save();
      } catch (err) {
        failedEntries.push(`Row ${rowNumber}: Error - ${err.message}`);
      }
    }

    if (failedEntries.length > 0) {
      req.flash('error', failedEntries.join('<br>'));
    } else {
      req.flash('success', 'All users imported successfully.');
    }

    res.redirect('/users');
  } catch (error) {
    req.flash('error', 'An unexpected error occurred during import.');
    res.redirect('/users');
  }
};



