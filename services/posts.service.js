const PostModel = require('../models/Post');
const UserModel = require('../models/User');
const CommentModel = require('../models/Comment');
const { socket, getSocketID } = require('../WebSocket/socket');
const mookPost = require('../additionalComponents/postForGetMyPosts');
const commentAuthorDTO = require('../DTO/comment_authorID_DTO');
const customError = require('../extensions/customError');
const UserDTO = require('../DTO/UserDTO');
const EventModel = require('../models/Event');

class postsService {
    async createNewPost_WithoutImage(topic, title, content, userID) {
        const author = await UserModel.findById(userID);
        const newPost = await PostModel.create({
            authorID: author._id,
            authorName: author.username,
            posiImage: '',
            postImage_object_fit: 'none',
            title: title,
            content: content,
            topic: topic,
            views: 0,
            date: new Date().toLocaleString(),
            likes: [],
            commentsAmount: 0,
            comments: [],
            _idString: '',
        });
        let newPost2 = await PostModel.findById(newPost._id);
        newPost2._idString = newPost._id;
        await newPost2.save();
        const newPost3 = await PostModel.findById(newPost._id).populate('authorID', 'username profileImage avatar_collor order_of_letters');
        /// Все подписчики автора получают event
        const eventAuthor = await UserModel.findById(userID);
        const event = await EventModel.create({
            type: 'newPost',
            authorID: eventAuthor._id,
            isReaded: false,
            message: `Пользователь ${eventAuthor.username} опубликовал новый пост`,
        });
        const event2 = await EventModel.findById(event._id).populate('authorID', 'username profileImage avatar_collor order_of_letters');

        eventAuthor.subscribers.forEach(async (subscriberID) => {
            const user = await UserModel.findById(String(subscriberID));
            user.events.unshift(event);
            await user.save();
            const socketID = getSocketID(user._id);
            if (socketID) {
                socket.to(socketID).emit('newPost', event2);
            }
        });

        return { newPost: newPost3 };
    }
    async createNewPost_With_Image(topic, title, content, postImage_object_fit, postImage, userID) {
        const author = await UserModel.findById(userID);
        const newPost = await PostModel.create({
            authorID: author._id,
            authorName: author.username,
            postImage,
            postImage_object_fit,
            title,
            content,
            topic,
            likes: [],
            views: 0,
            date: new Date().toLocaleString(),
            commentsAmount: 0,
            comments: [],
            _idString: 'none',
        });
        const newPost2 = await PostModel.findById(newPost._id);
        newPost2._idString = newPost._id;
        await newPost2.save();
        const newPost3 = await PostModel.findById(newPost._id).populate('authorID', 'username profileImage avatar_collor order_of_letters');

        /// Все подписчики автора получают event
        const eventAuthor = await UserModel.findById(userID);
        const event = await EventModel.create({
            type: 'newPost',
            authorID: eventAuthor._id,
            isReaded: false,
            message: `Пользователь ${eventAuthor.username} опубликовал новый пост`,
        });
        const event2 = await EventModel.findById(event._id).populate('authorID', 'username profileImage avatar_collor order_of_letters');

        eventAuthor.subscribers.forEach(async (subscriberID) => {
            const user = await UserModel.findById(String(subscriberID));
            user.events.unshift(event);
            await user.save();
            const socketID = getSocketID(user._id);
            if (socketID) {
                socket.to(socketID).emit('newPost', event2);
            }
        });

        return { newPost: newPost3 };
    }

    async getMyPosts(myID, idOfLastPost) {
        let posts = await PostModel.find({ authorID: myID })
            .sort('-createdAt')
            .populate([
                {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters',
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'authorID',
                        select: 'username profileImage avatar_collor order_of_letters',
                    },
                },
            ]);

        if (posts.length === 0) {
            return { posts: [] };
        }

