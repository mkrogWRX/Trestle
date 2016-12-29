/* Week in Trestle Messages */
var weeklyCalendar = [
    { Day: 'Sunday', Message: 'Sunday specials' },
    { Day: 'Monday', Message: 'Monday' },
    { Day: 'Tuesday', Message: '2 For 1 Tuesdays' },
    { Day: 'Wednesday', Message: 'Locals Wednesdays' },
    { Day: 'Thursday', Message: 'Pump Track 101 Thursdays' },
    { Day: 'Friday', Message: 'Freeride Fridays' },
    { Day: 'Saturday', Message: 'Longer Hours' },
];

/* Case insensative contains selector */
$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

/* Responsive Menu Scripts */
jQuery(document).ready(function ($) {

    //allow cross domain ajax queries
    $.support.cors = true;

    // Header Pieces
    menuHookup();
    getCurrentConditions();
    currentEventsCalendar();
    weekInTrestle();

    /* Add the forecast, lifts, trails. */
    addLifts();
    addTrails();

    /* Add the leader boards */
    populateLeaderBoards();

    /* Add the contest */
    contestHookup();

    //Ski+Ride school video tabs
    videoTabHookup();

    //linkup military verification pop up
    popupValidation();

    //Add in Full Events Calendar
    fullEventsList();

    //Scroll To In Page
    scrollToHours();

    //Build Navigation Tabs Within Page
    displayNavTabs();

    //link up all the activity forms
    hookupIntopiaActivities();

    //Scroll Sponsor Logos in footer
    scrollSponsor();

});

function menuHookup() {
    var $menu = $('#menu'),
        $menulink = $('.menu-link'),
        $menuTrigger = $('.has-submenu > a');

    $menulink.click(function (e) {
        e.preventDefault();
        $menulink.toggleClass('active');
        $menu.toggleClass('active');
    });

    $menuTrigger.click(function (e) {
        e.preventDefault();
        var $this = $(this);
        $this.toggleClass('active').next('ul').toggleClass('active');
    });
}

function getCurrentConditions() {
    // should exist on every page
    // Call custom service
    $.ajax({
        type: "GET",
        url: "http://api.wunderground.com/api/8aa49fbebb3f70f9/conditions/q/pws:KCOWINTE10.json",
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (conditions) {
            $('.overlayWeather .icon span.climacon').addClass(conditions.current_observation.icon);
            $('.overlayWeather .temperature').html(conditions.current_observation.temp_f + " &deg;F");
            $('.overlayWeather .conditions').text(conditions.current_observation.weather);
            //$('.currentStatusOverlay').append($('<div/>', {
            //    'class': 'openStatus',
            //    'html': conditions.openLifts + '&nbsp;&nbspLift' + ((conditions.openLifts > 1) ? 's' : '')
            //})).append($('<div/>', {
            //    'class': 'openStatus',
            //    'html': conditions.openTrails + '&nbsp;&nbspTrail Sections'
            //}))
        },
        error: function (msg) {
            /* do nothing for the guest 
            alert(JSON.stringify(msg)); /**/
        }
    });
}

function addLifts() {
    if ($('#trestleLifts').length > 0) {
        // Call custom service
        $.ajax({
            type: "GET",
            url: "http://powder.intrawest.com/feed?format=json&resortId=11",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function (data) {
                $('#trestleLifts time').text("as of " + data.LastUpdate + " MST");

                $.each(data.MountainAreas[0].Lifts, function (index, value) {
                    // Lift Table
                    $("#trestleLifts table tbody").append($('<tr/>', {
                        'class': (index % 2 == 0 ? 'odd' : 'even')
                    }).append($('<td/>', {
                        'class': 'has-icon'
                    }).append($('<span/>', {
                        'class': value.LiftType
                    })).append($('<h6/>', {
                        'text': value.Name
                    }))).append($('<td/>', {
                        'text': value.Notes
                    })).append($('<td/>', {
                        'text': value.Status
                    })));
                });
            },
            error: function (msg) {
                /* do nothing for the guest 
                alert(JSON.stringify(msg)); /**/
            }
        });
    }
}

function addTrails() {
    if ($('#trestleTrails').length > 0) {
        // Call custom service
        $.ajax({
            type: "GET",
            url: "http://powder.intrawest.com/feed?format=json&resortId=11",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function (data) {

              

        
                var res = data.LastUpdate.replace(/^(\d{2})(\d{2})(\d{4})$/);

               

                $('#trestleTrails time').text("as of " + res + " MST");

                $.each(data.MountainAreas[0].Trails, function (index, value) {
                    // Check for Banaana Peel
                    var nameHTML = value.Name;
                    if (nameHTML == "Banana Peel") {
                        nameHTML = 'Banana Peel&nbsp;&nbsp<a href="/BananaPeel.html"><img class="moreInfo" title="Pro Line Trail" src="/images/ProLine.png" /></a>';
                    }

                    // Lift Table
                    $("#trestleTrails table tbody").append($('<tr/>', {
                        'class': (index % 2 == 0 ? 'odd' : 'even')
                    }).append($('<td/>', {
                        'class': 'has-icon'
                    }).append($('<span/>', {
                        'class': value.Difficulty
                    })).append($('<h6/>', {
                        'html': nameHTML
                    }))).append($('<td/>', {
                        'text': value.Notes
                    })).append($('<td/>', {
                        'text': value.Status
                    })));
                });
            },
            error: function (msg) {
                /* do nothing for the guest 
                alert(JSON.stringify(msg)); /**/
            }
        });
    }
}

function videoTabHookup() {
    $('ul#tabs li a').click(function (event) {
        // don't jump around the page
        event.preventDefault();

        //get the current displayed content section
        var oldContainer = $('#' + $('ul#tabs li a.selected').attr('id') + 'Content');
        var newContainer = $('#' + $(this).attr('id') + 'Content');

        //switch to the next tab
        $('ul#tabs li a').removeClass('selected');
        $(this).addClass('selected');

        //flash out the youtube iFrames so it looks less jaring
        oldContainer.fadeOut(250, function () {
            newContainer.fadeIn(250);
        });
    });
}

function weekInTrestle() {
    if ($('#trestleSpecials').length > 0) {
        var d = new Date();
        var today = d.getDay();

        // Show the next 5 days in the trestle week
        for (var i = 0; i < 5; i++) {
            $('#trestleSpecials').append($('<div/>', {
                'class': 'calEvent ' + (i == 0 ? 'first' : (i == 1 ? 'second' : (i == 2 ? 'third' : '')))
            }).append($('<div/>', {
                'class': 'calDate',
                'text': weeklyCalendar[(i + today) % 7].Day + ' -'
            })).append($('<div/>', {
                'class': 'calDetails'
            }).append($('<a/>', {
                'href': '/index.html',
                'text': weeklyCalendar[(i + today) % 7].Message
            }))));
        }
    }
}

function displayNavTabs() {
    $(".tabContent").hide();
    $("ul.tabs li:first").addClass("active").show();
    $(".tabContent:first").show();

    $("ul.tabs li").click(function () {
        $("ul.tabs li").removeClass("active");
        $(this).addClass("active");
        $(".tabContent").hide();
        var activeTab = $(this).find("a").attr("href");
        $(activeTab).fadeIn();
        return false;
    });

    var hash = $.trim(window.location.hash);

    if (hash) $('.tabs li a[href$="' + hash + '"]').trigger('click');


}

function currentEventsCalendar() {
    if ($('#eventsCalendar').length > 0) {
        // Call XML
        $.ajax({
            type: "GET",
            url: "/eventsCalendar.xml",
            dataType: "XML",
            success: function (xml) {
                var calCount = 0;
                var today = new Date();
                $(xml).find("event").each(function () {
                    var start = new Date($(this).find("date").text());
                    // only show the first 5 events in the future
                    if (today <= start && calCount < 5 ) {
                        calCount++;
                        $('#eventsCalendar').append($('<div/>', {
                            'class': 'calEvent ' + (calCount == 1 ? 'first' : (calCount == 2 ? 'second' : (calCount == 3 ? 'third' : '')))
                        }).append($('<div/>', {
                            'class': 'calDate',
                            'text': $(this).find("calloutDate").text() + ' -'
                        })).append($('<div/>', {
                            'class': 'calDetails',
                            'text': $(this).find("calloutMessage").text()
                        })));
                    }
                });
            },
            error: function (msg) {
                /* do nothing for the guest 
                alert(JSON.stringify(msg)); /**/
            }
        });
    }
}

function scrollToHours() {
    // scroll to the full Hours
    $(".hoursClick").click(function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $(".fullHours").offset().top - 40
        }, 400);
    });

}

function fullEventsList() {
    if ($('#fullEvents').length > 0) {
        // Call XML
        $.ajax({
            type: "GET",
            url: "/fullEventsCalendar.xml",
            dataType: "XML",
            success: function (xml) {
                var calCount = 0;
                var anchorCount = 1;
                var i = 0;
                var today = new Date();

                $(xml).find("event").each(function () {

                    
                    var start = new Date($(this).find("date").text());
                    var findLink = $(this).find("dateLink").text();
                    
                    //Find if event has link inlcuded
                    if (today <= start) {

                        var handleHTML = "";
                        var handleTD = "";
                        var classAnchor = "eventAnchor" + anchorCount;
                        var calAnchor = "tdAnchor" + anchorCount;
                        if (findLink != "") {
                            anchorCount++;
                            handleHTML = "<a href='" + findLink + "'id=" + classAnchor + " " + "onclick='anchorNumber(this)'" + "target='_blank'" + ">" + "Learn More" + " " + "[+]" + "</a>";
                            handleTD = "<a href='" + findLink + "'id=" + calAnchor + " " + "onclick='anchorNumber(this)'" + "target='_blank'" + "class='tdContainer'" + ">" + "</a>"
                        } else {
                            handleTD = "<span id=" + "calSpan" + " " + ">" + "</span>"
                        }
                    }


                    //Go Through XML Document
                    if (today <= start && calCount < 6) {
                        calCount++;
                        $('#fullEvents').append($('<tr/>', {
                            'class': 'calContainer',
                        }).append($('<td/>', {
                            'class': 'calDateContainer',
                        }).append($(handleTD, {

                        }).append($('<span/>', {
                            'class': 'calDay',
                            'text': $(this).find("dateNumber").text()
                        })).append($('<span/>', {
                            'class': 'calMonth',
                            'text': $(this).find("dateMonth").text()
                        })))).append($('<td/>', {
                            'class': 'calInfoContainer',
                        }).append($('<h3/>', {
                            'class': 'calTitle',
                            'text': $(this).find("calloutHeader").text(), 
                        })).append($('<p/>', {
                            'class': 'calDetails',
                            'text': $(this).find("calloutMessage").text()
                        })).append(handleHTML)
                        ));
                    }
                    
                        $('#fullEvents').find("tr.calContainer").each(function () {
                            var hoverFind = $(this).find("a#" + classAnchor).text();

                            if (hoverFind) {
                                i++;
                                return $(this).addClass('activeEvent' + i);
                            }
                        });
                    
                    $("tr.calContainer.activeEvent" + i).find("td.calDateContainer").each(function () {
                        return $(this).addClass('hoverEvent');
                    });

                });
            },

            error: function (msg) {
                /* do nothing for the guest 
                alert(JSON.stringify(msg)); /**/
            }
        });
    }
}

function AlertLeaving() {
    return confirm("You are leaving the Trestle Bike Park website.");
}

function formatNowDate() {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear().toString().substring(2) +
        " @" + hours + ":" + minutes + " " + ampm;
}

function populateLeaderBoards() {

    $(".leaderBoard").each(function () {
        // Call the JSON feed and build the table
        $.ajax({
            type: "GET",
            url: "https://secure.winterparkresort.com/JSON/RtpJsonServices.asmx/getLeaderBoard",
            data: { boardType: $(this).data("board"), userCount: $(this).data("count") },
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            context: $(this),
            success: function (leaders) {

                // If there are no results, hide the board
                if (leaders.length == 0) { $(this).hide(); }

                // show that its real time by adding a timestamp of right now
                $(this).find("time").text("as of " + formatNowDate() + " MST");
                var tableBody = $(this).find("tbody");

                $.each(leaders, function (index, value) {

                    var handleHTML = "";
                    if (value.handleURL != "") {
                        //social link
                        handleHTML = index + 1 + ".&nbsp;&nbsp" +
                            "<a href='" + value.handleURL + "'  onclick='return AlertLeaving();' title='Social' target='_blank'>" +
                            value.passHandle + "</a>";
                    }
                    else {
                        handleHTML = index + 1 + ".&nbsp;&nbsp" + value.passHandle;
                    }

                    // Leader Table
                    tableBody.append($('<tr/>', {
                        'class': (index % 2 == 0 ? 'odd' : 'even')
                    }).append($('<td/>', {
                        'html': handleHTML
                    })).append($('<td/>', {
                        'html': value.Elevation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "&prime;"
                    })));
                });

            },
            error: function (msg) {
                /* do nothing for the guest 
                alert(JSON.stringify(msg)); /**/
            }
        });
    });

}

