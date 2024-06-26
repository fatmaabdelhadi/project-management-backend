const { identity } = require("lodash")
const Project = require("../models/project")
const Task = require("../models/task.js")
const User = require("../models/user.js")
const task = require("../models/task.js")

const createProject = async (req, res) => {
  // Validate input
  const { projectName, description, projectManager, teamMembers, startDate, endDate } = req.body
  if (!projectName || !projectManager) {
    return res.status(400).send("Missing required fields")
  }
  const existingProject = await Project.findOne({ $and: [{ projectName }, { projectManager }] })
  if (existingProject) {
    return res.status(400).send("Project already exists")
  }
  const project = new Project(req.body)
  try {
    await project.save()
    res.send(`Project with ID ${project._id} created successfully`)
  } catch (error) {
    res.status(500).send("Error registering project")
  }
}

const getProject = async (req, res) => {
  const id = req.params.id
  try {
    const project = await Project.findById(id)
    if (project) res.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllProjects = async (req, res) => {
  try {
      const projects = await Project.find()
      res.json(projects)
  } catch (error) {
      console.error('Error fetching projects:', error)
      res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id
    const project = await Project.findByIdAndDelete(projectId)
    if (!project) {
      return res.status(404).send("Project not found")
    }
    res.send(project)
  } catch (error) {
    res.status(500).send("Error deleting project")
  }
}

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!project) return res.status(404).send("Project not found")
    res.send(project)
  } catch (error) {
    res.status(500).send("Error updating project")
  }
}

const updateCompletionPercentage = async (req, res) => {
  try {
    const projectId = req.params.id
    const project = await Project.findById(projectId)
    const tasks = await Task.find({ project: projectId });
    let count = 0

    for(let i = 0; i < tasks.length; i++){
      const task = await Task.findById(tasks[i])
      if(task.status == "Completed"){
        count++
      }
    }

    project.progress.completedTasks = count
    const completedTasks = project.progress.completedTasks
    project.progress.totalTasks = tasks.length
    const totalTasks = project.progress.totalTasks
    project.progress.completionPercentage = Math.ceil((completedTasks / totalTasks) * 100)

    await project.save()
    res.send(`Project percentage for project with ID ${project._id} calculated successfully`)
  } catch (error) {
    console.error('Error updating completion percentage:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllUserProjects = async (req, res) => {
  try {
    const userId = req.params.userId
    const projects = await Project.find({ projectManager: userId })
    res.status(200).json(projects)
  } catch (error) {
    console.error('Error fetching user projects:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  createProject,
  getProject,
  getAllProjects,
  deleteProject,
  updateProject,
  updateCompletionPercentage,
  getAllUserProjects
}