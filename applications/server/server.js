const { application } = require("express");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({path:".env-local"});
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const userRouter = require("./routes/user");
const eventRouter = require("./routes/event")


app.use("/users", userRouter);
app.use("/events", eventRouter);
 

app.listen(PORT, () =>  console.log(`Server started on port ${PORT}`));