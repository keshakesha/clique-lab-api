var mongoose = require('mongoose');

var Campaign_Applied = require("./../models/Campaign_applied");
var Campaign_User = require("./../models/Campaign_user");
var Campaign = require("./../models/Campaign");
var ObjectId = mongoose.Types.ObjectId;

var campaign_helper = {};

/*
 * get_campaign_by_id is used to fetch all campaign data
 * 
 * @params id string user_id
 * 
 * @return  status 0 - If any internal error occured while fetching campaign data, with error
 *          status 1 - If campaign data found, with campaign object
 *          status 2 - If campaign not found, with appropriate message
 */
campaign_helper.get_campaign_by_user_id = async (id, filter, page_no, page_size) => {
    try {
        console.log("user_id = ", id);
        console.log("filter = ", filter);
        console.log("page_no = ", page_no);
        console.log("page_size = ", page_size);

        var campaigns = await Campaign.aggregate([
            {
                $lookup: {
                    from: "campaign_user",
                    localField: "_id",
                    foreignField: "campaign_id",
                    as: "approved_campaign"
                }
            },
            {
                $unwind: "$approved_campaign"
            },
            {
                $match: {
                    "approved_campaign.user_id": { "$eq": new ObjectId(id) },
                    "status": true,
                    //"social_media_platform": filter
                }
            },
            {
                $project:
                    {
                        social_media_platform: 1,
                        hash_tag: 1, at_tag: 1,
                        privacy: 1, media_format: 1,
                        mood_board_images: 1,
                        name: 1,
                        start_date: 1,
                        end_date: 1,
                        call_to_action: 1,
                        location: 1,
                        price: 1,
                        currency: 1,
                        promoter_id: 1,
                        description: 1,
                        cover_image: 1
                    }
            },
            {
                $skip: page_no > 0 ? ((page_no - 1) * page_size) : 0
            },
            {
                $limit: page_size

            }
            /*{
                $sort: {price : sort} 
            },*/

        ]
        )

        console.log("campaign = ", campaigns);
        if (campaigns && campaigns.length > 0) {
            return { "status": 1, "message": "campaign found", "campaign": campaigns };
        } else {
            return { "status": 2, "message": "No campaign available" };
        }
    } catch (err) {

        return { "status": 0, "message": "Error occured while finding campaign", "error": err }
    }
}

/*
 * campaign_helper is used to fetch all capaign data
 * 
 * @return  status 0 - If any internal error occured while fetching campaign data, with error
 *          status 1 - If campaign data found, with campaign object
 *          status 2 - If campaign not found, with appropriate message
 */