function checkRank() {
    // set a height so it can be altered
    $("#rankCheck").height($("#rankCheck").height());

    // incase this is a repeat, show the gear
    $('#rankTable').fadeOut(300, function () {
        $('#checkingRank').fadeIn(300);
        //resize animation
        $("#rankCheck").animateAuto("height", 300);
    });


    // Call the JSON feed and build the table
    $.ajax({
        type: "GET",
        url: "https://secure.winterparkresort.com/JSON/RtpJsonServices.asmx/getBoardRank",
        data: { passNumber: $('#rankPass').val() },
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (ranks) {
            if (ranks.length > 0) {
                var table = '<table><thead><tr><th>Board</th><th>Rank</th><th>Elevation</th></tr><thead><tbody>';

                $.each(ranks, function (index, value) {
                    // Board Table
                    table = table + '<tr class="' + (index % 2 == 0 ? 'odd' : 'even') + '">';
                    table = table + '<td>' + value.boardName + '</td>';
                    table = table + '<td># ' + value.Rank + '</td>';
                    table = table + '<td>' + value.Elevation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '&prime;</td>';
                });

                table = table + '</tbody></table>';

                $('#rankTable').html(table);
            }
            else {
                $('#rankTable').html("<h4>That pass number is not ranked, please check your pass number and try again.</h4>");
            }

            //fade in rank table
            $('#checkingRank').fadeOut(300, function () {
                $('#rankTable').fadeIn(300);
                // accomidate the table size
                $("#rankCheck").animateAuto("height", 300);
            });
        },
        error: function (msg) {
            /* do nothing for the guest 
            alert(JSON.stringify(msg)); /**/
        }
    });
}

jQuery.fn.animateAuto = function (prop, speed, callback) {
    var elem, height, width;
    return this.each(function (i, el) {
        el = jQuery(el), elem = el.clone().css({ "height": "auto" }).appendTo(el.parent());
        height = elem.height(),
        width = elem.width(),
        elem.remove();

        if (prop === "height")
            el.animate({ "height": height }, speed, callback);
        else if (prop === "width")
            el.animate({ "width": width }, speed, callback);
        else if (prop === "both")
            el.animate({ "width": width, "height": height }, speed, callback);
    });
}

function submitSignupForm() {

    //This is the function called when someone submits the sign-up form
    var returnVal = true;

    //check if Full Name is null
    if ($('#Name').val() == '') {
        returnVal = false;
        $('#nameError').css('display', 'inline-block');
    }
    else {
        $('#nameError').css('display', 'none');
    }

    //check if email is null
    if ($('#Email').val() == '') {
        returnVal = false;
        $('#emailError').text('* Required');
        $('#emailError').css('display', 'inline-block');
    }
    else if (!isValidEmailAddress($('#Email').val())) {
        // email is not valid 
        returnVal = false;
        $('#emailError').text('* Invalid Email Address');
        $('#emailError').css('display', 'inline-block');
    }
    else {
        $('#emailError').css('display', 'none');
    }

    //check if Birthdate is null
    if ($('#Birthday').val() == '') {
        returnVal = false;
        $('#birthdayError').text('* Required');
        $('#birthdayError').css('display', 'inline-block');
    }
    else {
        $('#birthdayError').css('display', 'none');
    }

    //check if the pass number is empty
    if ($('#Pass').val() == '') {
        returnVal = false;
        $('#passError').text('* Required');
        $('#passError').css('display', 'inline-block');
    }
    else if (!$.isNumeric($('#Pass').val())) {
        // not a number
        returnVal = false;
        $('#passError').text('* Not a Number');
        $('#passError').css('display', 'inline-block');

    }
    else {
        $('#passError').css('display', 'none');
    }

    //check if the handle is empty
    if ($('#Handle').val() == '') {
        returnVal = false;
        $('#handleError').text('* Required');
        $('#handleError').css('display', 'inline-block');
    }
    else {
        $('#handleError').css('display', 'none');
    }

    if (returnVal) {
        // fade out the sign-up sheet
        $('#signUpForm').fadeTo(300, 0.4);

        // Call the JSON feed
        $.ajax({
            type: "GET",
            url: "https://secure.winterparkresort.com/JSON/RtpJsonServices.asmx/requestBoardHandle",
            data: {
                name: $('#Name').val(),
                email: $('#Email').val(),
                birthday: $('#Birthday').val(),
                pass: $('#Pass').val(),
                handle: $('#Handle').val(),
                socialLink: $('#Social').val(),
            },
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function (signedUp) {
                // set a height so it can be scrolled
                $("#signUp").height($("#signUp").height());

                //fade in success message
                $('#signUpForm').fadeOut(300, function () {
                    $('#successForm').fadeIn(300);
                    // accomidate the table size
                    $("#signUp").animateAuto("height", 300);
                });
            },
            error: function (msg) {
                // set a height so it can be scrolled
                $("#signUp").height($("#signUp").height());

                //fade in form
                $('#signUpForm').fadeTo(300, 1.0);

                //fade in error message
                $('#failureForm').fadeIn(300);
                // accomidate the table size
                $("#signUp").animateAuto("height", 300);
            }
        }).fail(function () {
            alert("error");
        });
    }

}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

function popupValidation() {
    $(".verifyStatus").each(function () {
        $(this).magnificPopup({
            type: 'iframe',
            disableOn: 670,
            preloader: true,
            tLoading: '', // remove text from preloader
            callbacks: {
                beforeAppend: showIframeLoading
            }
        });
    });
}

var showIframeLoading = function () {
    var curLength = 0;
    var interval = setInterval(function () {
        if ($('iframe').length !== curLength) {
            curLength = $('.column-header').length;
            $('.mfp-content').hide();
            $('.mfp-preloader').show();

        }
    }, 50);
    this.content.find('iframe').on('load', function () {
        clearInterval(interval);
        $('.mfp-content').show();
        $('.mfp-preloader').hide();
    });
};

function thisDate() {
    
    var today = moment();
    var startDaysInFuture = 2;

    var thisDate = today.add('d', startDaysInFuture).format('MM/DD/YY');

    return thisDate;
}

function hookupIntopiaActivities() {

        /* hookup the DatePicker */
        $('.inntopiaRequiredDate').pickadate({
            format: 'mmm dd, yyyy',
            formatSubmit: 'mm/dd/yy',
            hiddenName: true,

        })

        var $input = $('.inntopiaRequiredDate').pickadate()
        var picker = $input.pickadate('picker')
        picker.set('min', new Date(2016, 5, 11));      // ===================>// Min Date on the calendar to be shown
        picker.set('min', +2);                       //====================>// Change Here to allow two days in advance
        picker.set('max', [2016, 8, 25])               //====================>// Max Date on the calendar to be shown


        /* Form validation */
        $("form.inntopiaActivity").submit(function () {

            var startDaysInFuture = 2;



            //=====>// Turn off when season starts
            var today = moment();


            //=====>// Turn off when season starts // Sets the date manually
            //$(this).find("input[name='startDate']").val(today.format('06/11/16'));

            //=====>// Turn on when season starts
            var startMoment = moment($(this).find("input[name='startDate']").val(), "MM/DD/YY");



            //=======>// Turn on/off to add days to date
            if (!startMoment.isValid() || startMoment.isBefore()) {
                $(this).find("input[name='startDate']").val(today.add('d', startDaysInFuture).format('MM/DD/YY'));
            }

        });

        /* Activity Validation for poduct with defined dates */
        //$("form.inntopiaActivitySelect").submit(function () {

        //    if ($(this).find(".inntopiaSpecificDate").val() == 0) {
        //        // They didn't select a date, pic the next upcoming activity
        //        var startDaysInFuture = 2;
        //        var today = moment();
        //        var isFound = false;

        //        $(this).find(".inntopiaSpecificDate option").each(function () {

        //            var startMoment = moment(this.value, "MM/DD/YY");

        //            if (startMoment.isValid() && !startMoment.isBefore()) {
        //                isFound = true;
        //                $(this).attr("selected", true);
        //                return false;
        //            }
        //            else {
        //                $(this).removeAttr("selected");
        //            }
        //        });

        //        if (!isFound) {
        //            alert("There are no more camps this season.");
        //            return false;
        //        }
        //    }
        //});

}

function contestHookup() {
    if ($('#contestUsers').length > 0) {
        // Call custom service
        $.ajax({
            type: "GET",
            url: "https://secure.winterparkresort.com/JSON/RtpJsonServices.asmx/trestleRiders",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function (riders) {

                $.each(riders, function (index, value) {
                    // list users
                    $('#contestUsers').append($('<span/>', {
                        'text': value.Name + " (" + value.Entries + "), "
                    }));
                });
            },
            error: function (msg) {
                /* do nothing for the guest 
                alert(JSON.stringify(msg)); /**/
            }
        });

        // Create filter on key-down
        $('#filterBox').bind('input propertychange', function () {
            filterResults($(this).val());
        });
    }
}

function filterResults(filterValue) {
    // ignore single character, require at least 2
    if (filterValue.length < 2) {
        $('#contestUsers span').show();
        return;
    }

    // hide all
    $('#contestUsers span').hide();

    //show the matches
    $("#contestUsers span:contains('" + filterValue + "')").show();
}

function scrollSponsor() {
    jQuery(document).ready(function ($) {
        var options = {
            $AutoPlay: true,                                    //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
            $AutoPlaySteps: 1,                                  //[Optional] Steps to go for each navigation request (this options applys only when slideshow disabled), the default value is 1
            $AutoPlayInterval: 0,                            //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
            $PauseOnHover: 4,                               //[Optional] Whether to pause when mouse over if a slider is auto playing, 0 no pause, 1 pause for desktop, 2 pause for touch device, 3 pause for desktop and touch device, 4 freeze for desktop, 8 freeze for touch device, 12 freeze for desktop and touch device, default value is 1

            $ArrowKeyNavigation: true,                          //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
            $SlideEasing: $JssorEasing$.$EaseLinear,          //[Optional] Specifies easing for right to left animation, default value is $JssorEasing$.$EaseOutQuad
            $SlideDuration: 3000,                                //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
            $MinDragOffsetToSlide: 20,                          //[Optional] Minimum drag offset to trigger slide , default value is 20
            $SlideWidth: 140,                                   //[Optional] Width of every slide in pixels, default value is width of 'slides' container
            //$SlideHeight: 100,                                //[Optional] Height of every slide in pixels, default value is height of 'slides' container
            $SlideSpacing: 0,                                   //[Optional] Space between each slide in pixels, default value is 0
            $DisplayPieces: 7,                                  //[Optional] Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
            $ParkingPosition: 0,                              //[Optional] The offset position to park slide (this options applys only when slideshow disabled), default value is 0.
            $UISearchMode: 1,                                   //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
            $PlayOrientation: 1,                                //[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, 5 horizental reverse, 6 vertical reverse, default value is 1
            $DragOrientation: 1                                //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
        };

        var jssor_slider1 = new $JssorSlider$("slider1_container", options);

        //responsive code begin
        //you can remove responsive code if you don't want the slider scales while window resizes
        function ScaleSlider() {
            var bodyWidth = document.body.clientWidth;
            if (bodyWidth)
                jssor_slider1.$ScaleWidth(Math.min(bodyWidth, 980));
            else
                window.setTimeout(ScaleSlider, 30);
        }

        ScaleSlider();

        if (!navigator.userAgent.match(/(iPhone|iPod|iPad|BlackBerry|IEMobile)/)) {
            $(window).bind('resize', ScaleSlider);
        }


        //if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
        //    $(window).bind("orientationchange", ScaleSlider);
        //}
        //responsive code end
    });
}

