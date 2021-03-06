var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Transaction = require("./../models/Transaction");
var transaction_helper = {};

var ObjectId = mongoose.Types.ObjectId;

/*
 * Insert transaction
 * @developed by "ar"
 */
transaction_helper.insert_transaction = async (transaction_object) => {
    let transaction = new Transaction(transaction_object)
    try {
        let transaction_data = await transaction.save();
        return { "status": 1, "message": "Transaction has been inserted", "transaction": transaction_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting transaction", "error": err };
    }
};

transaction_helper.update_transaction_by_id = async (transaction_id, obj) => {
    try {
        let transaction = await Transaction.findOneAndUpdate({ "_id": new ObjectId(transaction_id) }, obj);
        if (!transaction) {
            return { "status": 2, "message": "Transaction has not updated" };
        } else {
            return { "status": 1, "message": "Transaction has been updated", "transaction": transaction };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating transaction", "error": err }
    }
};

module.exports = transaction_helper;