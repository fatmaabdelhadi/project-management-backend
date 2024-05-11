const express = require('express')
const router = express.Router()
const taskController = require('../controllers/task')

router.post('/create', taskController.createTask)
router.get('/find/:id', taskController.getTask)
router.get('/all', taskController.getAllTasks)
router.put('/update/:id', taskController.updateTask)
router.delete('/delete/:id', taskController.deleteTask)
router.get('/user/:userId', taskController.getAllUserTasks) // User Tasks
router.get('/project/:projectId', taskController.getAllProjectTasks) // Project Tasks

module.exports = router