/* Plugins */

// Magnific Popup v0.9.9 by Dmitry Semenov
// http://bit.ly/magnific-popup#build=iframe
(function (a) { var b = "Close", c = "BeforeClose", d = "AfterClose", e = "BeforeAppend", f = "MarkupParse", g = "Open", h = "Change", i = "mfp", j = "." + i, k = "mfp-ready", l = "mfp-removing", m = "mfp-prevent-close", n, o = function () { }, p = !!window.jQuery, q, r = a(window), s, t, u, v, w, x = function (a, b) { n.ev.on(i + a + j, b) }, y = function (b, c, d, e) { var f = document.createElement("div"); return f.className = "mfp-" + b, d && (f.innerHTML = d), e ? c && c.appendChild(f) : (f = a(f), c && f.appendTo(c)), f }, z = function (b, c) { n.ev.triggerHandler(i + b, c), n.st.callbacks && (b = b.charAt(0).toLowerCase() + b.slice(1), n.st.callbacks[b] && n.st.callbacks[b].apply(n, a.isArray(c) ? c : [c])) }, A = function (b) { if (b !== w || !n.currTemplate.closeBtn) n.currTemplate.closeBtn = a(n.st.closeMarkup.replace("%title%", n.st.tClose)), w = b; return n.currTemplate.closeBtn }, B = function () { a.magnificPopup.instance || (n = new o, n.init(), a.magnificPopup.instance = n) }, C = function () { var a = document.createElement("p").style, b = ["ms", "O", "Moz", "Webkit"]; if (a.transition !== undefined) return !0; while (b.length) if (b.pop() + "Transition" in a) return !0; return !1 }; o.prototype = { constructor: o, init: function () { var b = navigator.appVersion; n.isIE7 = b.indexOf("MSIE 7.") !== -1, n.isIE8 = b.indexOf("MSIE 8.") !== -1, n.isLowIE = n.isIE7 || n.isIE8, n.isAndroid = /android/gi.test(b), n.isIOS = /iphone|ipad|ipod/gi.test(b), n.supportsTransition = C(), n.probablyMobile = n.isAndroid || n.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent), t = a(document), n.popupsCache = {} }, open: function (b) { s || (s = a(document.body)); var c; if (b.isObj === !1) { n.items = b.items.toArray(), n.index = 0; var d = b.items, e; for (c = 0; c < d.length; c++) { e = d[c], e.parsed && (e = e.el[0]); if (e === b.el[0]) { n.index = c; break } } } else n.items = a.isArray(b.items) ? b.items : [b.items], n.index = b.index || 0; if (n.isOpen) { n.updateItemHTML(); return } n.types = [], v = "", b.mainEl && b.mainEl.length ? n.ev = b.mainEl.eq(0) : n.ev = t, b.key ? (n.popupsCache[b.key] || (n.popupsCache[b.key] = {}), n.currTemplate = n.popupsCache[b.key]) : n.currTemplate = {}, n.st = a.extend(!0, {}, a.magnificPopup.defaults, b), n.fixedContentPos = n.st.fixedContentPos === "auto" ? !n.probablyMobile : n.st.fixedContentPos, n.st.modal && (n.st.closeOnContentClick = !1, n.st.closeOnBgClick = !1, n.st.showCloseBtn = !1, n.st.enableEscapeKey = !1), n.bgOverlay || (n.bgOverlay = y("bg").on("click" + j, function () { n.close() }), n.wrap = y("wrap").attr("tabindex", -1).on("click" + j, function (a) { n._checkIfClose(a.target) && n.close() }), n.container = y("container", n.wrap)), n.contentContainer = y("content"), n.st.preloader && (n.preloader = y("preloader", n.container, n.st.tLoading)); var h = a.magnificPopup.modules; for (c = 0; c < h.length; c++) { var i = h[c]; i = i.charAt(0).toUpperCase() + i.slice(1), n["init" + i].call(n) } z("BeforeOpen"), n.st.showCloseBtn && (n.st.closeBtnInside ? (x(f, function (a, b, c, d) { c.close_replaceWith = A(d.type) }), v += " mfp-close-btn-in") : n.wrap.append(A())), n.st.alignTop && (v += " mfp-align-top"), n.fixedContentPos ? n.wrap.css({ overflow: n.st.overflowY, overflowX: "hidden", overflowY: n.st.overflowY }) : n.wrap.css({ top: r.scrollTop(), position: "absolute" }), (n.st.fixedBgPos === !1 || n.st.fixedBgPos === "auto" && !n.fixedContentPos) && n.bgOverlay.css({ height: t.height(), position: "absolute" }), n.st.enableEscapeKey && t.on("keyup" + j, function (a) { a.keyCode === 27 && n.close() }), r.on("resize" + j, function () { n.updateSize() }), n.st.closeOnContentClick || (v += " mfp-auto-cursor"), v && n.wrap.addClass(v); var l = n.wH = r.height(), m = {}; if (n.fixedContentPos && n._hasScrollBar(l)) { var o = n._getScrollbarSize(); o && (m.marginRight = o) } n.fixedContentPos && (n.isIE7 ? a("body, html").css("overflow", "hidden") : m.overflow = "hidden"); var p = n.st.mainClass; return n.isIE7 && (p += " mfp-ie7"), p && n._addClassToMFP(p), n.updateItemHTML(), z("BuildControls"), a("html").css(m), n.bgOverlay.add(n.wrap).prependTo(n.st.prependTo || s), n._lastFocusedEl = document.activeElement, setTimeout(function () { n.content ? (n._addClassToMFP(k), n._setFocus()) : n.bgOverlay.addClass(k), t.on("focusin" + j, n._onFocusIn) }, 16), n.isOpen = !0, n.updateSize(l), z(g), b }, close: function () { if (!n.isOpen) return; z(c), n.isOpen = !1, n.st.removalDelay && !n.isLowIE && n.supportsTransition ? (n._addClassToMFP(l), setTimeout(function () { n._close() }, n.st.removalDelay)) : n._close() }, _close: function () { z(b); var c = l + " " + k + " "; n.bgOverlay.detach(), n.wrap.detach(), n.container.empty(), n.st.mainClass && (c += n.st.mainClass + " "), n._removeClassFromMFP(c); if (n.fixedContentPos) { var e = { marginRight: "" }; n.isIE7 ? a("body, html").css("overflow", "") : e.overflow = "", a("html").css(e) } t.off("keyup" + j + " focusin" + j), n.ev.off(j), n.wrap.attr("class", "mfp-wrap").removeAttr("style"), n.bgOverlay.attr("class", "mfp-bg"), n.container.attr("class", "mfp-container"), n.st.showCloseBtn && (!n.st.closeBtnInside || n.currTemplate[n.currItem.type] === !0) && n.currTemplate.closeBtn && n.currTemplate.closeBtn.detach(), n._lastFocusedEl && a(n._lastFocusedEl).focus(), n.currItem = null, n.content = null, n.currTemplate = null, n.prevHeight = 0, z(d) }, updateSize: function (a) { if (n.isIOS) { var b = document.documentElement.clientWidth / window.innerWidth, c = window.innerHeight * b; n.wrap.css("height", c), n.wH = c } else n.wH = a || r.height(); n.fixedContentPos || n.wrap.css("height", n.wH), z("Resize") }, updateItemHTML: function () { var b = n.items[n.index]; n.contentContainer.detach(), n.content && n.content.detach(), b.parsed || (b = n.parseEl(n.index)); var c = b.type; z("BeforeChange", [n.currItem ? n.currItem.type : "", c]), n.currItem = b; if (!n.currTemplate[c]) { var d = n.st[c] ? n.st[c].markup : !1; z("FirstMarkupParse", d), d ? n.currTemplate[c] = a(d) : n.currTemplate[c] = !0 } u && u !== b.type && n.container.removeClass("mfp-" + u + "-holder"); var e = n["get" + c.charAt(0).toUpperCase() + c.slice(1)](b, n.currTemplate[c]); n.appendContent(e, c), b.preloaded = !0, z(h, b), u = b.type, n.container.prepend(n.contentContainer), z("AfterChange") }, appendContent: function (a, b) { n.content = a, a ? n.st.showCloseBtn && n.st.closeBtnInside && n.currTemplate[b] === !0 ? n.content.find(".mfp-close").length || n.content.append(A()) : n.content = a : n.content = "", z(e), n.container.addClass("mfp-" + b + "-holder"), n.contentContainer.append(n.content) }, parseEl: function (b) { var c = n.items[b], d; c.tagName ? c = { el: a(c) } : (d = c.type, c = { data: c, src: c.src }); if (c.el) { var e = n.types; for (var f = 0; f < e.length; f++) if (c.el.hasClass("mfp-" + e[f])) { d = e[f]; break } c.src = c.el.attr("data-mfp-src"), c.src || (c.src = c.el.attr("href")) } return c.type = d || n.st.type || "inline", c.index = b, c.parsed = !0, n.items[b] = c, z("ElementParse", c), n.items[b] }, addGroup: function (a, b) { var c = function (c) { c.mfpEl = this, n._openClick(c, a, b) }; b || (b = {}); var d = "click.magnificPopup"; b.mainEl = a, b.items ? (b.isObj = !0, a.off(d).on(d, c)) : (b.isObj = !1, b.delegate ? a.off(d).on(d, b.delegate, c) : (b.items = a, a.off(d).on(d, c))) }, _openClick: function (b, c, d) { var e = d.midClick !== undefined ? d.midClick : a.magnificPopup.defaults.midClick; if (!e && (b.which === 2 || b.ctrlKey || b.metaKey)) return; var f = d.disableOn !== undefined ? d.disableOn : a.magnificPopup.defaults.disableOn; if (f) if (a.isFunction(f)) { if (!f.call(n)) return !0 } else if (r.width() < f) return !0; b.type && (b.preventDefault(), n.isOpen && b.stopPropagation()), d.el = a(b.mfpEl), d.delegate && (d.items = c.find(d.delegate)), n.open(d) }, updateStatus: function (a, b) { if (n.preloader) { q !== a && n.container.removeClass("mfp-s-" + q), !b && a === "loading" && (b = n.st.tLoading); var c = { status: a, text: b }; z("UpdateStatus", c), a = c.status, b = c.text, n.preloader.html(b), n.preloader.find("a").on("click", function (a) { a.stopImmediatePropagation() }), n.container.addClass("mfp-s-" + a), q = a } }, _checkIfClose: function (b) { if (a(b).hasClass(m)) return; var c = n.st.closeOnContentClick, d = n.st.closeOnBgClick; if (c && d) return !0; if (!n.content || a(b).hasClass("mfp-close") || n.preloader && b === n.preloader[0]) return !0; if (b !== n.content[0] && !a.contains(n.content[0], b)) { if (d && a.contains(document, b)) return !0 } else if (c) return !0; return !1 }, _addClassToMFP: function (a) { n.bgOverlay.addClass(a), n.wrap.addClass(a) }, _removeClassFromMFP: function (a) { this.bgOverlay.removeClass(a), n.wrap.removeClass(a) }, _hasScrollBar: function (a) { return (n.isIE7 ? t.height() : document.body.scrollHeight) > (a || r.height()) }, _setFocus: function () { (n.st.focus ? n.content.find(n.st.focus).eq(0) : n.wrap).focus() }, _onFocusIn: function (b) { if (b.target !== n.wrap[0] && !a.contains(n.wrap[0], b.target)) return n._setFocus(), !1 }, _parseMarkup: function (b, c, d) { var e; d.data && (c = a.extend(d.data, c)), z(f, [b, c, d]), a.each(c, function (a, c) { if (c === undefined || c === !1) return !0; e = a.split("_"); if (e.length > 1) { var d = b.find(j + "-" + e[0]); if (d.length > 0) { var f = e[1]; f === "replaceWith" ? d[0] !== c[0] && d.replaceWith(c) : f === "img" ? d.is("img") ? d.attr("src", c) : d.replaceWith('<img src="' + c + '" class="' + d.attr("class") + '" />') : d.attr(e[1], c) } } else b.find(j + "-" + a).html(c) }) }, _getScrollbarSize: function () { if (n.scrollbarSize === undefined) { var a = document.createElement("div"); a.id = "mfp-sbm", a.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;", document.body.appendChild(a), n.scrollbarSize = a.offsetWidth - a.clientWidth, document.body.removeChild(a) } return n.scrollbarSize } }, a.magnificPopup = { instance: null, proto: o.prototype, modules: [], open: function (b, c) { return B(), b ? b = a.extend(!0, {}, b) : b = {}, b.isObj = !0, b.index = c || 0, this.instance.open(b) }, close: function () { return a.magnificPopup.instance && a.magnificPopup.instance.close() }, registerModule: function (b, c) { c.options && (a.magnificPopup.defaults[b] = c.options), a.extend(this.proto, c.proto), this.modules.push(b) }, defaults: { disableOn: 0, key: null, midClick: !1, mainClass: "", preloader: !0, focus: "", closeOnContentClick: !1, closeOnBgClick: !0, closeBtnInside: !0, showCloseBtn: !0, enableEscapeKey: !0, modal: !1, alignTop: !1, removalDelay: 0, prependTo: null, fixedContentPos: "auto", fixedBgPos: "auto", overflowY: "auto", closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>', tClose: "Close (Esc)", tLoading: "Loading..." } }, a.fn.magnificPopup = function (b) { B(); var c = a(this); if (typeof b == "string") if (b === "open") { var d, e = p ? c.data("magnificPopup") : c[0].magnificPopup, f = parseInt(arguments[1], 10) || 0; e.items ? d = e.items[f] : (d = c, e.delegate && (d = d.find(e.delegate)), d = d.eq(f)), n._openClick({ mfpEl: d }, c, e) } else n.isOpen && n[b].apply(n, Array.prototype.slice.call(arguments, 1)); else b = a.extend(!0, {}, b), p ? c.data("magnificPopup", b) : c[0].magnificPopup = b, n.addGroup(c, b); return c }; var D, E = function () { return D === undefined && (D = document.createElement("p").style.MozTransform !== undefined), D }; a.magnificPopup.registerModule("zoom", { options: { enabled: !1, easing: "ease-in-out", duration: 300, opener: function (a) { return a.is("img") ? a : a.find("img") } }, proto: { initZoom: function () { var a = n.st.zoom, d = ".zoom", e; if (!a.enabled || !n.supportsTransition) return; var f = a.duration, g = function (b) { var c = b.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"), d = "all " + a.duration / 1e3 + "s " + a.easing, e = { position: "fixed", zIndex: 9999, left: 0, top: 0, "-webkit-backface-visibility": "hidden" }, f = "transition"; return e["-webkit-" + f] = e["-moz-" + f] = e["-o-" + f] = e[f] = d, c.css(e), c }, h = function () { n.content.css("visibility", "visible") }, i, j; x("BuildControls" + d, function () { if (n._allowZoom()) { clearTimeout(i), n.content.css("visibility", "hidden"), e = n._getItemToZoom(); if (!e) { h(); return } j = g(e), j.css(n._getOffset()), n.wrap.append(j), i = setTimeout(function () { j.css(n._getOffset(!0)), i = setTimeout(function () { h(), setTimeout(function () { j.remove(), e = j = null, z("ZoomAnimationEnded") }, 16) }, f) }, 16) } }), x(c + d, function () { if (n._allowZoom()) { clearTimeout(i), n.st.removalDelay = f; if (!e) { e = n._getItemToZoom(); if (!e) return; j = g(e) } j.css(n._getOffset(!0)), n.wrap.append(j), n.content.css("visibility", "hidden"), setTimeout(function () { j.css(n._getOffset()) }, 16) } }), x(b + d, function () { n._allowZoom() && (h(), j && j.remove(), e = null) }) }, _allowZoom: function () { return n.currItem.type === "image" }, _getItemToZoom: function () { return n.currItem.hasSize ? n.currItem.img : !1 }, _getOffset: function (b) { var c; b ? c = n.currItem.img : c = n.st.zoom.opener(n.currItem.el || n.currItem); var d = c.offset(), e = parseInt(c.css("padding-top"), 10), f = parseInt(c.css("padding-bottom"), 10); d.top -= a(window).scrollTop() - e; var g = { width: c.width(), height: (p ? c.innerHeight() : c[0].offsetHeight) - f - e }; return E() ? g["-moz-transform"] = g.transform = "translate(" + d.left + "px," + d.top + "px)" : (g.left = d.left, g.top = d.top), g } } }); var F = "iframe", G = "//about:blank", H = function (a) { if (n.currTemplate[F]) { var b = n.currTemplate[F].find("iframe"); b.length && (a || (b[0].src = G), n.isIE8 && b.css("display", a ? "block" : "none")) } }; a.magnificPopup.registerModule(F, { options: { markup: '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>', srcAction: "iframe_src", patterns: { youtube: { index: "youtube.com", id: "v=", src: "//www.youtube.com/embed/%id%?autoplay=1" }, vimeo: { index: "vimeo.com/", id: "/", src: "//player.vimeo.com/video/%id%?autoplay=1" }, gmaps: { index: "//maps.google.", src: "%id%&output=embed" } } }, proto: { initIframe: function () { n.types.push(F), x("BeforeChange", function (a, b, c) { b !== c && (b === F ? H() : c === F && H(!0)) }), x(b + "." + F, function () { H() }) }, getIframe: function (b, c) { var d = b.src, e = n.st.iframe; a.each(e.patterns, function () { if (d.indexOf(this.index) > -1) return this.id && (typeof this.id == "string" ? d = d.substr(d.lastIndexOf(this.id) + this.id.length, d.length) : d = this.id.call(this, d)), d = this.src.replace("%id%", d), !1 }); var f = {}; return e.srcAction && (f[e.srcAction] = d), n._parseMarkup(c, f, b), n.updateStatus("ready"), c } } }), B() })(window.jQuery || window.Zepto)

