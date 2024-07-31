const CommentModel = require('../models/Comment');
const PostModel = require('../models/Post');
const CommentDTO = require('../DTO/CommentDTO');
const UserModel = require('../models/User');
const CommentAuthorDTO = require('../DTO/comment_authorID_DTO');
const { socket, getSocketID } = require('../WebSocket/socket');
const customError = require('../extensions/customError');
const EventModel = require('../models/Event');

class commentsService {
    async createComment(authorID, postID, comment) {
        const newComment = await CommentModel.create({
            authorID,
            comment,
            date: new Date().toLocaleString(),
        });
        const newComment2 = await CommentModel.findById(newComment._id);
        newComment2._idString = newComment._id;
        await newComment2.save();

        const post = await PostModel.findById(postID);
        post.comments.unshift(newComment2._id);
        post.commentsAmount = post.commentsAmount + 1;
        await post.save();
        let newComment3 = await CommentModel.findById(newComment2._id).populate('authorID', 'avatar_collor order_of_letters profileImage username');
        socket.emit('newComment', { postID, comment: newComment3 });
        //// Отправляем событие автору поста
        const postData = await PostModel.findById(postID).populate('authorID', 'avatar_collor order_of_letters profileImage username');
        const eventAuthor = await UserModel.findById(authorID);
        
        if (String(postData.authorID._id) !== String(eventAuthor._id)) {
            const event = await EventModel.create({
                type: 'comment',
                authorID: eventAuthor._id,
                isReaded: false,
                message: `Пользователь ${eventAuthor.username} оставил комментарий под вашим постом`,
            });
            const postForComment = await PostModel.findById(postID);
            const postAuthor = await UserModel.findById(postForComment.authorID);
            postAuthor.events.unshift(event);
            await postAuthor.save();
            const event2 = await EventModel.findById(event._id).populate('authorID', 'avatar_collor order_of_letters profileImage username');
            const socketID = getSocketID(postAuthor._id);
            if (socketID) {
                socket.to(socketID).emit('commentEvent', event2);
            }
        }

        return;
    }

    async getCommentsForPost(postID, lastCommentID) {
        const post = await PostModel.findById(postID).populate([
            {
                path: 'comments',
                populate: {
                    path: 'authorID',
                    select: 'avatar_collor order_of_letters profileImage username',
                },
            },
        ]);
        const findIndexOfLastComment = post.comments.findIndex((comment) => {
            return String(comment._id) === lastCommentID;
        });

        const commentsArray = [];
        let count = 15;
        let i = 0;
        while (i < post.comments.length) {
            if (i >= findIndexOfLastComment) {
                commentsArray.push(post.comments[i]);
                count = count - 1;
                if (count === 0) break;
            }
            i++;
        }
        return { comments: commentsArray };
    }
    async deleteComment(userID, commentID, postID) {
        console.log('2 Сервис удаления получил информацию');
        const comment = await CommentModel.findById(commentID).populate('authorID', 'username');
        if (String(comment.authorID._id) !== userID) {
            throw new customError(401, 'comment', 'У вас нет прав удалять этот коментарий');
        }
        console.log('3 Проверка прав на удаление прошла успешно');
        await CommentModel.deleteOne({ _id: commentID });
        console.log('4 Комментарий удален из базы данных');
        const post = await PostModel.findById(postID);
        post.comments.pull({ _id: commentID });
        post.commentsAmount = post.commentsAmount - 1;
        await post.save();
        console.log('5 Комментарий удален из массива поста данных');
        socket.emit('deleteComment', { commentID, postID });
        console.log('6 Отправил ответ на WebSocket');
        return;
    }
}

module.exports = new commentsService();
