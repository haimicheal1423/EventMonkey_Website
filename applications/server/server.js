const { application } = require("express");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({path:".env-local"});
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({extended:false}));

const userRouter = require("./routes/user");
const eventRouter = require("./routes/event")


app.use("/users", userRouter);
app.use("/events", eventRouter);

// //set static folder
// const homePage = path.join(__dirname, "../client/home.html");
// // home
// app.get("/", (req, res)=>{
//     res.sendFile(homePage);
// });


app.listen(PORT, () =>  console.log(`Server started on port ${PORT}`));
