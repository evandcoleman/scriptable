// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: wifi;
let widget = await createWidget();
Script.setWidget(widget);

async function createWidget() {


// CloudFlare 
const url = ""
let req = new Request(url);
req.method = 'GET';
let authHeader = "" 
let authHeader2 = ""
req.headers = {
 "X-Auth-Email": authHeader2,
 "X-Auth-Key": authHeader,
 "Content-Type": "application/json",
 "Accept": "application/json"
};
const data = await req.loadJSON();
let CFIP = data.result.content;

// IPINFO.IO
const reqq = new Request("https://ipinfo.io/json");
const dataa = await reqq.loadJSON();
let IPNOW = dataa.ip
	if (IPNOW == "") {
		 IP = "VPN ON"
	} else {
		 IP = dataa.ip	
	};

// Widget Constraction
let w = new ListWidget();
let WidgetHeader = "IPCenter";
let titleTxt = w.addText(WidgetHeader);
titleTxt.centerAlignText(20);
let bodyTxt = w.addText("CloudFlare: " + CFIP);
let bodyTxtt = w.addText("MyIP: " + IP)
// w.backgroundColor = new Color("#1b1c1f");
const files = FileManager.local()

const forceImageUpdate = false
const imageBackground = true

if (imageBackground) {
  
	// Determine if our image exists and when it was saved.
	const path = files.joinPath(files.documentsDirectory(), "IPsWidget-cache")
	const exists = files.fileExists(path)
	
	// If it exists and an update isn't forced, use the cache.
	if (exists && (config.runsInWidget || !forceImageUpdate)) {
	  w.backgroundImage = files.readImage(path)
	
	// If it's missing when running in the widget, use a gray background.
	} else if (!exists && config.runsInWidget) {
		w.backgroundColor = Color.gray() 
	  
	// But if we're running in app, prompt the user for the image.
	} else {
		const img = await Photos.fromLibrary()
		w.backgroundImage = img
		files.writeImage(path, img)
	}
	  
  // If it's not an image background, show the gradient.
  } else {
	let gradient = new LinearGradient()
	let gradientSettings = await setupGradient()
	
	gradient.colors = gradientSettings.color()
	gradient.locations = gradientSettings.position()
	
	w.backgroundGradient = gradient
  }
  
  // Finish the widget and show a preview.
  Script.setWidget(w)

return w;

};
