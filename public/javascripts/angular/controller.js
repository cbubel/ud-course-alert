(function () {
  var app = angular.module('app');
  var Entry = Parse.Object.extend("Entry");

  app.controller('Controller', ['$scope', function($scope) {
    var app = this;
    var scope = $scope;

    var validate = function(input) {
      if (input === null || input === undefined || input === '') return false;
      else return true;
    }

    app.submit = function(session, course, section, email) {
      if(validate(session) && validate(course) && validate(section) && validate(email)) {
        var query = new Parse.Query(Entry);
        query.equalTo("session", session);
        query.equalTo("course", course);
        query.equalTo("section", section);
        query.find().then(
          function(entries) {
            if(entries.length <= 0) {
              var entry = new Entry({session: session, course: course, section: section, emails: [email]});
            }
            else {
              var entry = new Entry({id: entries[0].id});
              entry.addUnique("emails", email);
            }

            entry.save().then(
              function(entry) {
                console.log("Success");
                var form = document.getElementById("addCourse");
                form.reset();
              },
              function(error) {
                console.log(error);
              }
            );
          },
          function(error) {
            console.log(error);
          }
        )

      }
      else {
        console.log('Invalid input');
      }
    };

  }]);
})();