/*!
 * pickadate.js v3.5.0, 2014/04/13
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/pickadate.js
 * Licensed under MIT
 */
!function (a) { "function" == typeof define && define.amd ? define("picker", ["jquery"], a) : this.Picker = a(jQuery) }(function (a) { function b(f, g, h, k) { function l() { return b._.node("div", b._.node("div", b._.node("div", b._.node("div", w.component.nodes(r.open), t.box), t.wrap), t.frame), t.holder) } function m() { u.data(g, w).addClass(t.input).val(u.data("value") ? w.get("select", s.format) : f.value).on("focus." + r.id + " click." + r.id, p), s.editable || u.on("keydown." + r.id, function (a) { var b = a.keyCode, c = /^(8|46)$/.test(b); return 27 == b ? (w.close(), !1) : void ((32 == b || c || !r.open && w.component.key[b]) && (a.preventDefault(), a.stopPropagation(), c ? w.clear().close() : w.open())) }), e(f, { haspopup: !0, expanded: !1, readonly: !1, owns: f.id + "_root" + (w._hidden ? " " + w._hidden.id : "") }) } function n() { w.$root.on({ focusin: function (a) { w.$root.removeClass(t.focused), a.stopPropagation() }, "mousedown click": function (b) { var c = b.target; c != w.$root.children()[0] && (b.stopPropagation(), "mousedown" != b.type || a(c).is(":input") || "OPTION" == c.nodeName || (b.preventDefault(), f.focus())) } }).on("click", "[data-pick], [data-nav], [data-clear]", function () { var c = a(this), d = c.data(), e = c.hasClass(t.navDisabled) || c.hasClass(t.disabled), g = document.activeElement; g = g && (g.type || g.href) && g, (e || g && !a.contains(w.$root[0], g)) && f.focus(), d.nav && !e ? w.set("highlight", w.component.item.highlight, { nav: d.nav }) : b._.isInteger(d.pick) && !e ? w.set("select", d.pick).close(!0) : d.clear && w.clear().close(!0) }), e(w.$root[0], "hidden", !0) } function o() { var b, c; s.hiddenName === !0 ? (b = f.name + "_hidden", c = f.name, f.name = "") : (c = ["string" == typeof s.hiddenPrefix ? s.hiddenPrefix : "", "string" == typeof s.hiddenSuffix ? s.hiddenSuffix : "_submit"], c = b = c[0] + f.name + c[1]), w._hidden = a('<input type=hidden name="' + c + '"id="' + b + '"' + (u.data("value") || f.value ? ' value="' + w.get("select", s.formatSubmit) + '"' : "") + ">")[0], u.on("change." + r.id, function () { w._hidden.value = f.value ? w.get("select", s.formatSubmit) : "" }).after(w._hidden) } function p(a) { a.stopPropagation(), "focus" == a.type && w.$root.addClass(t.focused), w.open() } if (!f) return b; var q = !1, r = { id: f.id || "P" + Math.abs(~~(Math.random() * new Date)) }, s = h ? a.extend(!0, {}, h.defaults, k) : k || {}, t = a.extend({}, b.klasses(), s.klass), u = a(f), v = function () { return this.start() }, w = v.prototype = { constructor: v, $node: u, start: function () { return r && r.start ? w : (r.methods = {}, r.start = !0, r.open = !1, r.type = f.type, f.autofocus = f == document.activeElement, f.type = "text", f.readOnly = !s.editable, f.id = f.id || r.id, w.component = new h(w, s), w.$root = a(b._.node("div", l(), t.picker, 'id="' + f.id + '_root"')), n(), s.formatSubmit && o(), m(), s.container ? a(s.container).append(w.$root) : u.after(w.$root), w.on({ start: w.component.onStart, render: w.component.onRender, stop: w.component.onStop, open: w.component.onOpen, close: w.component.onClose, set: w.component.onSet }).on({ start: s.onStart, render: s.onRender, stop: s.onStop, open: s.onOpen, close: s.onClose, set: s.onSet }), q = c(w.$root.children()[0]), f.autofocus && w.open(), w.trigger("start").trigger("render")) }, render: function (a) { return a ? w.$root.html(l()) : w.$root.find("." + t.box).html(w.component.nodes(r.open)), w.trigger("render") }, stop: function () { return r.start ? (w.close(), w._hidden && w._hidden.parentNode.removeChild(w._hidden), w.$root.remove(), u.removeClass(t.input).removeData(g), setTimeout(function () { u.off("." + r.id) }, 0), f.type = r.type, f.readOnly = !1, w.trigger("stop"), r.methods = {}, r.start = !1, w) : w }, open: function (c) { return r.open ? w : (u.addClass(t.active), e(f, "expanded", !0), setTimeout(function () { w.$root.addClass(t.opened), e(w.$root[0], "hidden", !1) }, 0), c !== !1 && (r.open = !0, q && j.css("overflow", "hidden").css("padding-right", "+=" + d()), u.trigger("focus"), i.on("click." + r.id + " focusin." + r.id, function (a) { var b = a.target; b != f && b != document && 3 != a.which && w.close(b === w.$root.children()[0]) }).on("keydown." + r.id, function (c) { var d = c.keyCode, e = w.component.key[d], g = c.target; 27 == d ? w.close(!0) : g != f || !e && 13 != d ? a.contains(w.$root[0], g) && 13 == d && (c.preventDefault(), g.click()) : (c.preventDefault(), e ? b._.trigger(w.component.key.go, w, [b._.trigger(e)]) : w.$root.find("." + t.highlighted).hasClass(t.disabled) || w.set("select", w.component.item.highlight).close()) })), w.trigger("open")) }, close: function (a) { return a && (u.off("focus." + r.id).trigger("focus"), setTimeout(function () { u.on("focus." + r.id, p) }, 0)), u.removeClass(t.active), e(f, "expanded", !1), setTimeout(function () { w.$root.removeClass(t.opened + " " + t.focused), e(w.$root[0], "hidden", !0) }, 0), r.open ? (r.open = !1, q && j.css("overflow", "").css("padding-right", "-=" + d()), i.off("." + r.id), w.trigger("close")) : w }, clear: function () { return w.set("clear") }, set: function (b, c, d) { var e, f, g = a.isPlainObject(b), h = g ? b : {}; if (d = g && a.isPlainObject(c) ? c : d || {}, b) { g || (h[b] = c); for (e in h) f = h[e], e in w.component.item && (void 0 === f && (f = null), w.component.set(e, f, d)), ("select" == e || "clear" == e) && u.val("clear" == e ? "" : w.get(e, s.format)).trigger("change"); w.render() } return d.muted ? w : w.trigger("set", h) }, get: function (a, c) { if (a = a || "value", null != r[a]) return r[a]; if ("value" == a) return f.value; if (a in w.component.item) { if ("string" == typeof c) { var d = w.component.get(a); return d ? b._.trigger(w.component.formats.toString, w.component, [c, d]) : "" } return w.component.get(a) } }, on: function (b, c) { var d, e, f = a.isPlainObject(b), g = f ? b : {}; if (b) { f || (g[b] = c); for (d in g) e = g[d], r.methods[d] = r.methods[d] || [], r.methods[d].push(e) } return w }, off: function () { var a, b, c = arguments; for (a = 0, namesCount = c.length; namesCount > a; a += 1) b = c[a], b in r.methods && delete r.methods[b]; return w }, trigger: function (a, c) { var d = r.methods[a]; return d && d.map(function (a) { b._.trigger(a, w, [c]) }), w } }; return new v } function c(a) { var b, c = "position"; return a.currentStyle ? b = a.currentStyle[c] : window.getComputedStyle && (b = getComputedStyle(a)[c]), "fixed" == b } function d() { if (j.height() <= h.height()) return 0; var b = a('<div style="visibility:hidden;width:100px" />').appendTo("body"), c = b[0].offsetWidth; b.css("overflow", "scroll"); var d = a('<div style="width:100%" />').appendTo(b), e = d[0].offsetWidth; return b.remove(), c - e } function e(b, c, d) { if (a.isPlainObject(c)) for (var e in c) f(b, e, c[e]); else f(b, c, d) } function f(a, b, c) { a.setAttribute(("role" == b ? "" : "aria-") + b, c) } function g(b, c) { a.isPlainObject(b) || (b = { attribute: c }), c = ""; for (var d in b) { var e = ("role" == d ? "" : "aria-") + d, f = b[d]; c += null == f ? "" : e + '="' + b[d] + '"' } return c } var h = a(window), i = a(document), j = a(document.documentElement); return b.klasses = function (a) { return a = a || "picker", { picker: a, opened: a + "--opened", focused: a + "--focused", input: a + "__input", active: a + "__input--active", holder: a + "__holder", frame: a + "__frame", wrap: a + "__wrap", box: a + "__box" } }, b._ = { group: function (a) { for (var c, d = "", e = b._.trigger(a.min, a) ; e <= b._.trigger(a.max, a, [e]) ; e += a.i) c = b._.trigger(a.item, a, [e]), d += b._.node(a.node, c[0], c[1], c[2]); return d }, node: function (b, c, d, e) { return c ? (c = a.isArray(c) ? c.join("") : c, d = d ? ' class="' + d + '"' : "", e = e ? " " + e : "", "<" + b + d + e + ">" + c + "</" + b + ">") : "" }, lead: function (a) { return (10 > a ? "0" : "") + a }, trigger: function (a, b, c) { return "function" == typeof a ? a.apply(b, c || []) : a }, digits: function (a) { return /\d/.test(a[1]) ? 2 : 1 }, isDate: function (a) { return {}.toString.call(a).indexOf("Date") > -1 && this.isInteger(a.getDate()) }, isInteger: function (a) { return {}.toString.call(a).indexOf("Number") > -1 && a % 1 === 0 }, ariaAttr: g }, b.extend = function (c, d) { a.fn[c] = function (e, f) { var g = this.data(c); return "picker" == e ? g : g && "string" == typeof e ? b._.trigger(g[e], g, [f]) : this.each(function () { var f = a(this); f.data(c) || new b(this, c, d, e) }) }, a.fn[c].defaults = d.defaults }, b });

