module.exports = function(author){
    const userID = author._id
    return {
        userID: userID,
        username: author.username,
        profileImage: author.profileImage,
        avatar_collor: author.avatar_collor,
        order_of_letters: author.order_of_letters

    }
}