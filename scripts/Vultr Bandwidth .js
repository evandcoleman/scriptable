// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;

let widget = await createWidget();
Script.setWidget(widget);


async function createWidget() {
    const url = "https://api.vultr.com/v1/server/list"
    let req = new Request(url);
    req.method = 'GET';
    let APIKEY = "";
    req.headers = {
        "API-Key": APIKEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
    const data = await req.loadJSON();
    let widgetHeader = "vultr"
    let CLOUD = data[0].current_bandwidth_gb;
    let VPN = data[0].current_bandwidth_gb;
    let YTDL = data[0].current_bandwidth_gb;
    console.log(CLOUD)
    console.log(VPN)
    console.log(YTDL)
    let w = new ListWidget();
    let titleTxt = w.addText(widgetHeader);
	titleTxt.centerAlignText(16);
    let bodyTxt0 = w.addText("vpn " + VPN + " GB");
    let bodyTxt1 = w.addText("Cloud " + CLOUD + " GB");
    let bodyTxt2 = w.addText("YTDL " + YTDL + " GB");
    // w.backgroundColor = new Color("#1b1c1f");
const files = FileManager.local();
const forceImageUpdate = true;
const imageBackground = true;

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
	};
	  
  // If it's not an image background, show the gradient.
  } else {
	let gradient = new LinearGradient()
	let gradientSettings = await setupGradient()
	
	gradient.colors = gradientSettings.color()
	gradient.locations = gradientSettings.position()
	
	w.backgroundGradient = gradient
  };
  
  // Finish the widget and show a preview.
  Script.setWidget(w);

    return w;
};
