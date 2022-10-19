const { application } = require("express");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({path:".env-local"});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:false}));

// //set static folder
// app.use("/static", express.static(path.join(__dirname, "../client")));

// home
app.get("/", (req, res)=>{
    res.status(200).send("This is homepage. Use /api/users/:id");
});
// 
// app.get("/api/users", (req, res) =>{
//     res.send(["Sajan", "Michael", "Ron"]);
// });
const userRouter = require("./routes/user");
const eventRouter = require("./routes/event")
app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);


app.listen(PORT, () =>  console.log(`Server started on port $PORT`));