var User = require("./../models/User");
var user_helper = {};

/*
 * get_login_by_email is used to fetch single user by email address
 * 
 * @param   email   Specify email address of user
 * 
 * @return  status  0 - If any error occur in finding user, with error
 *          status  1 - If User found, with found user document
 *          status  2 - If User not found, with appropriate error message
 * 
 * @developed by "ar"
 */
user_helper.get_login_by_email = async (email) => {
    try {
        var user = await User.findOne({ "email": email });
        if (user) {
            return { "status": 1, "message": "User details found", "user": user };
        } else {
            return { "status": 2, "message": "User not found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding user", "error": err }
    }
};

/*
 * get_user_by_id is used to fetch User by id
 * 
 * @param id String Specify _id of user collection
 * 
 * @return  status 0 - If any internal error occured while fetching user data, with error
 *          status 1 - If User data found, with user object
 *          status 2 - If User not found, with appropriate message
 */
user_helper.get_user_by_id = async (id) => {
    try {
        var user = await User.findOne({ _id: id }).lean();

        // Find searchable value
        var field_need_counted = ["name","short_bio","email"];

        var count = 0;
        Object.keys(user).forEach(async (key) => {
            if (field_need_counted.indexOf(key) > -1) {
                count++;
            }
        });
        user.searchable = Math.ceil(100 * count / field_need_counted.length);

        // Find social power
        if (user) {
            user.power = (user.facebook.no_of_friends + user.instagram.no_of_followers + user.pinterest.no_of_followers + user.twitter.no_of_followers);
            return { "status": 1, "message": "User found", "User": user };
        } else {
            return { "status": 2, "message": "User available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding User", "error": err }
    }
}

/*
 * get_all_user is used to get all user
 * 
 * @return  status 0 - If any internal error occured while fetching user data, with error
 *          status 1 - If user data found, with user's documents
 *          status 2 - If user not found, with appropriate message
 */
user_helper.get_all_user = async () => {
    try {
        var users = await User.find({ status: true }, { "name": 1, "username": 1, "avatar": 1, "facebook": 1, "instagram": 1, "twitter": 1, "pinterest": 1, "linkedin": 1 });
        if (users && users.length > 0) {
            return { "status": 1, "message": "Users found", "users": users };
        } else {
            return { "status": 2, "message": "No user found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Brand", "error": err }
    }
};

/*
 * get_filtered_user is used to get user based on given filter
 * 
 * @param   
 * 
 * @return  status 0 - If any internal error occured while fetching user data, with error
 *          status 1 - If user data found, with user's documents
 *          status 2 - If user not found, with appropriate message
 */
user_helper.get_filtered_user = async (page_no, page_size, filter) => {
    try {
        var aggregate = [];
        if (filter) {
            aggregate.push({ "$match": filter });
        }

        aggregate.push({ "$skip": page_size * (page_no - 1) });
        aggregate.push({ "$limit": page_size });

        console.log("aggregate = ", aggregate);

        var users = await User.aggregate(aggregate);
        // var users = await User.find({status:true},{"name":1,"username":1,"avatar":1,"facebook":1,"instagram":1,"twitter":1,"pinterest":1,"linkedin":1});
        if (users && users.length > 0) {
            return { "status": 1, "message": "Users found", "users": users };
        } else {
            return { "status": 2, "message": "No user found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Brand", "error": err }
    }
};

/*
 * insert_user is used to insert into User collection
 * 
 * @param   user_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user, with error
 *          status  1 - If user inserted, with inserted user's document and appropriate message
 * 
 * @developed by "mm"
 */
user_helper.insert_user = async (user_object) => {
    let user = new User(user_object)
    try {
        let user_data = await user.save();
        return { "status": 1, "message": "Record inserted", "user": user_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting user", "error": err };
    }
};

/*
 * update_user_by_id is used to update User data based on user_id
 * 
 * @param   user_id         String  _id of promoter that need to be update
 * @param   user_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user, with error
 *          status  1 - If User updated successfully, with appropriate message
 *          status  2 - If User not updated, with appropriate message
 * 
 * @developed by "ar"
 */
user_helper.update_user_by_id = async (user_id, login_object) => {
    try {
        let user = await User.findOneAndUpdate({ _id: user_id }, login_object);
        if (!user) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "user": user };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating user", "error": err }
    }
};


/*
 * user_helper is used to fetch all bank detail
 * 
 * @return  status 0 - If any internal error occured while fetching bank detail , with error
 *          status 1 - If bank detail  found, with bank object
 *          status 2 - If bank detail not found, with appropriate message
 */
user_helper.get_bank_detail = async (user_id) => {
    try {
        var user = await User.find({_id: user_id},{"bank.bank_name":1,"bank.account_name":1,"bank.account_number":1,"bank.bsb":1});
        if (user) {
            return { "status": 1, "message": "bank detail", "user": user };
        } else {
            return { "status": 2, "message": "No bank Detail available" };   
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding bank Detail", "error": err }
    }
}


/*
 * update_by_id is used to update User data based on user_id
 * 
 * @param   user_id         String  _id of promoter that need to be update
 * @param   user_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user, with error
 *          status  1 - If User updated successfully, with appropriate message
 *          status  2 - If User not updated, with appropriate message
 * 
 * @developed by "mm"
 */
user_helper.bank_detail_update = async (user_id,bank_id,bank) => { 
    try {
        let user = await User.findOneAndUpdate(
            { "_id": user_id,"bank._id": bank_id },
             
            { 
                "$set": {
                    "bank.$.bank_name": bank.bank_name,
                    "bank.$.account_number": bank.account_number,
                    "bank.$.account_name": bank.account_name,
                    "bank.$.bsb": bank.bsb
                }   
            },

        );
        if (!user) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "user": user };
        }
    } catch (err) {
        console.log(err);
        return { "status": 0, "message": "Error occured while updating user", "error": err }
        
    }
};



/*
 * add_bank_to_user is used to insert into User collection
 * 
 * @param   bank     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting bank detail, with error
 *          status  1 - If bank detail inserted, with inserted bank detail's document and appropriate message
 * 
 * @developed by "mm"
 */

user_helper.add_bank_to_user = async (user_id, bank) => {
    try {
        let user = await User.findOneAndUpdate({ _id: user_id }, {$push:{"bank":bank}}, { new: true });
        if (!user) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "user": user };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating user", "error": err }
    }
};

module.exports = user_helper;