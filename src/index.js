const express = require('express');
require('./db/mongoose');
const userRouter = require('./routes/user-route');
const taskRouter = require('./routes/task-route');

const app = express();
const port = process.env.port;

//Converting the params to json object
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);



//Staring the server
app.listen(port, () =>{
    console.log(`Server is up on port ${port}`);
});