/*!
 * Date picker for pickadate.js v3.5.0
 * http://amsul.github.io/pickadate.js/date.htm
 */
!function (a) { "function" == typeof define && define.amd ? define(["picker", "jquery"], a) : a(Picker, jQuery) }(function (a, b) { function c(a, b) { var c = this, d = a.$node[0].value, e = a.$node.data("value"), f = e || d, g = e ? b.formatSubmit : b.format, h = function () { return "rtl" === getComputedStyle(a.$root[0]).direction }; c.settings = b, c.$node = a.$node, c.queue = { min: "measure create", max: "measure create", now: "now create", select: "parse create validate", highlight: "parse navigate create validate", view: "parse create validate viewset", disable: "deactivate", enable: "activate" }, c.item = {}, c.item.clear = null, c.item.disable = (b.disable || []).slice(0), c.item.enable = -function (a) { return a[0] === !0 ? a.shift() : -1 }(c.item.disable), c.set("min", b.min).set("max", b.max).set("now"), f ? c.set("select", f, { format: g }) : c.set("select", null).set("highlight", c.item.now), c.key = { 40: 7, 38: -7, 39: function () { return h() ? -1 : 1 }, 37: function () { return h() ? 1 : -1 }, go: function (a) { var b = c.item.highlight, d = new Date(b.year, b.month, b.date + a); c.set("highlight", [d.getFullYear(), d.getMonth(), d.getDate()], { interval: a }), this.render() } }, a.on("render", function () { a.$root.find("." + b.klass.selectMonth).on("change", function () { var c = this.value; c && (a.set("highlight", [a.get("view").year, c, a.get("highlight").date]), a.$root.find("." + b.klass.selectMonth).trigger("focus")) }), a.$root.find("." + b.klass.selectYear).on("change", function () { var c = this.value; c && (a.set("highlight", [c, a.get("view").month, a.get("highlight").date]), a.$root.find("." + b.klass.selectYear).trigger("focus")) }) }).on("open", function () { a.$root.find("button, select").attr("disabled", !1) }).on("close", function () { a.$root.find("button, select").attr("disabled", !0) }) } var d = 7, e = 6, f = a._; c.prototype.set = function (a, b, c) { var d = this, e = d.item; return null === b ? ("clear" == a && (a = "select"), e[a] = b, d) : (e["enable" == a ? "disable" : "flip" == a ? "enable" : a] = d.queue[a].split(" ").map(function (e) { return b = d[e](a, b, c) }).pop(), "select" == a ? d.set("highlight", e.select, c) : "highlight" == a ? d.set("view", e.highlight, c) : a.match(/^(flip|min|max|disable|enable)$/) && (e.select && d.disabled(e.select) && d.set("select", e.select, c), e.highlight && d.disabled(e.highlight) && d.set("highlight", e.highlight, c)), d) }, c.prototype.get = function (a) { return this.item[a] }, c.prototype.create = function (a, c, d) { var e, g = this; return c = void 0 === c ? a : c, c == -1 / 0 || 1 / 0 == c ? e = c : b.isPlainObject(c) && f.isInteger(c.pick) ? c = c.obj : b.isArray(c) ? (c = new Date(c[0], c[1], c[2]), c = f.isDate(c) ? c : g.create().obj) : c = f.isInteger(c) || f.isDate(c) ? g.normalize(new Date(c), d) : g.now(a, c, d), { year: e || c.getFullYear(), month: e || c.getMonth(), date: e || c.getDate(), day: e || c.getDay(), obj: e || c, pick: e || c.getTime() } }, c.prototype.createRange = function (a, c) { var d = this, e = function (a) { return a === !0 || b.isArray(a) || f.isDate(a) ? d.create(a) : a }; return f.isInteger(a) || (a = e(a)), f.isInteger(c) || (c = e(c)), f.isInteger(a) && b.isPlainObject(c) ? a = [c.year, c.month, c.date + a] : f.isInteger(c) && b.isPlainObject(a) && (c = [a.year, a.month, a.date + c]), { from: e(a), to: e(c) } }, c.prototype.withinRange = function (a, b) { return a = this.createRange(a.from, a.to), b.pick >= a.from.pick && b.pick <= a.to.pick }, c.prototype.overlapRanges = function (a, b) { var c = this; return a = c.createRange(a.from, a.to), b = c.createRange(b.from, b.to), c.withinRange(a, b.from) || c.withinRange(a, b.to) || c.withinRange(b, a.from) || c.withinRange(b, a.to) }, c.prototype.now = function (a, b, c) { return b = new Date, c && c.rel && b.setDate(b.getDate() + c.rel), this.normalize(b, c) }, c.prototype.navigate = function (a, c, d) { var e, f, g, h, i = b.isArray(c), j = b.isPlainObject(c), k = this.item.view; if (i || j) { for (j ? (f = c.year, g = c.month, h = c.date) : (f = +c[0], g = +c[1], h = +c[2]), d && d.nav && k && k.month !== g && (f = k.year, g = k.month), e = new Date(f, g + (d && d.nav ? d.nav : 0), 1), f = e.getFullYear(), g = e.getMonth() ; new Date(f, g, h).getMonth() !== g;) h -= 1; c = [f, g, h] } return c }, c.prototype.normalize = function (a) { return a.setHours(0, 0, 0, 0), a }, c.prototype.measure = function (a, b) { var c = this; return b ? f.isInteger(b) && (b = c.now(a, b, { rel: b })) : b = "min" == a ? -1 / 0 : 1 / 0, b }, c.prototype.viewset = function (a, b) { return this.create([b.year, b.month, 1]) }, c.prototype.validate = function (a, c, d) { var e, g, h, i, j = this, k = c, l = d && d.interval ? d.interval : 1, m = -1 === j.item.enable, n = j.item.min, o = j.item.max, p = m && j.item.disable.filter(function (a) { if (b.isArray(a)) { var d = j.create(a).pick; d < c.pick ? e = !0 : d > c.pick && (g = !0) } return f.isInteger(a) }).length; if ((!d || !d.nav) && (!m && j.disabled(c) || m && j.disabled(c) && (p || e || g) || !m && (c.pick <= n.pick || c.pick >= o.pick))) for (m && !p && (!g && l > 0 || !e && 0 > l) && (l *= -1) ; j.disabled(c) && (Math.abs(l) > 1 && (c.month < k.month || c.month > k.month) && (c = k, l = l > 0 ? 1 : -1), c.pick <= n.pick ? (h = !0, l = 1, c = j.create([n.year, n.month, n.date + (c.pick === n.pick ? 0 : -1)])) : c.pick >= o.pick && (i = !0, l = -1, c = j.create([o.year, o.month, o.date + (c.pick === o.pick ? 0 : 1)])), !h || !i) ;) c = j.create([c.year, c.month, c.date + l]); return c }, c.prototype.disabled = function (a) { var c = this, d = c.item.disable.filter(function (d) { return f.isInteger(d) ? a.day === (c.settings.firstDay ? d : d - 1) % 7 : b.isArray(d) || f.isDate(d) ? a.pick === c.create(d).pick : b.isPlainObject(d) ? c.withinRange(d, a) : void 0 }); return d = d.length && !d.filter(function (a) { return b.isArray(a) && "inverted" == a[3] || b.isPlainObject(a) && a.inverted }).length, -1 === c.item.enable ? !d : d || a.pick < c.item.min.pick || a.pick > c.item.max.pick }, c.prototype.parse = function (a, b, c) { var d = this, e = {}; return b && "string" == typeof b ? (c && c.format || (c = c || {}, c.format = d.settings.format), d.formats.toArray(c.format).map(function (a) { var c = d.formats[a], g = c ? f.trigger(c, d, [b, e]) : a.replace(/^!/, "").length; c && (e[a] = b.substr(0, g)), b = b.substr(g) }), [e.yyyy || e.yy, +(e.mm || e.m) - 1, e.dd || e.d]) : b }, c.prototype.formats = function () { function a(a, b, c) { var d = a.match(/\w+/)[0]; return c.mm || c.m || (c.m = b.indexOf(d) + 1), d.length } function b(a) { return a.match(/\w+/)[0].length } return { d: function (a, b) { return a ? f.digits(a) : b.date }, dd: function (a, b) { return a ? 2 : f.lead(b.date) }, ddd: function (a, c) { return a ? b(a) : this.settings.weekdaysShort[c.day] }, dddd: function (a, c) { return a ? b(a) : this.settings.weekdaysFull[c.day] }, m: function (a, b) { return a ? f.digits(a) : b.month + 1 }, mm: function (a, b) { return a ? 2 : f.lead(b.month + 1) }, mmm: function (b, c) { var d = this.settings.monthsShort; return b ? a(b, d, c) : d[c.month] }, mmmm: function (b, c) { var d = this.settings.monthsFull; return b ? a(b, d, c) : d[c.month] }, yy: function (a, b) { return a ? 2 : ("" + b.year).slice(2) }, yyyy: function (a, b) { return a ? 4 : b.year }, toArray: function (a) { return a.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g) }, toString: function (a, b) { var c = this; return c.formats.toArray(a).map(function (a) { return f.trigger(c.formats[a], c, [0, b]) || a.replace(/^!/, "") }).join("") } } }(), c.prototype.isDateExact = function (a, c) { var d = this; return f.isInteger(a) && f.isInteger(c) || "boolean" == typeof a && "boolean" == typeof c ? a === c : (f.isDate(a) || b.isArray(a)) && (f.isDate(c) || b.isArray(c)) ? d.create(a).pick === d.create(c).pick : b.isPlainObject(a) && b.isPlainObject(c) ? d.isDateExact(a.from, c.from) && d.isDateExact(a.to, c.to) : !1 }, c.prototype.isDateOverlap = function (a, c) { var d = this, e = d.settings.firstDay ? 1 : 0; return f.isInteger(a) && (f.isDate(c) || b.isArray(c)) ? (a = a % 7 + e, a === d.create(c).day + 1) : f.isInteger(c) && (f.isDate(a) || b.isArray(a)) ? (c = c % 7 + e, c === d.create(a).day + 1) : b.isPlainObject(a) && b.isPlainObject(c) ? d.overlapRanges(a, c) : !1 }, c.prototype.flipEnable = function (a) { var b = this.item; b.enable = a || (-1 == b.enable ? 1 : -1) }, c.prototype.deactivate = function (a, c) { var d = this, e = d.item.disable.slice(0); return "flip" == c ? d.flipEnable() : c === !1 ? (d.flipEnable(1), e = []) : c === !0 ? (d.flipEnable(-1), e = []) : c.map(function (a) { for (var c, g = 0; g < e.length; g += 1) if (d.isDateExact(a, e[g])) { c = !0; break } c || (f.isInteger(a) || f.isDate(a) || b.isArray(a) || b.isPlainObject(a) && a.from && a.to) && e.push(a) }), e }, c.prototype.activate = function (a, c) { var d = this, e = d.item.disable, g = e.length; return "flip" == c ? d.flipEnable() : c === !0 ? (d.flipEnable(1), e = []) : c === !1 ? (d.flipEnable(-1), e = []) : c.map(function (a) { var c, h, i, j; for (i = 0; g > i; i += 1) { if (h = e[i], d.isDateExact(h, a)) { c = e[i] = null, j = !0; break } if (d.isDateOverlap(h, a)) { b.isPlainObject(a) ? (a.inverted = !0, c = a) : b.isArray(a) ? (c = a, c[3] || c.push("inverted")) : f.isDate(a) && (c = [a.getFullYear(), a.getMonth(), a.getDate(), "inverted"]); break } } if (c) for (i = 0; g > i; i += 1) if (d.isDateExact(e[i], a)) { e[i] = null; break } if (j) for (i = 0; g > i; i += 1) if (d.isDateOverlap(e[i], a)) { e[i] = null; break } c && e.push(c) }), e.filter(function (a) { return null != a }) }, c.prototype.nodes = function (a) { var b = this, c = b.settings, g = b.item, h = g.now, i = g.select, j = g.highlight, k = g.view, l = g.disable, m = g.min, n = g.max, o = function (a, b) { return c.firstDay && (a.push(a.shift()), b.push(b.shift())), f.node("thead", f.node("tr", f.group({ min: 0, max: d - 1, i: 1, node: "th", item: function (d) { return [a[d], c.klass.weekdays, 'scope=col title="' + b[d] + '"'] } }))) }((c.showWeekdaysFull ? c.weekdaysFull : c.weekdaysShort).slice(0), c.weekdaysFull.slice(0)), p = function (a) { return f.node("div", " ", c.klass["nav" + (a ? "Next" : "Prev")] + (a && k.year >= n.year && k.month >= n.month || !a && k.year <= m.year && k.month <= m.month ? " " + c.klass.navDisabled : ""), "data-nav=" + (a || -1) + " " + f.ariaAttr({ role: "button", controls: b.$node[0].id + "_table" }) + ' title="' + (a ? c.labelMonthNext : c.labelMonthPrev) + '"') }, q = function () { var d = c.showMonthsShort ? c.monthsShort : c.monthsFull; return c.selectMonths ? f.node("select", f.group({ min: 0, max: 11, i: 1, node: "option", item: function (a) { return [d[a], 0, "value=" + a + (k.month == a ? " selected" : "") + (k.year == m.year && a < m.month || k.year == n.year && a > n.month ? " disabled" : "")] } }), c.klass.selectMonth, (a ? "" : "disabled") + " " + f.ariaAttr({ controls: b.$node[0].id + "_table" }) + ' title="' + c.labelMonthSelect + '"') : f.node("div", d[k.month], c.klass.month) }, r = function () { var d = k.year, e = c.selectYears === !0 ? 5 : ~~(c.selectYears / 2); if (e) { var g = m.year, h = n.year, i = d - e, j = d + e; if (g > i && (j += g - i, i = g), j > h) { var l = i - g, o = j - h; i -= l > o ? o : l, j = h } return f.node("select", f.group({ min: i, max: j, i: 1, node: "option", item: function (a) { return [a, 0, "value=" + a + (d == a ? " selected" : "")] } }), c.klass.selectYear, (a ? "" : "disabled") + " " + f.ariaAttr({ controls: b.$node[0].id + "_table" }) + ' title="' + c.labelYearSelect + '"') } return f.node("div", d, c.klass.year) }; return f.node("div", (c.selectYears ? r() + q() : q() + r()) + p() + p(1), c.klass.header) + f.node("table", o + f.node("tbody", f.group({ min: 0, max: e - 1, i: 1, node: "tr", item: function (a) { var e = c.firstDay && 0 === b.create([k.year, k.month, 1]).day ? -7 : 0; return [f.group({ min: d * a - k.day + e + 1, max: function () { return this.min + d - 1 }, i: 1, node: "td", item: function (a) { a = b.create([k.year, k.month, a + (c.firstDay ? 1 : 0)]); var d = i && i.pick == a.pick, e = j && j.pick == a.pick, g = l && b.disabled(a) || a.pick < m.pick || a.pick > n.pick; return [f.node("div", a.date, function (b) { return b.push(k.month == a.month ? c.klass.infocus : c.klass.outfocus), h.pick == a.pick && b.push(c.klass.now), d && b.push(c.klass.selected), e && b.push(c.klass.highlighted), g && b.push(c.klass.disabled), b.join(" ") }([c.klass.day]), "data-pick=" + a.pick + " " + f.ariaAttr({ role: "gridcell", selected: d && b.$node.val() === f.trigger(b.formats.toString, b, [c.format, a]) ? !0 : null, activedescendant: e ? !0 : null, disabled: g ? !0 : null })), "", f.ariaAttr({ role: "presentation" })] } })] } })), c.klass.table, 'id="' + b.$node[0].id + '_table" ' + f.ariaAttr({ role: "grid", controls: b.$node[0].id, readonly: !0 })) + f.node("div", f.node("button", c.today, c.klass.buttonToday, "type=button data-pick=" + h.pick + (a ? "" : " disabled") + " " + f.ariaAttr({ controls: b.$node[0].id })) + f.node("button", c.clear, c.klass.buttonClear, "type=button data-clear=1" + (a ? "" : " disabled") + " " + f.ariaAttr({ controls: b.$node[0].id })), c.klass.footer) }, c.defaults = function (a) { return { labelMonthNext: "Next month", labelMonthPrev: "Previous month", labelMonthSelect: "Select a month", labelYearSelect: "Select a year", monthsFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], weekdaysFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], today: "Today", clear: "Clear", format: "d mmmm, yyyy", klass: { table: a + "table", header: a + "header", navPrev: a + "nav--prev", navNext: a + "nav--next", navDisabled: a + "nav--disabled", month: a + "month", year: a + "year", selectMonth: a + "select--month", selectYear: a + "select--year", weekdays: a + "weekday", day: a + "day", disabled: a + "day--disabled", selected: a + "day--selected", highlighted: a + "day--highlighted", now: a + "day--today", infocus: a + "day--infocus", outfocus: a + "day--outfocus", footer: a + "footer", buttonClear: a + "button--clear", buttonToday: a + "button--today" } } }(a.klasses().picker + "__"), a.extend("pickadate", c) });

