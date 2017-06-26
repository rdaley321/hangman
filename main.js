const express = require('express');
const app = express()
const mustache = require('mustache-express');
const session = require('express-session')
const bodyParser = require('body-parser')
const parseurl = require('parseurl')
const fs = require('fs-extra');
const expressValidator = require('express-validator')

app.set('views', __dirname + '/views')
app.engine('mustache', mustache() )
app.set('view engine', 'mustache');

app.listen(3000, function(){
  console.log("ok cool, listening!")
});

app.use(express.static(__dirname + '/public'))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressValidator())
app.use(function (req, res, next) {
  var views = req.session.views
  if (!views) {
    views = req.session.views = {}
  }
  var pathname = parseurl(req).pathname
  views[pathname] = (views[pathname] || 0) + 1

  return next()
})

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toUpperCase().split("\n")
let getWord = words[Math.floor((Math.random() * words.length))]
let word = []
let display = []
let guessedLetters = []
let gameOverWin = true
let gameOverLose = false
let tryAgain = ''
let gameOverMsgLose = ''
let gameOverMsgWin = ''
let takeAGuess = 1
let gameOver = 0

var sess
var split
var errors

app.get('/', function(req, res) {
  sess = req.session
  sess.getWord = getWord
  let chances = 8
  let gameOverWin = true
  console.log(sess)
  const newGuess = guessedLetters.join(" ")
  if(sess['views']['/'] === 1) {
    word.push(sess.getWord)
    split = word[0].split('')
    console.log(split)
    for (var i = 0; i < split.length; i++) {
      display.push(' _ ')
    }
  }
  if(sess['views']['/chances'] >= 1){
    chances = 8 - sess['views']['/chances']
  }
  if(errors) {
    let errorMsg = errors[0].msg
    tryAgain = ''
    return res.render('index', {
      check: display,
      guessed: newGuess,
      chances: chances,
      tryAgain: tryAgain,
      gameOverMsgLose: gameOverMsgLose,
      gameOverMsgWin: gameOverMsgWin,
      errorMsg: errorMsg,
      takeAGuess: takeAGuess,
      gameOver: gameOver
    })
  }
  for (var i = 0; i < display.length; i++) {
   if(' _ ' === display[i]) {
     gameOverWin = false
   }
  }
  if(chances === 0) {
    takeAGuess = 0
    gameOver = 1
    gameOverLose = true
    gameOverMsgLose = 'GAME OVER YOU LOSE!'
  }
  if(gameOverLose) {
    display = sess['getWord']
    console.log(sess['getWord'])
  }
  if(gameOverWin && !gameOverLose) {
    takeAGuess = 0
    gameOver = 1
    gameOverMsgWin = 'GAME OVER YOU WIN!'
  }
  return res.render('index', {
    check: display,
    guessed: newGuess,
    chances: chances,
    tryAgain: tryAgain,
    gameOverMsgLose: gameOverMsgLose,
    gameOverMsgWin: gameOverMsgWin,
    takeAGuess: takeAGuess,
    gameOver: gameOver
  })
})

app.get('/chances', function(req,res){
  return res.redirect('/')
})

app.post('/guess', function(req,res){
  req.checkBody("guess", "You must enter a letter!").notEmpty();
  req.checkBody("guess", "Only letters are accepted!").isAlpha();
  req.checkBody("guess", "Please enter only one letter at a time!").isLength({min:0, max:1});
  errors = req.validationErrors();
  console.log(errors)
  console.log(split)
    if (!errors) {
      sess = req.session
      const guess = (req.body.guess).toUpperCase()
      let alreadyGuessed = false
      for (var i = 0; i < guessedLetters.length; i++) {
        if(guess === guessedLetters[i]) {
          alreadyGuessed = true
        }
      }
      if(alreadyGuessed) {
        tryAgain = 'You have already guessed that letter. Please enter another letter'
      } else {
        tryAgain = ''
        guessedLetters.push(guess)
        let wrong = true
        for (var i = 0; i < split.length; i++) {
          if(guess === split[i]) {
            display.splice(i, 1, guess)
            wrong = false
          }
        }
        if(wrong) {
          return res.redirect('/chances')
        }
      }
    }
  return res.redirect('/')
})
app.post('/newGame', function(req,res) {
  sess = req.session
  takeAGuess = 1
  gameOver = 0
  gameOverWin = true
  gameOverLose = false
  tryAgain = ''
  gameOverMsgLose = ''
  gameOverMsgWin = ''
  word = []
  display = []
  guessedLetters = []
  sess['views']['/'] = 0
  sess['views']['/chances'] = 0
  sess['getWord'] = ''
  // if(req.body.easy === 'easy'){
  //   let newWord = words[Math.floor((Math.random() * 235887))]
  //   for (var i = 0; newWord.length >= 4 && newWord.length <= 6; i++) {
  //     newWord = words[Math.floor((Math.random() * 235887))]
  //   }
  //   getWord = newWord
  //   console.log('YOUR ON EASY')
  // }
  getWord = words[Math.floor((Math.random() * words.length))]
  return res.redirect('/')
})
