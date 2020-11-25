const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const moment = require('moment')

const cors = require('cors')

let uri = 'mongodb+srv://Luna:LOLLOL26@mongodbandmongoosechall.foypt.mongodb.net/issue_tracker?retryWrites=true&w=majority'
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const issueScehma = new Schema({
  username: { type: String, required: true },
  description: String,
  duration: Number,
  date: String
});

const Issues = mongoose.model("Issues", issueScehma);


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


let resObject = {}
app.post("/api/exercise/new-user",(req,res) => {
  var usename = req.body.username
  // res.send({no:usename})


  resObject['username'] = usename

  Issues.findOne({username:usename})
.exec((err,result) => {
if(!err && result != undefined){
  res.send("Username already taken")
  return
}
  if(!err){
    Issues.findOneAndUpdate(
      {username:usename},
      {username:usename},
      {new: true,upsert: true},
      (err,savedUrl) => {
        if(!err){
          resObject['_id']= savedUrl._id
          res.json(resObject)
        }
      }
    )
  }
})


})


app.get('/api/exercise/users',(req,res) => {
  Issues.find({})
  .exec((err,result) => {
    res.json(result)
  })
  
})

var resObject2 = {}
app.post('/api/exercise/add',(req,res) =>{

  var DateRegex = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/gi

  var currentDate = req.body.date.toString()


  if(!DateRegex.test(currentDate) || currentDate == ""){
    var temp = new Date()
    var date = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    req.body.date = (moment(date).format('dddd MMMM D Y'));
    

  }
  else{
    var dateSplit = currentDate.split("-")
    var date = new Date(dateSplit[0], dateSplit[1], dateSplit[2]);
    req.body.date = (moment(date).format('dddd MMMM D Y'));
  }


  Issues.findOneAndUpdate(
    {_id:req.body.userId},
    {description:req.body.description,duration:req.body.duration,date:req.body.date},
    {new:true,upsert:true},
    (err,savedData) =>{
      if(!err){
        
        resObject2['_id']=req.body.userId

        resObject2['username']=
        savedData['username']

        resObject2['date']=req.body.date

        resObject2['duration']=req.body.duration
        
        resObject2['description']=req.body.description

    res.json(resObject2)
      }
    }
  )
})

app.get("/api/exercise/log/:jj",(req,res) => {

var name = req.params.jj.toString()

  Issues.find(
    {username:name})
    .exec((err,data) => {
      if(!err && data != []){
        res.json({data})
        
      }

      else(
        res.json({no:"this doesnt work"})
      )
      
    })
  
})



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
