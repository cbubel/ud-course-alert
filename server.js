var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var request = require('request');
var Promise = require('promise');

var app = express();

var Parse = require('parse/node').Parse;
Parse.initialize('SE0Uv21uTPkXeFYmFbPVKYJjTCCMT4PhmMzP277b', 'gSBcvZHRXsxsjwGxENsOund70ZFHvWyDNxqQSEls', '46dLalKuFkuJ3i0wRDuW22i9L2K1sOzXaaELVTgU');
var Entry = Parse.Object.extend("Entry");
var sendgrid = require("sendgrid")('KEY');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  getEntries();
}, the_interval);

var getEntries = function() {
  var query = new Parse.Query(Entry);

  query.find().then(
    function(entries) {
      for (var i = 0; i < entries.length; i++) {
        var session = entries[i].attributes.session;
        var course = entries[i].attributes.course;
        var section = entries[i].attributes.section;
        var emails = entries[i].attributes.emails;
        var objectId = entries[i].id;
        var term = "";
        var data = {
          session: session,
          course: course,
          section: section,
          emails: emails,
          objectId: objectId
        };
        var url = "";
        if (session === "spring2016") {
          term = "2163";

          url = "https://udapps.nss.udel.edu/CoursesSearch/search-results?term=" + term + "&search_type=A&course_sec=" + course + section + "&session=1&course_title=&instr_name=&text_info=All&instrtn_mode=All&time_start_hh=&time_start_ampm=&credit=Any&keyword=&subj_area_code=&college=";
        } else if(session === "winter2016") {
          term = "2161";

          url = "https://udapps.nss.udel.edu/CoursesSearch/search-results?term=" + term + "&search_type=A&course_sec=" + course + section + "&session=WIN&course_title=&instr_name=&text_info=All&instrtn_mode=All&time_start_hh=&time_start_ampm=&credit=Any&keyword=&subj_area_code=&college=";
        }

        check(data, url);
      }
    },
    function(err) {
      console.log(err);
    }
  )
}

function parseSeats(objectId, course, section, lines) {
  found = false;
  lines = lines.split('\n');


  for (var i = 0; i < lines.length; i++) {
    if(lines[i].indexOf(course + section) > -1) {
      found = true;
    }
    if(lines[i].indexOf("No results.") > -1) {
      Parse.Cloud.useMasterKey();
      var entry = new Entry({objectId: objectId});
      entry.destroy().then(
        function(entry) {
          return null;
        },
        function(err) {
          console.log(err);
        }
      );
    };
    if (found && lines[i].indexOf("openseats") > -1) {
      // Extract the seats by splitting the line strategically
      // This should probably be abstracted in the future
      open_seats = lines[i].slice(28, lines[i].length).split(" ")[0];
      open_seats = parseInt(open_seats);
      return open_seats;
      // resolve(open_seats);
    }
  }
  return null;
}

function check(data, url) {
  var promise = new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(response.body);
      }
      else {
        resolve(null);
      }
    });
  });
  promise.then(function(onFulfilled, onRejected) {
    if(onFulfilled !== null) {
      open_seats = parseSeats(data.objectId, data.course, data.section, onFulfilled);

      if (open_seats === null) {
        return;
      }
      if (open_seats > 0) {
        console.log('found some for ' + data.course + data.section);
        var email = new sendgrid.Email();
        var subject = (data.course + data.section).toUpperCase() + " has an open seat!";
        var body = "Good news! " + (data.course + data.section).toUpperCase() + " has an open seat!<br /><br /><strong>Note</strong>: Though you've received this email, the seat for this course may be taken by the time you try to add it on UDSIS. This can happen if students hold seats for their friends, in which case the course is dropped and then added almost immediately, though it will still be listed as having an open seat for a short amount of time.<br /><br />If you'd like to add another course, you can do so here: <a href='http://udcoursealert.x10host.com/'>udcoursealert.x10host.com</a>";

        var payload = {
          to: data.emails,
          from: "admin@udcoursealert.x10host.com",
          subject: subject,
          html: body
        }

        Parse.Cloud.useMasterKey();

        // sendgrid.send(payload, function(err, json) {
        //   if (err) { console.error(err); }
        //   else {
        //     var entry = new Entry({objectId: data.objectId});
        //     entry.destroy().then(
        //       function(entry) {
        //         console.log('destroy!');
        //         return;
        //       },
        //       function(err) {
        //         console.log(err);
        //       }
        //     );
        //   }
        // });
      }
    }
  });
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
