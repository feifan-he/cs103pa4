const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const ToDoItem = require("../models/ToDoItem");

isLoggedIn = (req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/transactions", isLoggedIn, async (req, res, next) => {
  transactions = await Transaction.find({ userId: req.user._id }).sort({
    date: 1,
    amount: 1,
  });
  res.render("transactions", { transactions });
});

router.post("/transactions", isLoggedIn, async (req, res, next) => {
  const transaction = new Transaction({
    description: req.body.description,
    category: req.body.category,
    amount: req.body.amount,
    date: req.body.date,
    userId: req.user._id,
  });
  await transaction.save();
  res.redirect("/transactions");
});

router.get("/transactions/byCategory", isLoggedIn, async (req, res, next) => {
  Transaction.aggregate([
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]).then(function (transactions, err) {
    if (err) {
      console.log(err);
    } else {
      res.render("groupbycategory", { transactions });
    }
  });
});

router.get(
  "/transactions/remove/:itemId",
  isLoggedIn,
  async (req, res, next) => {
    await Transaction.deleteOne({ _id: req.params.itemId });
    res.redirect("/transactions");
  }
);

router.get("/transactions/edit/:itemId", isLoggedIn, async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.itemId);
  res.locals.transaction = transaction;
  res.render("editTransaction");
});

router.post("/transactions/update", isLoggedIn, async (req, res, next) => {
  const { transactionId, description, category, amount, date } = req.body;
  await Transaction.findOneAndUpdate(
    { _id: transactionId },
    { $set: { description, category, amount, date } }
  );
  res.redirect("/transactions");
});

module.exports = router;
