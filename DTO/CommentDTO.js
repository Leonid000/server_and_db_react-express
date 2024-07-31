module.exports = function(comment){
    return {
        author: {
            username: comment.authorID.username,
            profileImage: comment.authorID.profileImage,
            avatar_collor: comment.authorID.avatar_collor,
            order_of_letters: comment.authorID.order_of_letters,
            userID: comment.authorID._id
        },
        _id: comment._id,
        _idString: comment._idString,
        comment: comment.comment,
        date: comment.date,
    }
}

