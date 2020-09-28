const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
let uri = 'mongodb+srv://Luna:LOLLOL26@mongodbandmongoosechall.foypt.mongodb.net/db1?retryWrites=true&w=majority'
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }); 


app.use(cors())



app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

//dadsaddsadsa

let exerciseSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
})

let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseSchema]
})

let User = mongoose.model('User', userSchema)
let Exercise = mongoose.model('Exercise', exerciseSchema)

app.post('/api/exercise/new-user', bodyParser.urlencoded({extended: false}),(request, response) => {
  let newUser = new User({username: request.body.username})
  newUser.save((error, savedUser) => {
    if(!error){
      response.json({username: savedUser.username, _id: savedUser.id})
    }
  })
})

app.get('/api/exercise/users', (request, response) => {
  User.find({}, (error, arrayOfUsers) => {
    if(!error){
      response.json(arrayOfUsers)
    }
  })
})

app.post('/api/exercise/add', bodyParser.urlencoded({extended: false}), (request, response) => {
  
  let newExerciseItem = new Exercise({
    description: request.body.description,
    duration: parseInt(request.body.duration),
    date: request.body.date
  })
  
  if(newExerciseItem.date === ''){
    newExerciseItem.date = new Date().toISOString().substring(0,10)
  }
  
  User.findByIdAndUpdate(
    request.body.userId,
    {$push: {log: newExerciseItem}},
    {new: true},
    (error, updatedUser) => {
    if(!error){
      let responseObject = {}
      responseObject['_id'] = updatedUser.id
      responseObject['username'] = updatedUser.username
      responseObject['description'] = newExerciseItem.description
      responseObject['duration'] = newExerciseItem.duration
      responseObject['date'] = new Date(newExerciseItem.date).toDateString()
      response.json(responseObject)
    }
  })
})


app.get('/api/exercise/log', (request, response) => {
  
  User.findById(request.query.userId, (error, result) => {
    if(!error){
      let responseObject = result
      
      if(request.query.from || request.query.to){
        
        let fromDate = new Date(0)
        let toDate = new Date()
        
        if(request.query.from){
          fromDate = new Date(request.query.from)
        }
        
        if(request.query.to){
          toDate = new Date(request.query.to)
        }
        
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()
        
        responseObject.log = responseObject.log.filter((session) => {
          let sessionDate = new Date(session.date).getTime()
          
          return sessionDate >= fromDate && sessionDate <= toDate
          
        })
        
      }
      
      if(request.query.limit){
        responseObject.log = responseObject.log.slice(0, request.query.limit)
      }
      
      responseObject = responseObject.toJSON()
      responseObject['count'] = result.log.length
      response.json(responseObject)
    }
  })
  
})


