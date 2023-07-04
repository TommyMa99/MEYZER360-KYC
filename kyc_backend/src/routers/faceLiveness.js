const express = require('express')
const router = new express.Router()
const AWS = require('aws-sdk');
const Rekognition = require('aws-sdk/clients/rekognition');
const { SharedIniFileCredentials } = require('aws-sdk');

router.get('/faceliveness/createSession/', async (req, res) => {
    const credentials = new SharedIniFileCredentials({ profile: 'amplify' });
    AWS.config.credentials = credentials;
    const rekognitionClient = new Rekognition({
        region: 'us-west-2',
        endpoint: 'https://rekognition.us-west-2.amazonaws.com',
    });
    try {
        const session_id = await rekognitionClient.createFaceLivenessSession().promise();
        res.status(200).send(session_id)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/faceliveness/getResult/:session_id', async (req, res) => {
    const credentials = new SharedIniFileCredentials({ profile: 'amplify' });
    AWS.config.credentials = credentials;
    const rekognitionClient = new Rekognition({
        region: 'us-west-2',
        endpoint: 'https://rekognition.us-west-2.amazonaws.com',
    });
    const session_id_retrieved = req.params.session_id;
    try {
        const response = await rekognitionClient.getFaceLivenessSessionResults({
            SessionId: session_id_retrieved,
        }).promise();
        res.status(200).send(response)
    } catch (e) {
        res.status(400).send(e)
    }
})

// // Log in a user and give the user a token and attach it to the token list
// router.post('/users/login', async (req, res, next) => {
//     try {
//         const user = await User.findByCredentials(req.body.email, req.body.password)
//         const token = await user.generateAuthToken()
//         if(!user)  return next(new Error('Incorrect email or password'))
//         const { password, ...othersData } = user._doc;

//         res.cookie("access_token", token, {
//           httpOnly: true,
//         }).status(201).json({ user, token, othersData });
//     } catch (e) {
//         res.status(400).send()
//     }
// })

// router.post('/users/logout', auth, async (req, res) => {
//     try {
//         req.user.tokens = req.user.tokens.filter((token) => {
//             return token.token !== req.token
//         })
//         await req.user.save()

//         res.send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// router.post('/users/logoutAll', auth, async (req, res) => {
//     try {
//         req.user.tokens = []
//         await req.user.save()
//         res.send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// // Find users by id
// router.get("/find/:id", async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         res.status(200).json(user);
//       } catch (err) {
//         next(err);
//       }
//     })

//     // Find users by email
// router.get('/users/me', auth, async (req, res) => {
//     res.send(req.user)
// })

// //update user by id
// router.put('/:id', async (req, res, next) => {
//     if (req.params.id === req.params.id) {
//         try {
//           const updatedUser = await User.findByIdAndUpdate(
//             req.params.id,
//             {
//               $set: req.body,
//             },
//             {
//               new: true,
//             }
//           );
//           res.status(200).json(updatedUser);
//         } catch (err) {
//           next(err);
//         }
//       } else {
//         return next(createError(403, "You can update only your account"));
//       }
// })


// //delete user by id
// router.delete('/:id', auth, async (req, res, next) => {
//     if (req.params.id === req.params.id) {
//         try {
//           await User.findByIdAndRemove(req.params.id);
//           await Task.remove({ userId: req.params.id });
//           res.status(200).send("user deleted");
//         } catch (err) {
//           next(err);
//         }
//       } else {
//         return next(createError(403, "You can delete only your account"));
//       }
// })

// //follow a user
// router.put("/follow/:id", auth, async (req, res, next) => {
//     try {
//         //user
//         const user = await User.findById(req.params.id);
//         //current user
//         const currentUser = await User.findById(req.body.id);
    
//         if (!user.followers.includes(req.body.id)) {
//           await user.updateOne({
//             $push: { followers: req.body.id },
//           });
    
//           await currentUser.updateOne({ $push: { following: req.params.username } });
//         } else {
//           res.status(403).json("you already follow this user");
//         }
//         res.status(200).json("following the user");
//       } catch (err) {
//         next(err);
//       }
// })

// //unfollow a user
// router.put("/unfollow/:id", auth,  async (req, res, next) => {
//     try {
//         //user
//         const user = await User.findById(req.params.id);
//         //current user
//         const currentUser = await User.findById(req.body.id);
    
//         if (currentUser.following.includes(req.params.id)) {
//           await user.updateOne({
//             $pull: { followers: req.body.id },
//           });
    
//           await currentUser.updateOne({ $pull: { following: req.params.id } });
//         } else {
//           res.status(403).json("you are not following this user");
//         }
//         res.status(200).json("unfollowing the user");
//       } catch (err) {
//         next(err);
//       }
// })



// router.patch('/users/me', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['username', 'email', 'password', 'age', 'description']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])

//         await req.user.save()
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.delete('/users/me', auth, async (req, res) => {
//     try {
//         await req.user.remove()
//         sendCancelationEmail(req.user.email, req.user.name)
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

// const upload = multer({
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('Please upload an image'))
//         }

//         cb(undefined, true)
//     }
// })

// router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
//     const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
//     req.user.avatar = buffer
//     await req.user.save()
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })

// router.delete('/users/me/avatar', auth, async (req, res) => {
//     req.user.avatar = undefined
//     await req.user.save()
//     res.send()
// })

// router.get('/users/:id/avatar', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id)

//         if (!user || !user.avatar) {
//             throw new Error()
//         }

//         res.set('Content-Type', 'image/png')
//         res.send(user.avatar)
//     } catch (e) {
//         res.status(404).send()
//     }
// })

module.exports = router