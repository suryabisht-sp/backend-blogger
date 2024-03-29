require('dotenv').config()
const express = require('express')
const cors = require('cors');
const path = require("path")
const app = express();
const connectToDatabase = require("./connectDB/connectToDatabase.js")
const cookieParser = require('cookie-parser');
const router = require('./routes/user.js')
const Blog= require('./model/blog.js');
const blog = require('./routes/blog.js');
const PORT = process.env.PORT
const url = process.env.MONGODB_URL
const { blogSearch } = require('./controller/blog.js');

connectToDatabase(url)
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}
// Enable CORS for all routes with specific options
// app.use(cors(corsOptions));
app.use(cors());
// template engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
// app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', async (req, res) => {
const allBlogs = await Blog.find({}).populate({ path: "createdBy", select: "-password -salt" })
res.status(200).json({"data":allBlogs})
})
app.get('/search', blogSearch)

app.use("/api/v1/user", router)
app.use("/api/v1/blog", blog)

app.use((req, res, next) => {
res.status(404).json({"msj":"route not found"})
});

app.listen(PORT, () => {
console.log(`server is up at port ${PORT}`)
})