const Item = require('../models/itemModel');

exports.getDashboard = async (req, res) => {
  const items = await Item.find();
  res.render('dashboard', { items });
};

exports.createItem = async (req, res) => {
  await Item.create(req.body);
  res.redirect('/');
};

exports.updateItem = async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/');
};

exports.deleteItem = async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect('/');
};
