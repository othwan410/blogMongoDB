const express = require("express");
const router = express.Router();
const Posts = require("../schemas/post.js");
const User = require("../schemas/user.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

router.post("/posts", authMiddleware, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        errorMessage: "'데이터 형식이 올바르지 않습니다.'",
      });
    }
    
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    if (!title) {
      return res.status(412).json({
        success: false,
        errorMessage: "게시글 제목의 형식이 일치하지 않습니다.",
      });
    }

    if (!content) {
      return res.status(412).json({
        success: false,
        errorMessage: "게시글 내용의 형식이 일치하지 않습니다.",
      });
    }
    
    const [user] = await User.find({ _id: userId }, {nickname : 1});
    await Posts.create({
      userId,
      nickname : user.nickname,
      title,
      content,
    });
  
    res.json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      errorMessage: "'게시글 작성에 실패하였습니다.'",
    });
  }
});

router.get("/posts", async (req, res) => {
  try{
    const posts = await Posts.find({},{content: 0, __v:0}).sort({createdAt : 1});

    res.json({
      data: posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

router.get("/posts/:postId", async (req, res) => {
  try {
    if (!req.params) {
      return res.status(400).json({
        success: false,
        errorMessage: "'데이터 형식이 올바르지 않습니다.'",
      });
    }
  
    const { postId } = req.params;
    const postDetail = await Posts.findOne({ _id : postId});
  
    res.json({
      post : {
        postid: postDetail._id,
        userId : postDetail.userId,
        nickname : postDetail.nickname,
        title: postDetail.title,
        content: postDetail.content,
        createdAt: postDetail.createdAt,
        updatedAt: postDetail.updatedAt,
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

router.put("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    if (!req.params || !req.body) {
      return res.status(412).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다.",
      });
    }
  
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { title, content } = req.body;
  
    if (!title) {
      return res.status(412).json({
        success: false,
        errorMessage: "게시글 제목의 형식이 올바르지 않습니다.",
      });
    }
    
    if (!content) {
      return res.status(412).json({
        success: false,
        errorMessage: "게시글 내용의 형식이 올바르지 않습니다.",
      });
    }

    const [existsPost] = await Posts.find({ _id: postId });
  
    if (existsPost) {
      if(userId === existsPost.userId){
        await Posts.updateOne({ _id: postId }, { $set: { title, content, updatedAt : Date.now() } });
      }
      else{
        return res.status(403).json({
          success: false,
          errorMessage: "'게시글 수정의 권한이 존재하지 않습니다.'",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        errorMessage: "'게시글 조회에 실패하였습니다.'",
      });
    }
    res.json({ message: "게시글을 수정하였습니다." });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      errorMessage: "게시글 수정에 실패하였습니다.",
    });
  }
});

router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  try{
    if (!req.params || !req.body) {
      return res.status(400).json({
        success: false,
        errorMessage: "'데이터 형식이 올바르지 않습니다.'",
      });
    }
  
    const { userId } = res.locals.user;
    const { postId } = req.params;
  
    const [existsPost] = await Posts.find({ _id: postId });
  
    if (existsPost) {
      if(userId === existsPost.userId)
        await Posts.deleteOne({ _id: postId});
      else {
        return res.status(403).json({
          success: false,
          errorMessage: "게시글의 삭제 권한이 존재하지 않습니다.",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        errorMessage: "게시글 조회에 실패하였습니다.",
      });
    }
    res.json({ message: "게시글을 삭제하였습니다." });

  } catch (err){
    console.log(err);
    return res.status(400).json({
      success: false,
      errorMessage: "게시글 삭제에 실패하였습니다.",
    });
  }
  
});

module.exports = router;
