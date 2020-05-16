const app = require('./app');

const port = process.env.PORT;

//Staring the server
app.listen(port, () =>{
    console.log(`Server is up on port ${port}`);
});