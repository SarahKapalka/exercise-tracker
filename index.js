const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
mongoose.connect("mongodb+srv://Yooril:90210gonow@cluster0.udaws.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = mongoose.Schema({
 username: {
  type: String,
  required: true
 }
});
const exSchema = mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date,
})

const USER = mongoose.model('USER', userSchema);
const EXR = mongoose.model('EXR', exSchema);

app.post('/api/users', (req, res)=>{
  let data = new USER({username: req.body.username});
  data.save((err,data)=>{
    if (err) return console.log(err._message);
    res.json({username: data.username, _id: data["_id"]})
  })
});

app.get('/api/users', (req,res)=>{
  USER.find({}, (err,data)=>{
    if (err) return console.log(err._message);
    res.json(data)
  })
});

app.post('/api/users/:_id/exercises', (req,res)=>{
  
  let input = req.body;
  let id= req.params._id;
  let date= input.date===undefined?new Date():new Date(input.date);
  USER.findById(id, (err,userdata)=>{
    if(err) return console.log(err._message);
    let doc = new EXR({
      userId: id,
      description: input.description,
      duration: input.duration,
      date: date
    });
    doc.save((err,data)=>{
      if (err) return console.log(err._message);
      res.json({
        username: userdata.username,
        description: data.description,
        duration: data.duration,
        date: data.date.toDateString(),
        _id: userdata._id,
      })
    })
    })
});

app.get('/api/users/:id/logs', (req,res)=>{
  let input = req.body;
  let id= req.params.id;
  let {limit, from, to}= req.query;
  USER.findById(id, (err,userdata)=>{
    if (err) return console.log(err._message);
    let findobj={userId: id};
    if(from){
      findobj.date= {"$gte":new Date(from)};
    }else if(to){
      findobj.date= {"$lte":new Date(to)};
    };
    if(from&&to){
      findobj.date= {"$gte":new Date(from), "$lte":new Date(to)}
    }
    EXR.find(findobj ,{_id:0, __v:0, userId:0}, (err, data)=>{
      if (err) return console.log(err._message);
      let data2 = data
      let newdata= data2.map(x=>{
        return {description: x.description, duration: x.duration, date: x.date.toDateString()}
      });
      res.json({
        username: userdata.username,
        count: data.length,
        _id: userdata._id,
        log: newdata
      })
    }).limit(limit==null?0:limit)
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
