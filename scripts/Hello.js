// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: grin-tongue-wink;
// To use, add a parameter to the widget with a format of: image.png|padding-top|text-color
// The image should be placed in the iCloud Scriptable folder (case-sensitive).
// The padding-top spacing parameter moves the text down by a set amount.
// The text color parameter should be a hex value.

// For example, to use the image bkg_fall.PNG with a padding of 40 and a text color of red,
// the parameter should be typed as: bkg_fall.png|40|#ff0000

// All parameters are required and separated with "|"

let widgetHello = new ListWidget(); 
var today = new Date();

var widgetInputRAW = args.widgetParameter;

try {
	widgetInputRAW.toString();
} catch(e) {
	throw new Error("Please long press the widget and add a parameter.");
}

var widgetInput = widgetInputRAW.toString();

var inputArr = widgetInput.split("|");

var scriptableFilePath = "/var/mobile/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/";
var removeSpaces1 = inputArr[0].split(" ");
var removeSpaces2 = removeSpaces1.join('');
var tempPath = removeSpaces2.split(".");
var backgroundImageURLRAW = scriptableFilePath + tempPath[0];

var fileTypes = ['png', 'jpg', 'jpeg', 'tiff', 'webp'];

var fm = FileManager.iCloud();
var backgroundImageURL = scriptableFilePath + tempPath[0] + ".";

fileTypes.forEach(function(item) {
	if (fm.fileExists((backgroundImageURL + item.toLowerCase())) == true) {
		backgroundImageURL = backgroundImageURLRAW + "." + item.toLowerCase();
	} else if (fm.fileExists((backgroundImageURL + item.toUpperCase())) == true) {
		backgroundImageURL = backgroundImageURLRAW + "." + item.toUpperCase();
	}
});

var spacing = parseInt(inputArr[1]);


var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var greetingsMorning = [
'Good morning,'
];
var greetingsAfternoon = [
'Good afternoon,'
];
var greetingsEvening = [
'Good evening,'
];
var greetingsNight = [
'Bedtime,'
];
var greetingsLateNight = [
'Go to sleep!,'
];

var weekday = days[ today.getDay() ];
var month = months[ today.getMonth() ];
var date = today.getDate();
var hour = today.getHours();

var datefull = weekday + ", " + month + " " + date;

function randomGreeting(greetingArray) {
	return Math.floor(Math.random() * greetingArray.length);
}

var greeting = new String("Howdy.")
// var greeting = "Howdy.";
if (hour < 5 && hour >= 1) {
	greeting = greetingsLateNight[randomGreeting(greetingsLateNight)];
} else if (hour >= 23 || hour < 1) {
	greeting = greetingsNight[randomGreeting(greetingsNight)];
} else if (hour < 12) {
	greeting = greetingsMorning[randomGreeting(greetingsMorning)];
} else if (hour >= 12 && hour <= 17) {
	greeting = greetingsAfternoon[randomGreeting(greetingsAfternoon)];
} else if (hour > 17 && hour < 23) {
	greeting = greetingsEvening[randomGreeting(greetingsEvening)];
} 

if (month == "October" && date == 31) {
	greeting = "Happy Halloween!";
}
if (month == "December" && date == 25) {
	greeting = "Merry Christmas!";
}

try {
	inputArr[2].toString();
} catch(e) {
	throw new Error("Please long press the widget and add a parameter.");
}

let themeColor = new Color(inputArr[2].toString());

widgetHello.addSpacer(parseInt(spacing));
let hello = widgetHello.addText(greeting + " Abdulrahman.");
hello.font = Font.boldSystemFont(23);
hello.textColor = themeColor;
let datetext = widgetHello.addText(datefull); 
datetext.font = Font.regularSystemFont(18);
datetext.textColor = themeColor;
widgetHello.addSpacer();
widgetHello.setPadding(15, 7, 10, 0)
widgetHello.backgroundImage = Image.fromFile(backgroundImageURL);

Script.setWidget(widgetHello);