/*!
 * Legacy browser support
 */
[].map || (Array.prototype.map = function (a, b) { for (var c = this, d = c.length, e = new Array(d), f = 0; d > f; f++) f in c && (e[f] = a.call(b, c[f], f, c)); return e }), [].filter || (Array.prototype.filter = function (a) { if (null == this) throw new TypeError; var b = Object(this), c = b.length >>> 0; if ("function" != typeof a) throw new TypeError; for (var d = [], e = arguments[1], f = 0; c > f; f++) if (f in b) { var g = b[f]; a.call(e, g, f, b) && d.push(g) } return d }), [].indexOf || (Array.prototype.indexOf = function (a) { if (null == this) throw new TypeError; var b = Object(this), c = b.length >>> 0; if (0 === c) return -1; var d = 0; if (arguments.length > 1 && (d = Number(arguments[1]), d != d ? d = 0 : 0 !== d && 1 / 0 != d && d != -1 / 0 && (d = (d > 0 || -1) * Math.floor(Math.abs(d)))), d >= c) return -1; for (var e = d >= 0 ? d : Math.max(c - Math.abs(d), 0) ; c > e; e++) if (e in b && b[e] === a) return e; return -1 });/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * http://blog.stevenlevithan.com/archives/cross-browser-split
 */
var nativeSplit = String.prototype.split, compliantExecNpcg = void 0 === /()??/.exec("")[1]; String.prototype.split = function (a, b) { var c = this; if ("[object RegExp]" !== Object.prototype.toString.call(a)) return nativeSplit.call(c, a, b); var d, e, f, g, h = [], i = (a.ignoreCase ? "i" : "") + (a.multiline ? "m" : "") + (a.extended ? "x" : "") + (a.sticky ? "y" : ""), j = 0; for (a = new RegExp(a.source, i + "g"), c += "", compliantExecNpcg || (d = new RegExp("^" + a.source + "$(?!\\s)", i)), b = void 0 === b ? -1 >>> 0 : b >>> 0; (e = a.exec(c)) && (f = e.index + e[0].length, !(f > j && (h.push(c.slice(j, e.index)), !compliantExecNpcg && e.length > 1 && e[0].replace(d, function () { for (var a = 1; a < arguments.length - 2; a++) void 0 === arguments[a] && (e[a] = void 0) }), e.length > 1 && e.index < c.length && Array.prototype.push.apply(h, e.slice(1)), g = e[0].length, j = f, h.length >= b))) ;) a.lastIndex === e.index && a.lastIndex++; return j === c.length ? (g || !a.test("")) && h.push("") : h.push(c.slice(j)), h.length > b ? h.slice(0, b) : h };