        const indexOfLastPost = posts.findIndex((post) => {
            return post._idString === idOfLastPost;
        });
        const getPosts = [];
        let count = 8;
        let i = 0;
        while (i < posts.length) {
            if (i > indexOfLastPost) {
                getPosts.push(posts[i]);
                count = count - 1;
                if (count === 0) {
                    break;
                }
            }
            i++;
        }
        return { posts: getPosts };
    }

    async getUserPosts(userID, lastPostID) {
        let posts = await PostModel.find({ authorID: userID })
            .sort('-createdAt')
            .populate([
                {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters',
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'authorID',
                        select: 'username profileImage avatar_collor order_of_letters',
                    },
                },
            ]);

        if (posts.length === 0) {
            posts = [
                {
                    authorID: {
                        profileImage: 'none',
                        username: 'Admin',
                        avatar_collor: 'red',
                        order_of_letters: 'first_last',
                    },
                    authorName: 'Admin',
                    postImage: '',
                    postImage_object_fit: 'none',
                    title: 'Публикации отсутствуют',
                    content:
                        'В настоящее время этот пользователь не совершил никаких публикаций, попробуйте зайти позже. Вы можете отправить ему личное сообщение в колонке профиля.',
                    topic: 'nature',
                    views: 0,
                    likes: [],
                    commentsAmount: 0,
                    date: new Date().toLocaleString(),
                    createdAt: new Date(),
                    comments: [],
                    _idString: 'aa',
                },
            ];
            return { posts: [] };
        }
        const indexOfLastPost = posts.findIndex((post) => {
            return post._idString === lastPostID;
        });
        const getPosts = [];
        let count = 8;
        let i = 0;
        while (i < posts.length) {
            if (i > indexOfLastPost) {
                getPosts.push(posts[i]);
                count = count - 1;
                if (count === 0) {
                    break;
                }
            }
            i++;
        }
        return { posts: getPosts };
    }

    async getAllPosts(lastPost) {
        let posts = await PostModel.find()
            .sort('-createdAt')
            .populate([
                {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters',
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'authorID',
                        select: 'username profileImage avatar_collor order_of_letters',
                    },
                },
            ]);

        if (posts.length === 0) {
            posts = [];
            return { posts };
        }
        const indexOfLastPost = posts.findIndex((post) => {
            return post._idString === lastPost;
        });
        let count = 8;
        let i = 0;
        const getPosts = [];
        while (i < posts.length) {
            if (i > indexOfLastPost) {
                getPosts.push(posts[i]);
                count = count - 1;
                if (count === 0) {
                    break;
                }
            }
            i++;
        }

        return { posts: getPosts };
    }

    async likePost(userID, postID) {
        let post = await PostModel.findOne({ _id: postID });
        if (post.likes.includes(userID)) {
            return;
        }
        post.likes.push(userID);
        await post.save();
        socket.emit('newLikeToPost', { postID, userID });
        //// отправляем событие лайка владельцу поста
        const post2 = await PostModel.findById(postID);
        const author = await UserModel.findById(userID);
        if (String(post2.authorID) !== userID) {
            const event = await EventModel.create({
                type: 'like',
                authorID: author._id,
                isReded: false,
                message: `Пользователь ${author.username} поставил вам лайк `,
            });
            const authorOfPost = await UserModel.findById(post2.authorID);
            authorOfPost.events.unshift(event);
            await authorOfPost.save();
            const socketID = getSocketID(authorOfPost._id);
            const event2 = await EventModel.findById(event._id).populate('authorID', 'username profileImage avatar_collor order_of_letters');
            if (socketID) {
                socket.to(socketID).emit('likeEvent', event2);
            }
        }

        return;
    }

    async getOnePost(postID) {
        let post = await PostModel.findById(postID).populate([
            {
                path: 'authorID',
                select: 'username profileImage avatar_collor order_of_letters',
            },
            {
                path: 'comments',
                populate: {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters',
                },
            },
        ]);
        const commentstArray = [];
        let i = 0;
        while (i < 15) {
            if (post.comments[i]) {
                commentstArray.push(post.comments[i]);
            }
            i++;
        }
        post.comments = commentstArray;

        return { post };
    }

    async deletePost(postID, userID) {
        const post = await PostModel.findById(postID).populate('authorID', 'username');
        if (String(post.authorID._id) !== userID) {
            throw new customError(403, 'common', 'у вас нет доступа на удаление');
        }
        const commentsArray = post.comments.map((commentID) => String(commentID));
        commentsArray.forEach(async (commentID) => {
            await CommentModel.deleteOne({ _id: commentID });
        });
        await PostModel.deleteOne({ _id: postID });
        return { deletedPostID: postID };
    }

    async updatePost_withoutImage(postID, userID, title, content, topic) {
        const post = await PostModel.findById(postID).populate('authorID', 'username');
        if (String(post.authorID._id) !== userID) {
            throw new customError(403, 'common', 'У вас нет прав на изменение поста');
        }
        await PostModel.findByIdAndUpdate(postID, {
            title,
            content,
            topic,
        });
        const updatedPost = await PostModel.findById(postID).populate([
            {
                path: 'authorID',
                select: 'username profileImage avatar_collor order_of_letters',
            },
            {
                path: 'comments',
                populate: {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters',
                },
            },
        ]);
        return { updatedPost };
    }

    async updatePost_withImage(postID, userID, title, content, topic, newPostImage) {
        const post = await PostModel.findById(postID).populate('authorID', 'username');
        if (String(post.authorID._id) !== userID) {
            throw new customError(403, 'common', 'У вас нет прав на изменение поста');
        }
        await PostModel.findByIdAndUpdate(postID, {
            title,
            content,
            topic,
            postImage: newPostImage,
        });
        const updatedPost = await PostModel.findById(postID).populate([
            {
                path: 'authorID',
                select: 'username profileImage avatar_collor order_of_letters',
            },
            {
                path: 'comments',
                populate: {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters',
                },
            },
        ]);
        return { updatedPost };
    }
    async getLikes(postID) {
        const post = await PostModel.findById(postID);
        const likeUsers = await Promise.all(
            post.likes.map(async (userID) => {
                return await UserModel.findById(userID).select('username profileImage avatar_collor order_of_letters');
            })
        );
        return { likeUsers };
    }
}

module.exports = new postsService();
