var User = require("./../models/User");
var user_helper = {};

/*
 * get_all_user is used to get all user
 * 
 * @return  status 0 - If any internal error occured while fetching user data, with error
 *          status 1 - If user data found, with user's documents
 *          status 2 - If user not found, with appropriate message
 */
user_helper.get_all_user = async () => {
    try {
        var users = await User.find({status:true},{"name":1,"username":1,"avatar":1,"facebook":1,"instagram":1,"twitter":1,"pinterest":1,"linkedin":1});
        if (users && users.length > 0) {
            return { "status": 1, "message": "Users found", "users": users };
        } else {
            return { "status": 2, "message": "No user found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Brand", "error": err }
    }
};

module.exports = user_helper;