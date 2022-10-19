const { application } = require("express");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({path:".env-local"});
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:false}));

const userRouter = require("./routes/user");
const eventRouter = require("./routes/event")


app.use("/prototype/users", userRouter);
app.use("/prototype/events", eventRouter);

//set static folder
const homePage = path.join(__dirname, "../client/home.html");
// home
app.get("/", (req, res)=>{
    res.sendFile(homePage);
});
// 
// app.get("/api/users", (req, res) =>{
//     res.send(["Sajan", "Michael", "Ron"]);
// });



app.listen(PORT, () =>  console.log(`Server started on port $PORT`));