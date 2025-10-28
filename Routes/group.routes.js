const express = require('express')
const { JWTAuth } = require('../Middleware/jwt.auth.js')
const { CreateGC } = require('../Controller/group.controller.js')
const upload = require('../Middleware/multer.js')

const GroupRoutes = express.Router()

GroupRoutes.post('/gccreate', upload.single('image'), JWTAuth, CreateGC)

module.exports = GroupRoutes