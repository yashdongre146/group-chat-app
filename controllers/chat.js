const Chat = require("../models/chat")

exports.storeChat =  async (req, res) => {
    const limit = 10;
    const page = parseInt(req.query.page);
    try {
         await req.user.createChat(req.body);
         const count = await Chat.count();
         const hasMoreData = count - (page-1)*limit > limit ? true : false;
         res.status(201).json({success: true, message: "sent", hasMoreData})
     } catch (err) {
            console.log(err);
             res.status(400).json();
     }
 }

exports.getChats =  async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
         const chats = await Chat.findAll({
            // order: [['createdAt', 'DESC']],
            offset: offset,
            limit: limit
         });
         const count = await Chat.count();

         const hasMoreData = count - (page-1)*limit > limit ? true : false;
         const nextPage = hasMoreData ? Number(page) + 1 : undefined;
         const previousPage = page > 1 ? Number(page)-1 : undefined;
         const hasPreviousPage = previousPage ? true : false;
         res.status(201).json(
            {
                 chats: chats,
                 currentPage: page,
                 hasNextPage: hasMoreData,
                 hasPreviousPage: hasPreviousPage,
                 previousPage: previousPage,
                 nextPage: nextPage
            })
     } catch (err) {
             res.status(400).json();
     }
 }