campaign_helper.get_all_campaign = async (filter, sort, page_no, page_size) => {
    try {
        var count = await Campaign.count();
        var campaign = await Campaign
            .find(filter)
            .sort(sort)
            .skip(page_no > 0 ? ((page_no - 1) * page_size) : 0).limit(page_size).lean();
        campaign.count = count;
        if (campaign.length > 0 && campaign) {
            return { "status": 1, "message": "campaign found", "Campaign": campaign, count };
        } else {
            return { "status": 2, "message": "No campaign available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding campaign", "error": err }
    }
}

/*
 * campaign_helper is used to fetch  capaign data by id
 * 
 * @return  status 0 - If any internal error occured while fetching campaign data, with error
 *          status 1 - If campaign data found, with campaign object
 *          status 2 - If campaign not found, with appropriate message
 */

campaign_helper.get_campaign_by_id = async (campaign_id) => {
    try {

        var campaign = await Campaign.findOne({ _id: campaign_id });
        if (campaign) {
            return { "status": 1, "message": "campaign found", "Campaign": campaign };
        } else {
            return { "status": 2, "message": "No campaign available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding campaign", "error": err }
    }
}


/*
 * insert_campaign_applied is used to insert into User collection
 * 
 * @param   campaign_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting campaign applied, with error
 *          status  1 - If campaign applied inserted, with inserted campaign applied's document and appropriate message
 * 
 * @developed by "mm"
 */
campaign_helper.insert_campaign_applied = async (campaign_object) => {
    let campaign = new Campaign_Applied(campaign_object)

    try {

        let campaign_data = await campaign.save();
        // let camapign_applied = await campaign_user.findOneAndUpdate({user_id : user_id,campaign_id:campaign_id},obj);
        return { "status": 1, "message": "Campaign inserted", "campaign": campaign_data };

    } catch (err) {

        return { "status": 0, "message": "Error occured while inserting Campaign Applied", "error": err };
    }
};


campaign_helper.update_apply = async (user_id, campaign_id, obj) => {

    try {
        let user = await Campaign_User.findOneAndUpdate({ "user_id": new ObjectId(user_id), "campaign_id": new ObjectId(campaign_id) }, obj);
       
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
 * insert_campaign_user is used to insert into Campaign_user collection
 * 
 * @param   campaign_user_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting campaign_user, with error
 *          status  1 - If campaign_user inserted, with inserted campaign_user's document and appropriate message
 * 
 * @developed by "ar"
 */
campaign_helper.insert_campaign_user = async (campaign_user_object) => {
    let campaign_user = new Campaign_User(campaign_user_object)
    try {
        let campaign_user_data = await campaign_user.save();
        return { "status": 1, "message": "User added in campaign", "campaign_user": campaign_user_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting into campaign_user", "error": err };
    }
};

/*
 * insert_campaign is used to insert into campaign collection
 * 
 * @param   campaign_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting campaign, with error
 *          status  1 - If campaign inserted, with inserted faculty's document and appropriate message
 * 
 * @developed by "ar"
 */
campaign_helper.insert_campaign = async (campaign_object) => {
    let campaign = new Campaign(campaign_object);
    try {
        let campaign_data = await campaign.save();
        return { "status": 1, "message": "Campaign inserted", "campaign": campaign_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting campaign", "error": err };
    }
};


/*
 * get_all_offered_campaign is used to fetch all campaign data
 * 
 * @return  status 0 - If any campaign error occured while fetching campaign data, with error
 *          status 1 - If campaign data found, with campaign object
 *          status 2 - If campaign not found, with appropriate message
 */
campaign_helper.get_all_offered_campaign = async (id, filter, sort, page_no, page_size) => {
    try {
        var campaigns = await Campaign.aggregate([
            {
                $lookup:
                    {
                        from: "campaign_invite",
                        localField: "_id",
                        foreignField: "campaign_id",
                        as: "offered_campaign"
                    }
            },
            {
                $unwind: "$offered_campaign"
            },
            {
                $match:
                    {
                        "offered_campaign.user_id": { "$eq": new ObjectId(id) },
                        "status": true
                    }
            },
            {
                $project:
                    {
                        social_media_platform: 1,
                        hash_tag: 1, at_tag: 1,
                        privacy: 1, media_format: 1,
                        mood_board_images: 1,
                        name: 1,
                        start_date: 1,
                        end_date: 1,
                        call_to_action: 1,
                        location: 1,
                        price: 1,
                        currency: 1,
                        promoter_id: 1,
                        description: 1,
                        cover_image: 1
                    }
            },
            {
                $skip: page_no > 0 ? ((page_no - 1) * page_size) : 0
            },
            {
                $limit: page_size

            }

        ])

        if (campaigns && campaigns.length > 0) {
            return { "status": 1, "message": "campaign found", "campaign": campaigns };
        } else {
            return { "status": 2, "message": "No campaign available" };
        }
    } catch (err) {

        return { "status": 0, "message": "Error occured while finding campaign", "error": err }
    }
}

campaign_helper.user_not_exist_campaign_for_promoter = async (user_id, promoter_id) => {
    try {
        var campaigns = await Campaign.aggregate([
            {
                "$match": { "promoter_id": new ObjectId(promoter_id) }
            },
            {
                "$lookup": {
                    "from": "campaign_user",
                    "localField": "_id",
                    "foreignField": "campaign_id",
                    "as": "campaign_user"
                }
            },
            {
                "$match": { "campaign_user.user_id": { $ne: new ObjectId(user_id) } }
            }
        ]);

        if (campaigns && campaigns.length > 0) {
            return { "status": 1, "message": "campaign found", "campaigns": campaigns };
        } else {
            return { "status": 2, "message": "No campaign available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding campaign", "error": err }
    }
}

campaign_helper.get_active_campaign_by_promoter = async (promoter_id, page_no, page_size) => {
    try {
        var campaigns = await Campaign.aggregate([
            {
                "$match": {
                    "promoter_id": new ObjectId(promoter_id),
                    "start_date": { "$lt": new Date() },
                    "end_date": { "$gt": new Date() }
                }
            },
            { "$sort": { "created_at": -1 } },
            {
                "$group": {
                    "_id": null,
                    "total": { "$sum": 1 },
                    'results': { "$push": '$$ROOT' }
                }
            },
            {
                "$project": {
                    "total": 1,
                    'campaigns': { "$slice": ["$results", page_size * (page_no - 1), page_size] }
                }
            }
        ]);

        if (campaigns && campaigns[0] && campaigns[0].campaigns.length > 0) {
            return { "status": 1, "message": "campaign found", "campaigns": campaigns };
        } else {
            return { "status": 2, "message": "No campaign available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding campaign", "error": err }
    }
}

module.exports = campaign_helper;