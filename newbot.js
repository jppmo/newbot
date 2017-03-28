/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// import the discord.js module
const Discord = require('discord.js');

// create an instance of a Discord Client, and call it bot
var bot = new Discord.Client();
var request = require("request");
var ytdl = require("ytdl-core");
var fs = require("fs");
var ffmpeg = require('ffmpeg');
var parser = require('luaparse');
// the token of your bot - https://discordapp.com/developers/applications/me
const token = 'Mjg3MDUyOTY1NTY5NjI2MTEz.C5yJ2Q.vxvyU8ZmoCW6S5nSg4q8HppQyso';
const client_id = '287052965569626113';
// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
  console.log('I am ready!');
});

// create an event listener for messages
bot.on('message', message => {

  if(message.content.substr(0,1) === '!') messageHandler(message);
});

var commands = {
  "about": {
      usage: "",
      description: "",
      process: function (bot, msg, args) {
        msg.channel.sendMessage("all around useless bot");
      }
  },
  "say": {
      usage: "",
      description: "",
      process: function (bot, msg, args) {
        var msgTts = args.join(" ");
        msg.channel.sendMessage(msgTts, {tts:true});
      }
  },
  "silly" : {
      usage: "",
      description: "",
      process: function (bot, msg, args) {

        request({
          uri: "http://tambal.azurewebsites.net/joke/random",
          method: "GET",
          timeout: 10000,
          followRedirect: true,
          maxRedirects: 10
          }, function(error, response, body) {
            var param = args.toString().trim();
            var jsonResponse = JSON.parse(body);
            if(param == "tts") {
              msg.channel.sendMessage(jsonResponse.joke, {tts:true});
            } else msg.channel.sendMessage(jsonResponse.joke);

        });
      }
  },
  "wiki" : {
      usage: "",
      description: "",
      process: function(bot, msg, args) {
        request({
            method: "GET",
            uri: "https://en.wikipedia.org/w/api.php?callback=?",
            /*qs: {
              action: "query",
              list: "search",
              srsearch: args.toString(),
              srlimit: 10,
              srprop: "size",
              format: "json"
            },*/
            qs: {
              action: "opensearch",
              search: args.toString(),
              limit: 1,
              namespace: 0,
              format: "json"
            },
            headers: {'Api-User-Agent': 'Content-Type:application/json'}
          }, function(error, response, body) {

            console.log(response.statusCode + " args: " + args);
            console.log("bla"+args);
            console.log("--------------------------------");
            var jsonResponse = body.substr(5, body.length-6); //wtf
            var jsonResponse = JSON.parse(jsonResponse);
            msg.channel.sendMessage(jsonResponse[2]);
            console.log(jsonResponse);
            //console.log(jsonResponse.query["pages"].revisions);
        });
      }
  },
  "yt" : {
      usage: "",
      description: "",
      process: function(bot, msg, args) {

        const channel = msg.member.voiceChannel;
        const voiceConnection = bot.voiceConnections.get(msg.guild.id);
        if(validateYouTubeUrl(args)) {
          if(voiceConnection == null) {
            channel.join()
            .then( function(connection) {
              const stream = ytdl(args.toString(), {filter : 'audioonly'});
              const dispatcher = connection.playStream(stream);

            }).catch(console.error);
          }
        }else msg.channel.sendMessage("!play \"link youtube\"");
      }

  },
  "trivia": {
      description: "",
      usage: "",
      process: function (bot, msg, args) {
        /*var msgTts = args.join(" ");
        msg.channel.sendMessage(msgTts, {tts:true});*/
        fs = require('fs');
        fs.readFile('triviaquestions/TriviaQuestions.lua', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }

          dataArray = data.split("\n");

          for (var i = 0; i < dataArray.length; i++) {
            console.log(dataArray[i].replace("TriviaBot_Questions[1]", " "));
          }
          /*
          dataJsonStringify = JSON.stringify(data, null, 1);
          dataJsonParse = JSON.parse(dataJsonStringify);
          //dataJsonStringify = dataJsonStringify.replace('TriviaBot_Questions[1]', ' ');
          console.log(dataJsonParse.replace("TriviaBot_Questions[1]", " "));
          */
/*
          for (var i = 0; i < 20; i++) {

            for (var j = 0; j < astJsonParse.body[i].variables[j].type.length; j++) {
              console.log(astJsonParse.body[i].variables[j].type);
            }
            //console.log(astJsonParse.body[i].variables[0].type);
          }
          console.log(astJsonParse.body[10].variables[0].type);
          //console.log(astJsonParse.body[10].variables);
          */
        });
      }
  }
};

function validateYouTubeUrl(url)
{
        if (url != undefined || url != '') {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
            var match = String(url).match(regExp);
            if (match && match[2].length == 11) return true;
            return false;
        }
}

function messageHandler(message) {
  var input = message.content.split(" ");
  var mainCommand = input.shift().substr(1);
  var args = input;
  var cmd = commands[mainCommand];

  console.log(mainCommand + " | " + args);
  cmd.process(bot, message, args);
}
// log our bot in
bot.login(token);
