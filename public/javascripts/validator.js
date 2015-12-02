$().ready(function() {
  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-full-width",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  var classes = [
  "ACCT","MISY","AFSC","ANFS","ANTH","AGED","APEC","STAT","ART","ARTC",
  "ARTH","BAMS","BHAN","HLPR","NTDT","BISC","BMEG","BREG","EGTE","BUAD",
  "ENTR","ENEP","CHEM","CHEG","CIEG","BINF","CISC","COMM","EAMC","ECON",
  "EDUC","EDLM","EVAL","CPEG","ELEG","ENGL","JOUR","ENWC","FASH","FINC",
  "ARAB","CHIN","CMLT","FLLT","FREN","GRMN","GREK","HEBR","ITAL","JAPN",
  "LATN","PORT","RUSS","SPAN","ENSC","ENVR","GEOG","GEOL","HDFS","HIST",
  "HESC","HRIM","FSAN","KAAP","CGSC","LING","MALS","MATH","MEDT","MEEG",
  "MLSC","MSEG","MSST","MUSC","MUED","HSAD","NURS","AGRI","ARSC","BMSC",
  "DANC","EAST","JWST","LAMS","MCST","PRES","BMBA","EGGG","HEPP","CSCD",
  "HLTH","PHIL","PHYT","PHYS","SCEN","PLSC","POSC","UNIV","NSCI","PSYC",
  "MAST","CRJU","LEST","SOCI","DISA","LEAD","UAPP","THEA","SGST","WOMS"
  ];

  jQuery.validator.addMethod("inList", function(value, element, paramList) {
    var holderOne = value;
    var length = value.length;
    if((value.toUpperCase()).substr(0,4) != "ARTC" && (value.toUpperCase()).substr(0,3) == "ART") {
      return true && length == 6;
    }
    else {
      value = holderOne.toUpperCase().substr(0,4);
    }
    var result = jQuery.inArray(value, paramList);
    return result != -1 && length == 7;
  },"");

  jQuery.validator.addMethod("isInt", function(value, element, param) {
    value = value.toUpperCase();
    var checkOne = /\d{3}L$/;
    var checkTwo = /\d{3}D$/;
    var checkThree = /\d{3}/;

    if(value.length == 3) {
      return checkThree.test(value);
    }
    else if(value.length == 4) {
      return checkOne.test(value) || checkTwo.test(value);
    }
    else {
      return false;
    }
  },"");

  jQuery.validator.addMethod("isEmail", function(value, element, param) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(value);
  },"");

  $("#addCourse").validate({
    submitHandler: function(form) {
      // var sessionValue = $("#session").val();
      // $("#session").val(sessionValue);
      toastr.success('Great! We\'ll let you know if a seat opens up!');
    },
    showErrors: function(errorMap, errorList) {
      var messageOne = "Make sure course is similar to the form MATH243";
      var messageTwo = "Make sure section is similar to the form 010 or 020L";
      var messageThree = "Make sure email is similar to the form johnsmith@email.xxx";
      var containsOne = $("div:contains('Make sure course is similar to the form MATH243')");
      var containsTwo = $("div:contains('Make sure section is similar to the form 010 or 020L')");
      var containsThree = $("div:contains('Make sure email is similar to the form johnsmith@email.xxx')");
      for(i = errorList.length - 1; i >= 0; i--) {
        if(containsOne.length === 0 && errorList[i].message == messageOne ||
          containsTwo.length === 0 && errorList[i].message == messageTwo ||
          containsThree.length === 0 && errorList[i].message == messageThree) {
            toastr.error(errorList[i].message);
        }
      }
    },
    rules: {
      course: {
        inList: classes,
        required: true
      },
      section: {
        isInt: "",
        required: true
      },
      email: {
        required: true,
        email: true,
        isEmail: ""
      }
    },
    messages: {
      course: "Make sure course is similar to the form MATH243",
      section: "Make sure section is similar to the form 010 or 020L",
      email: "Make sure email is similar to the form johnsmith@email.xxx"
    }
  });
});
