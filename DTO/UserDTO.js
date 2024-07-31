module.exports = function(user){
    return {
        userID: user._id,
        username: user.username,
        gender: user.gender,
        email: user.email,
        profileImage: user.profileImage,
        registrationStage: user.registrationStage,
        roles: user.roles,
        avatar_collor: user.avatar_collor,
        order_of_letters: user.order_of_letters,
        subscribers: user.subscribers,
        iSubscribeTo: user.iSubscribeTo,
        country: user.country,
        city: user.city,
        work: user.work,
        age: user.age,
        bite: user.bite,
        events: user.events
    }
}

