const express = require('express');
const app = express()
const mustache = require('mustache-express');
const session = require('express-session')
const bodyParser = require('body-parser')
const parseurl = require('parseurl')
const fs = require('fs-extra');

app.set('views', __dirname + '/views')
app.engine('mustache', mustache() )
app.set('view engine', 'mustache');

app.listen(3000, function(){
  console.log("ok cool, listening!")
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(function (req, res, next) {
  var views = req.session.views
  if (!views) {
    views = req.session.views = {}
  }
  var pathname = parseurl(req).pathname
  views[pathname] = (views[pathname] || 0) + 1

  return next()
})

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")
const getWord = words[Math.floor((Math.random() * 235887))]
var sess
const word = []
const display = []
const guessedLetters = []
var split


app.get('/', function(req, res) {
  sess = req.session
  sess.getWord = getWord
  let chances = 8
  console.log(sess)
  const newGuess = guessedLetters.join(" ")
  if(sess['views']['/'] === 1) {
    word.push(sess.getWord)
    split = word[0].split('')
    console.log(split)
    for (var i = 0; i < split.length; i++) {
      display.push('_ ')
    }
  }
  if(sess['views']['/chances'] >= 1){
    chances = 8 - sess['views']['/chances']
  }
  return res.render('index', {
    check: display,
    guessed: newGuess,
    chances: chances
  })
})

app.get('/chances', function(req,res){
  return res.redirect('/')
})

app.post('/guess', function(req,res){
  sess = req.session
  const guess = (req.body.guess).toLowerCase()
  guessedLetters.push(guess)
  let wrong = true
  for (var i = 0; i < split.length; i++) {
    if(guess === split[i]) {
      display.splice(i, 1, guess)
      wrong = false
    }
  }
  console.log('wrong', wrong)
  if(wrong) {
    return res.redirect('/chances')
  }
  return res.redirect('/')
})
