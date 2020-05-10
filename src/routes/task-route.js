const express = require('express');
const Task = require('../models/task')
const auth = require('../middleware/auth');

const router = new express.Router();

//Setting path to create a new task
router.post('/task', auth, async (req, res) =>{

    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{

        await task.save();
        res.status(201).send(task);

    } catch(error){

        res.status(400).send(error);

    }
})


//Setting path to read all the tasks
/* Filters
1) completed = true/false -> query completed
/task?completed=true/false
2) sortBy = createdAt:desc/asc
*/
router.get('/task', auth, async (req, res) =>{

    const match = {};
    const sort = {};

    if(req.query.completed){

       match.completed = req.query.completed === 'true';
    } 

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try{

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                sort,
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks);

    } catch(error) {

        res.status(500).send(error);
    }
})


//Setting path to read a specific task by id
router.get('/task/:id', auth, async (req, res) =>{

    const _id = req.params.id;

    try{

       // const task = await Task.findById({_id});
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send('No task found')
        } else{
            res.status(200).send(task);
        }

    } catch(error) {

            res.status(500).send(error);

    }
})


// Setting a path to update a task
router.patch('/task/:id', auth, async(req, res) =>{

    const availableUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => availableUpdates.includes(update));

    if(!isValidUpdate){
        return res.status(400).send();
    }

    try{

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if(!task){
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        
        await task.save();
        res.status(200).send(task);

    } catch(error){

        res.status(500).send(error);

    }
})


// Setting path to delete a task
router.delete('/task/:id', auth, async(req,res) =>{

    try{

        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);

    } catch(error){

        res.status(500).send(error);
    }
})


module.exports = router;