//! moment.js
//! version : 2.2.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function (a) { function b(a, b) { return function (c) { return i(a.call(this, c), b) } } function c(a, b) { return function (c) { return this.lang().ordinal(a.call(this, c), b) } } function d() { } function e(a) { g(this, a) } function f(a) { var b = a.years || a.year || a.y || 0, c = a.months || a.month || a.M || 0, d = a.weeks || a.week || a.w || 0, e = a.days || a.day || a.d || 0, f = a.hours || a.hour || a.h || 0, g = a.minutes || a.minute || a.m || 0, h = a.seconds || a.second || a.s || 0, i = a.milliseconds || a.millisecond || a.ms || 0; this._input = a, this._milliseconds = +i + 1e3 * h + 6e4 * g + 36e5 * f, this._days = +e + 7 * d, this._months = +c + 12 * b, this._data = {}, this._bubble() } function g(a, b) { for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]); return a } function h(a) { return 0 > a ? Math.ceil(a) : Math.floor(a) } function i(a, b) { for (var c = a + ""; c.length < b;) c = "0" + c; return c } function j(a, b, c, d) { var e, f, g = b._milliseconds, h = b._days, i = b._months; g && a._d.setTime(+a._d + g * c), (h || i) && (e = a.minute(), f = a.hour()), h && a.date(a.date() + h * c), i && a.month(a.month() + i * c), g && !d && L.updateOffset(a), (h || i) && (a.minute(e), a.hour(f)) } function k(a) { return "[object Array]" === Object.prototype.toString.call(a) } function l(a, b) { var c, d = Math.min(a.length, b.length), e = Math.abs(a.length - b.length), f = 0; for (c = 0; d > c; c++) ~~a[c] !== ~~b[c] && f++; return f + e } function m(a) { return a ? ib[a] || a.toLowerCase().replace(/(.)s$/, "$1") : a } function n(a, b) { return b.abbr = a, P[a] || (P[a] = new d), P[a].set(b), P[a] } function o(a) { delete P[a] } function p(a) { if (!a) return L.fn._lang; if (!P[a] && Q) try { require("./lang/" + a) } catch (b) { return L.fn._lang } return P[a] || L.fn._lang } function q(a) { return a.match(/\[.*\]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "") } function r(a) { var b, c, d = a.match(T); for (b = 0, c = d.length; c > b; b++) d[b] = mb[d[b]] ? mb[d[b]] : q(d[b]); return function (e) { var f = ""; for (b = 0; c > b; b++) f += d[b] instanceof Function ? d[b].call(e, a) : d[b]; return f } } function s(a, b) { return b = t(b, a.lang()), jb[b] || (jb[b] = r(b)), jb[b](a) } function t(a, b) { function c(a) { return b.longDateFormat(a) || a } for (var d = 5; d-- && (U.lastIndex = 0, U.test(a)) ;) a = a.replace(U, c); return a } function u(a, b) { switch (a) { case "DDDD": return X; case "YYYY": return Y; case "YYYYY": return Z; case "S": case "SS": case "SSS": case "DDD": return W; case "MMM": case "MMMM": case "dd": case "ddd": case "dddd": return $; case "a": case "A": return p(b._l)._meridiemParse; case "X": return bb; case "Z": case "ZZ": return _; case "T": return ab; case "MM": case "DD": case "YY": case "HH": case "hh": case "mm": case "ss": case "M": case "D": case "d": case "H": case "h": case "m": case "s": return V; default: return new RegExp(a.replace("\\", "")) } } function v(a) { var b = (_.exec(a) || [])[0], c = (b + "").match(fb) || ["-", 0, 0], d = +(60 * c[1]) + ~~c[2]; return "+" === c[0] ? -d : d } function w(a, b, c) { var d, e = c._a; switch (a) { case "M": case "MM": null != b && (e[1] = ~~b - 1); break; case "MMM": case "MMMM": d = p(c._l).monthsParse(b), null != d ? e[1] = d : c._isValid = !1; break; case "D": case "DD": null != b && (e[2] = ~~b); break; case "DDD": case "DDDD": null != b && (e[1] = 0, e[2] = ~~b); break; case "YY": e[0] = ~~b + (~~b > 68 ? 1900 : 2e3); break; case "YYYY": case "YYYYY": e[0] = ~~b; break; case "a": case "A": c._isPm = p(c._l).isPM(b); break; case "H": case "HH": case "h": case "hh": e[3] = ~~b; break; case "m": case "mm": e[4] = ~~b; break; case "s": case "ss": e[5] = ~~b; break; case "S": case "SS": case "SSS": e[6] = ~~(1e3 * ("0." + b)); break; case "X": c._d = new Date(1e3 * parseFloat(b)); break; case "Z": case "ZZ": c._useUTC = !0, c._tzm = v(b) } null == b && (c._isValid = !1) } function x(a) { var b, c, d, e = []; if (!a._d) { for (d = z(a), b = 0; 3 > b && null == a._a[b]; ++b) a._a[b] = e[b] = d[b]; for (; 7 > b; b++) a._a[b] = e[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b]; e[3] += ~~((a._tzm || 0) / 60), e[4] += ~~((a._tzm || 0) % 60), c = new Date(0), a._useUTC ? (c.setUTCFullYear(e[0], e[1], e[2]), c.setUTCHours(e[3], e[4], e[5], e[6])) : (c.setFullYear(e[0], e[1], e[2]), c.setHours(e[3], e[4], e[5], e[6])), a._d = c } } function y(a) { var b = a._i; a._d || (a._a = [b.years || b.year || b.y, b.months || b.month || b.M, b.days || b.day || b.d, b.hours || b.hour || b.h, b.minutes || b.minute || b.m, b.seconds || b.second || b.s, b.milliseconds || b.millisecond || b.ms], x(a)) } function z(a) { var b = new Date; return a._useUTC ? [b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()] : [b.getFullYear(), b.getMonth(), b.getDate()] } function A(a) { var b, c, d, e = p(a._l), f = "" + a._i; for (d = t(a._f, e).match(T), a._a = [], b = 0; b < d.length; b++) c = (u(d[b], a).exec(f) || [])[0], c && (f = f.slice(f.indexOf(c) + c.length)), mb[d[b]] && w(d[b], c, a); f && (a._il = f), a._isPm && a._a[3] < 12 && (a._a[3] += 12), a._isPm === !1 && 12 === a._a[3] && (a._a[3] = 0), x(a) } function B(a) { var b, c, d, f, h, i = 99; for (f = 0; f < a._f.length; f++) b = g({}, a), b._f = a._f[f], A(b), c = new e(b), h = l(b._a, c.toArray()), c._il && (h += c._il.length), i > h && (i = h, d = c); g(a, d) } function C(a) { var b, c = a._i, d = cb.exec(c); if (d) { for (a._f = "YYYY-MM-DD" + (d[2] || " "), b = 0; 4 > b; b++) if (eb[b][1].exec(c)) { a._f += eb[b][0]; break } _.exec(c) && (a._f += " Z"), A(a) } else a._d = new Date(c) } function D(b) { var c = b._i, d = R.exec(c); c === a ? b._d = new Date : d ? b._d = new Date(+d[1]) : "string" == typeof c ? C(b) : k(c) ? (b._a = c.slice(0), x(b)) : c instanceof Date ? b._d = new Date(+c) : "object" == typeof c ? y(b) : b._d = new Date(c) } function E(a, b, c, d, e) { return e.relativeTime(b || 1, !!c, a, d) } function F(a, b, c) { var d = O(Math.abs(a) / 1e3), e = O(d / 60), f = O(e / 60), g = O(f / 24), h = O(g / 365), i = 45 > d && ["s", d] || 1 === e && ["m"] || 45 > e && ["mm", e] || 1 === f && ["h"] || 22 > f && ["hh", f] || 1 === g && ["d"] || 25 >= g && ["dd", g] || 45 >= g && ["M"] || 345 > g && ["MM", O(g / 30)] || 1 === h && ["y"] || ["yy", h]; return i[2] = b, i[3] = a > 0, i[4] = c, E.apply({}, i) } function G(a, b, c) { var d, e = c - b, f = c - a.day(); return f > e && (f -= 7), e - 7 > f && (f += 7), d = L(a).add("d", f), { week: Math.ceil(d.dayOfYear() / 7), year: d.year() } } function H(a) { var b = a._i, c = a._f; return null === b || "" === b ? null : ("string" == typeof b && (a._i = b = p().preparse(b)), L.isMoment(b) ? (a = g({}, b), a._d = new Date(+b._d)) : c ? k(c) ? B(a) : A(a) : D(a), new e(a)) } function I(a, b) { L.fn[a] = L.fn[a + "s"] = function (a) { var c = this._isUTC ? "UTC" : ""; return null != a ? (this._d["set" + c + b](a), L.updateOffset(this), this) : this._d["get" + c + b]() } } function J(a) { L.duration.fn[a] = function () { return this._data[a] } } function K(a, b) { L.duration.fn["as" + a] = function () { return +this / b } } for (var L, M, N = "2.2.1", O = Math.round, P = {}, Q = "undefined" != typeof module && module.exports, R = /^\/?Date\((\-?\d+)/i, S = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/, T = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g, U = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, V = /\d\d?/, W = /\d{1,3}/, X = /\d{3}/, Y = /\d{1,4}/, Z = /[+\-]?\d{1,6}/, $ = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, _ = /Z|[\+\-]\d\d:?\d\d/i, ab = /T/i, bb = /[\+\-]?\d+(\.\d{1,3})?/, cb = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/, db = "YYYY-MM-DDTHH:mm:ssZ", eb = [["HH:mm:ss.S", /(T| )\d\d:\d\d:\d\d\.\d{1,3}/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]], fb = /([\+\-]|\d\d)/gi, gb = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"), hb = { Milliseconds: 1, Seconds: 1e3, Minutes: 6e4, Hours: 36e5, Days: 864e5, Months: 2592e6, Years: 31536e6 }, ib = { ms: "millisecond", s: "second", m: "minute", h: "hour", d: "day", w: "week", W: "isoweek", M: "month", y: "year" }, jb = {}, kb = "DDD w W M D d".split(" "), lb = "M D H h m s w W".split(" "), mb = { M: function () { return this.month() + 1 }, MMM: function (a) { return this.lang().monthsShort(this, a) }, MMMM: function (a) { return this.lang().months(this, a) }, D: function () { return this.date() }, DDD: function () { return this.dayOfYear() }, d: function () { return this.day() }, dd: function (a) { return this.lang().weekdaysMin(this, a) }, ddd: function (a) { return this.lang().weekdaysShort(this, a) }, dddd: function (a) { return this.lang().weekdays(this, a) }, w: function () { return this.week() }, W: function () { return this.isoWeek() }, YY: function () { return i(this.year() % 100, 2) }, YYYY: function () { return i(this.year(), 4) }, YYYYY: function () { return i(this.year(), 5) }, gg: function () { return i(this.weekYear() % 100, 2) }, gggg: function () { return this.weekYear() }, ggggg: function () { return i(this.weekYear(), 5) }, GG: function () { return i(this.isoWeekYear() % 100, 2) }, GGGG: function () { return this.isoWeekYear() }, GGGGG: function () { return i(this.isoWeekYear(), 5) }, e: function () { return this.weekday() }, E: function () { return this.isoWeekday() }, a: function () { return this.lang().meridiem(this.hours(), this.minutes(), !0) }, A: function () { return this.lang().meridiem(this.hours(), this.minutes(), !1) }, H: function () { return this.hours() }, h: function () { return this.hours() % 12 || 12 }, m: function () { return this.minutes() }, s: function () { return this.seconds() }, S: function () { return ~~(this.milliseconds() / 100) }, SS: function () { return i(~~(this.milliseconds() / 10), 2) }, SSS: function () { return i(this.milliseconds(), 3) }, Z: function () { var a = -this.zone(), b = "+"; return 0 > a && (a = -a, b = "-"), b + i(~~(a / 60), 2) + ":" + i(~~a % 60, 2) }, ZZ: function () { var a = -this.zone(), b = "+"; return 0 > a && (a = -a, b = "-"), b + i(~~(10 * a / 6), 4) }, z: function () { return this.zoneAbbr() }, zz: function () { return this.zoneName() }, X: function () { return this.unix() } }; kb.length;) M = kb.pop(), mb[M + "o"] = c(mb[M], M); for (; lb.length;) M = lb.pop(), mb[M + M] = b(mb[M], 2); for (mb.DDDD = b(mb.DDD, 3), g(d.prototype, { set: function (a) { var b, c; for (c in a) b = a[c], "function" == typeof b ? this[c] = b : this["_" + c] = b }, _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), months: function (a) { return this._months[a.month()] }, _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), monthsShort: function (a) { return this._monthsShort[a.month()] }, monthsParse: function (a) { var b, c, d; for (this._monthsParse || (this._monthsParse = []), b = 0; 12 > b; b++) if (this._monthsParse[b] || (c = L.utc([2e3, b]), d = "^" + this.months(c, "") + "|^" + this.monthsShort(c, ""), this._monthsParse[b] = new RegExp(d.replace(".", ""), "i")), this._monthsParse[b].test(a)) return b }, _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), weekdays: function (a) { return this._weekdays[a.day()] }, _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), weekdaysShort: function (a) { return this._weekdaysShort[a.day()] }, _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), weekdaysMin: function (a) { return this._weekdaysMin[a.day()] }, weekdaysParse: function (a) { var b, c, d; for (this._weekdaysParse || (this._weekdaysParse = []), b = 0; 7 > b; b++) if (this._weekdaysParse[b] || (c = L([2e3, 1]).day(b), d = "^" + this.weekdays(c, "") + "|^" + this.weekdaysShort(c, "") + "|^" + this.weekdaysMin(c, ""), this._weekdaysParse[b] = new RegExp(d.replace(".", ""), "i")), this._weekdaysParse[b].test(a)) return b }, _longDateFormat: { LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D YYYY", LLL: "MMMM D YYYY LT", LLLL: "dddd, MMMM D YYYY LT" }, longDateFormat: function (a) { var b = this._longDateFormat[a]; return !b && this._longDateFormat[a.toUpperCase()] && (b = this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (a) { return a.slice(1) }), this._longDateFormat[a] = b), b }, isPM: function (a) { return "p" === (a + "").toLowerCase().charAt(0) }, _meridiemParse: /[ap]\.?m?\.?/i, meridiem: function (a, b, c) { return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM" }, _calendar: { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" }, calendar: function (a, b) { var c = this._calendar[a]; return "function" == typeof c ? c.apply(b) : c }, _relativeTime: { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" }, relativeTime: function (a, b, c, d) { var e = this._relativeTime[c]; return "function" == typeof e ? e(a, b, c, d) : e.replace(/%d/i, a) }, pastFuture: function (a, b) { var c = this._relativeTime[a > 0 ? "future" : "past"]; return "function" == typeof c ? c(b) : c.replace(/%s/i, b) }, ordinal: function (a) { return this._ordinal.replace("%d", a) }, _ordinal: "%d", preparse: function (a) { return a }, postformat: function (a) { return a }, week: function (a) { return G(a, this._week.dow, this._week.doy).week }, _week: { dow: 0, doy: 6 } }), L = function (a, b, c) { return H({ _i: a, _f: b, _l: c, _isUTC: !1 }) }, L.utc = function (a, b, c) { return H({ _useUTC: !0, _isUTC: !0, _l: c, _i: a, _f: b }).utc() }, L.unix = function (a) { return L(1e3 * a) }, L.duration = function (a, b) { var c, d, e = L.isDuration(a), g = "number" == typeof a, h = e ? a._input : g ? {} : a, i = S.exec(a); return g ? b ? h[b] = a : h.milliseconds = a : i && (c = "-" === i[1] ? -1 : 1, h = { y: 0, d: ~~i[2] * c, h: ~~i[3] * c, m: ~~i[4] * c, s: ~~i[5] * c, ms: ~~i[6] * c }), d = new f(h), e && a.hasOwnProperty("_lang") && (d._lang = a._lang), d }, L.version = N, L.defaultFormat = db, L.updateOffset = function () { }, L.lang = function (a, b) { return a ? (a = a.toLowerCase(), a = a.replace("_", "-"), b ? n(a, b) : null === b ? (o(a), a = "en") : P[a] || p(a), L.duration.fn._lang = L.fn._lang = p(a), void 0) : L.fn._lang._abbr }, L.langData = function (a) { return a && a._lang && a._lang._abbr && (a = a._lang._abbr), p(a) }, L.isMoment = function (a) { return a instanceof e }, L.isDuration = function (a) { return a instanceof f }, g(L.fn = e.prototype, { clone: function () { return L(this) }, valueOf: function () { return +this._d + 6e4 * (this._offset || 0) }, unix: function () { return Math.floor(+this / 1e3) }, toString: function () { return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ") }, toDate: function () { return this._offset ? new Date(+this) : this._d }, toISOString: function () { return s(L(this).utc(), "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") }, toArray: function () { var a = this; return [a.year(), a.month(), a.date(), a.hours(), a.minutes(), a.seconds(), a.milliseconds()] }, isValid: function () { return null == this._isValid && (this._isValid = this._a ? !l(this._a, (this._isUTC ? L.utc(this._a) : L(this._a)).toArray()) : !isNaN(this._d.getTime())), !!this._isValid }, invalidAt: function () { var a, b = this._a, c = (this._isUTC ? L.utc(this._a) : L(this._a)).toArray(); for (a = 6; a >= 0 && b[a] === c[a]; --a); return a }, utc: function () { return this.zone(0) }, local: function () { return this.zone(0), this._isUTC = !1, this }, format: function (a) { var b = s(this, a || L.defaultFormat); return this.lang().postformat(b) }, add: function (a, b) { var c; return c = "string" == typeof a ? L.duration(+b, a) : L.duration(a, b), j(this, c, 1), this }, subtract: function (a, b) { var c; return c = "string" == typeof a ? L.duration(+b, a) : L.duration(a, b), j(this, c, -1), this }, diff: function (a, b, c) { var d, e, f = this._isUTC ? L(a).zone(this._offset || 0) : L(a).local(), g = 6e4 * (this.zone() - f.zone()); return b = m(b), "year" === b || "month" === b ? (d = 432e5 * (this.daysInMonth() + f.daysInMonth()), e = 12 * (this.year() - f.year()) + (this.month() - f.month()), e += (this - L(this).startOf("month") - (f - L(f).startOf("month"))) / d, e -= 6e4 * (this.zone() - L(this).startOf("month").zone() - (f.zone() - L(f).startOf("month").zone())) / d, "year" === b && (e /= 12)) : (d = this - f, e = "second" === b ? d / 1e3 : "minute" === b ? d / 6e4 : "hour" === b ? d / 36e5 : "day" === b ? (d - g) / 864e5 : "week" === b ? (d - g) / 6048e5 : d), c ? e : h(e) }, from: function (a, b) { return L.duration(this.diff(a)).lang(this.lang()._abbr).humanize(!b) }, fromNow: function (a) { return this.from(L(), a) }, calendar: function () { var a = this.diff(L().zone(this.zone()).startOf("day"), "days", !0), b = -6 > a ? "sameElse" : -1 > a ? "lastWeek" : 0 > a ? "lastDay" : 1 > a ? "sameDay" : 2 > a ? "nextDay" : 7 > a ? "nextWeek" : "sameElse"; return this.format(this.lang().calendar(b, this)) }, isLeapYear: function () { var a = this.year(); return 0 === a % 4 && 0 !== a % 100 || 0 === a % 400 }, isDST: function () { return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone() }, day: function (a) { var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return null != a ? "string" == typeof a && (a = this.lang().weekdaysParse(a), "number" != typeof a) ? this : this.add({ d: a - b }) : b }, month: function (a) { var b, c = this._isUTC ? "UTC" : ""; return null != a ? "string" == typeof a && (a = this.lang().monthsParse(a), "number" != typeof a) ? this : (b = this.date(), this.date(1), this._d["set" + c + "Month"](a), this.date(Math.min(b, this.daysInMonth())), L.updateOffset(this), this) : this._d["get" + c + "Month"]() }, startOf: function (a) { switch (a = m(a)) { case "year": this.month(0); case "month": this.date(1); case "week": case "isoweek": case "day": this.hours(0); case "hour": this.minutes(0); case "minute": this.seconds(0); case "second": this.milliseconds(0) } return "week" === a ? this.weekday(0) : "isoweek" === a && this.isoWeekday(1), this }, endOf: function (a) { return a = m(a), this.startOf(a).add("isoweek" === a ? "week" : a, 1).subtract("ms", 1) }, isAfter: function (a, b) { return b = "undefined" != typeof b ? b : "millisecond", +this.clone().startOf(b) > +L(a).startOf(b) }, isBefore: function (a, b) { return b = "undefined" != typeof b ? b : "millisecond", +this.clone().startOf(b) < +L(a).startOf(b) }, isSame: function (a, b) { return b = "undefined" != typeof b ? b : "millisecond", +this.clone().startOf(b) === +L(a).startOf(b) }, min: function (a) { return a = L.apply(null, arguments), this > a ? this : a }, max: function (a) { return a = L.apply(null, arguments), a > this ? this : a }, zone: function (a) { var b = this._offset || 0; return null == a ? this._isUTC ? b : this._d.getTimezoneOffset() : ("string" == typeof a && (a = v(a)), Math.abs(a) < 16 && (a = 60 * a), this._offset = a, this._isUTC = !0, b !== a && j(this, L.duration(b - a, "m"), 1, !0), this) }, zoneAbbr: function () { return this._isUTC ? "UTC" : "" }, zoneName: function () { return this._isUTC ? "Coordinated Universal Time" : "" }, hasAlignedHourOffset: function (a) { return a = a ? L(a).zone() : 0, 0 === (this.zone() - a) % 60 }, daysInMonth: function () { return L.utc([this.year(), this.month() + 1, 0]).date() }, dayOfYear: function (a) { var b = O((L(this).startOf("day") - L(this).startOf("year")) / 864e5) + 1; return null == a ? b : this.add("d", a - b) }, weekYear: function (a) { var b = G(this, this.lang()._week.dow, this.lang()._week.doy).year; return null == a ? b : this.add("y", a - b) }, isoWeekYear: function (a) { var b = G(this, 1, 4).year; return null == a ? b : this.add("y", a - b) }, week: function (a) { var b = this.lang().week(this); return null == a ? b : this.add("d", 7 * (a - b)) }, isoWeek: function (a) { var b = G(this, 1, 4).week; return null == a ? b : this.add("d", 7 * (a - b)) }, weekday: function (a) { var b = (this._d.getDay() + 7 - this.lang()._week.dow) % 7; return null == a ? b : this.add("d", a - b) }, isoWeekday: function (a) { return null == a ? this.day() || 7 : this.day(this.day() % 7 ? a : a - 7) }, get: function (a) { return a = m(a), this[a.toLowerCase()]() }, set: function (a, b) { a = m(a), this[a.toLowerCase()](b) }, lang: function (b) { return b === a ? this._lang : (this._lang = p(b), this) } }), M = 0; M < gb.length; M++) I(gb[M].toLowerCase().replace(/s$/, ""), gb[M]); I("year", "FullYear"), L.fn.days = L.fn.day, L.fn.months = L.fn.month, L.fn.weeks = L.fn.week, L.fn.isoWeeks = L.fn.isoWeek, L.fn.toJSON = L.fn.toISOString, g(L.duration.fn = f.prototype, { _bubble: function () { var a, b, c, d, e = this._milliseconds, f = this._days, g = this._months, i = this._data; i.milliseconds = e % 1e3, a = h(e / 1e3), i.seconds = a % 60, b = h(a / 60), i.minutes = b % 60, c = h(b / 60), i.hours = c % 24, f += h(c / 24), i.days = f % 30, g += h(f / 30), i.months = g % 12, d = h(g / 12), i.years = d }, weeks: function () { return h(this.days() / 7) }, valueOf: function () { return this._milliseconds + 864e5 * this._days + 2592e6 * (this._months % 12) + 31536e6 * ~~(this._months / 12) }, humanize: function (a) { var b = +this, c = F(b, !a, this.lang()); return a && (c = this.lang().pastFuture(b, c)), this.lang().postformat(c) }, add: function (a, b) { var c = L.duration(a, b); return this._milliseconds += c._milliseconds, this._days += c._days, this._months += c._months, this._bubble(), this }, subtract: function (a, b) { var c = L.duration(a, b); return this._milliseconds -= c._milliseconds, this._days -= c._days, this._months -= c._months, this._bubble(), this }, get: function (a) { return a = m(a), this[a.toLowerCase() + "s"]() }, as: function (a) { return a = m(a), this["as" + a.charAt(0).toUpperCase() + a.slice(1) + "s"]() }, lang: L.fn.lang }); for (M in hb) hb.hasOwnProperty(M) && (K(M, hb[M]), J(M.toLowerCase())); K("Weeks", 6048e5), L.duration.fn.asMonths = function () { return (+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years() }, L.lang("en", { ordinal: function (a) { var b = a % 10, c = 1 === ~~(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th"; return a + c } }), Q && (module.exports = L), "undefined" == typeof ender && (this.moment = L), "function" == typeof define && define.amd && define("moment", [], function () { return L }) }).call(this);


//Modal
(function ($) {
    var visitCount = localStorage['visitCount'],
      //Change this value to edit the number of page loads allowed before showing modal
      displayOnVisitNumber = 1;

    if (visitCount === undefined) {
        visitCount = 0;
    }
    visitCount++;
    localStorage['visitCount'] = visitCount;

    if (visitCount !== displayOnVisitNumber) {
        showModal();
    }
    //console.log(localStorage['visitCount'])

    $('.close-btn a').click(function () {
        hideModal();
    });

    $('#form170').submit(function () {
        var currentUrl = window.location;
        $j('#current-url').val(currentUrl);
        return true;
    });

    function showModal() {
        $('#passport-modal').fadeIn(1000);
    }

    function hideModal() {
        $('#passport-modal').fadeOut(500);
    }
}(jQuery))



