const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comment.js");
const Posts = require("../schemas/post.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  try {
    if (!req.params || !req.body) {
      return res.status(412).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다.",
      });
    }
  
    const { postId } = req.params;
    const [existsPost] = await Posts.find({ _id: postId });
    if (!existsPost) {
      return res.status(404).json({
        success: false,
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }
  
    const { comment } = req.body;
    if (!comment) {
      return res.status(412).json({
        success: false,
        errorMessage: "댓글 형식이 올바르지 않습니다.",
      });
    }
  
    const { userId } = res.locals.user;
  
    await Comments.create({
      postId: postId,
      userId, 
      nickname: existsPost.nickname, 
      comment,
    });
  
    res.json({ message: "댓글을 생성하였습니다." });  
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 작성에 실패하였습니다.",
    });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    if (!req.params) {
      return res.status(400).json({
        success: false,
        errorMessage: "'데이터 형식이 올바르지 않습니다.'",
      });
    }
    const { postId } = req.params;

    const [existsPost] = await Posts.find({ _id: postId });
    if (!existsPost) {
      return res.status(404).json({
        success: false,
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }
    const comments = await Comments.find({postId}, {__v:0}).sort({createdAt : 1});
    res.json({ comments: comments });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 조회에 실패하였습니다.",
    });
  }
});

router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    if (!req.params || !req.body) {
      return res.status(400).json({
        success: false,
        errorMessage: "'데이터 형식이 올바르지 않습니다.'",
      });
    }
  
    const { postId, commentId } = req.params;
    const [existsPost] = await Posts.find({ _id: postId });
    if (!existsPost) {
      return res.status(404).json({
        success: false,
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }

    const { comment } = req.body;
    if (!comment) {
      return res.status(412).json({
        success: false,
        errorMessage: "댓글 형식이 올바르지 않습니다.",
      });
    }
  
    const [existsComment] = await Comments.find({ _id: commentId});
    const { userId } = res.locals.user;
    if (existsComment) {
      if (userId === existsComment.userId)
        await Comments.updateOne(
          { _id: commentId },
          { $set: { comment, updatedAt : Date.now() } }
        );
      else {
        return res.status(403).json({
          success: false,
          errorMessage: "댓글의 수정 권한이 존재하지 않습니다.",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        errorMessage: "'댓글 조회에 실패하였습니다.'",
      });
    }
    res.json({ message: "댓글을 수정하였습니다." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 수정에 실패하였습니다.",
    });
  }
});

router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try{
    if (!req.params || !req.body) {
      return res.status(400).json({
        success: false,
        errorMessage: "'데이터 형식이 올바르지 않습니다.'",
      });
    }
  
    const { postId, commentId } = req.params;
    const [existsPost] = await Posts.find({ _id: postId });
    if (!existsPost) {
      return res.status(404).json({
        success: false,
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }
  
    const [existsComment] = await Comments.find({ _id: commentId});
    const { userId } = res.locals.user;
    if (existsComment) {
      if (userId === existsComment.userId)
        await Comments.deleteOne({ _id: commentId });
      else {
        return res.status(403).json({
          success: false,
          errorMessage: "댓글의 삭제 권한이 존재하지 않습니다.",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        errorMessage: "'댓글 조회에 실패하였습니다.'",
      });
    }
    res.json({ message: "댓글을 삭제하였습니다." });
  }catch (err){
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 삭제에 실패하였습니다.",
    });
  }
});

module.exports = router;
