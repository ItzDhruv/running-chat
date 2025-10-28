const express = require('express')
const upload = require('../Middleware/multer.js')

const { Regitration, Login, FetchUserDatail, FetchAllUsers } = require('../Controller/user.controller.js')
const { JWTAuth } = require('../Middleware/jwt.auth.js')

const UserRoutes = express.Router()

UserRoutes.post('/registation', upload.single('image'), Regitration)
UserRoutes.post('/login', Login)
UserRoutes.get('/fetchuserdetail', JWTAuth, FetchUserDatail)
UserRoutes.get('/getalluser', JWTAuth, FetchAllUsers)

module.exports = { UserRoutes }
