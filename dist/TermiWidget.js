// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;

// Change these to your usernames!
const user = "evan";

// API PARAMETERS !important
// WEATHER_API_KEY, you need an Open Weather API Key
// You can get one for free at: https://home.openweathermap.org/api_keys (account needed).
const WEATHER_API_KEY = "";
const DEFAULT_LOCATION = {
  latitude: 0,
  longitude: 0
};
const TAUTULLI_API_BASE = "";
const TAUTULLI_API_KEY = "";
const HOME_ASSISTANT_API_BASE = "";
const HOME_ASSISTANT_API_KEY = "";
const UPCOMING_SAT_PASS_URL = "";

/******/
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 679:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__) => {
/* harmony import */ var _lib_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(59);




const cache = new _lib_cache__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z("termiWidgetCache");
const data = await fetchData();
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();

function createWidget(data) {
  console.log(data)
  const w = new ListWidget()
  const bgColor = new LinearGradient()
  bgColor.colors = [new Color("#29323c"), new Color("#1c1c1c")]
  bgColor.locations = [0.0, 1.0]
  w.backgroundGradient = bgColor
  w.setPadding(12, 15, 15, 12)

  const stack = w.addStack();
  stack.layoutHorizontally();

  const leftStack = stack.addStack();
  leftStack.layoutVertically();
  leftStack.spacing = 6;
  leftStack.size = new Size(200, 0);

  const time = new Date()
  const dfTime = new DateFormatter()
  dfTime.locale = "en"
  dfTime.useMediumDateStyle()
  dfTime.useNoTimeStyle()

  const firstLine = leftStack.addText(`[] ${user} ~$ now`)
  firstLine.textColor = Color.white()
  firstLine.textOpacity = 0.7
  firstLine.font = new Font("Menlo", 11)
  
  const timeLine = leftStack.addText(`[🗓] ${dfTime.string(time)}`)
  timeLine.textColor = Color.white()
  timeLine.font = new Font("Menlo", 11)
  
  const batteryLine = leftStack.addText(`[🔋] ${renderBattery()}`)
  batteryLine.textColor = new Color("#6ef2ae")
  batteryLine.font = new Font("Menlo", 11)
  
  const locationLine = leftStack.addText(`[️️📍] Location: ${data.weather.location}`)
  locationLine.textColor = new Color("#7dbbae")
  locationLine.font = new Font("Menlo", 11)
  
  const homeLine = leftStack.addText(`[🏠] ${data.home.mode}, ${data.home.temperature}°, Lights ${data.home.lights ? "On" : "Off"}`);
  homeLine.textColor = new Color("#ff9468")
  homeLine.font = new Font("Menlo", 11)
  
  let plexText = `[🍿] Plex: ${data.plex.streams} stream${data.plex.streams == 1 ? '' : 's'}`;
  // if (data.plex.streams > 0) {
  //   plexText += `, ${data.plex.transcodes} transcode${data.plex.transcodes == 1 ? '' : 's'}`;
  // }
  const plexLine = leftStack.addText(plexText);
  plexLine.textColor = new Color("#ffa7d3")
  plexLine.font = new Font("Menlo", 11)

  const satLine = leftStack.addText(`[🛰] ${data.satPass}`);
  satLine.textColor = new Color("#ffcc66")
  satLine.font = new Font("Menlo", 11)

  stack.addSpacer();
  const rightStack = stack.addStack();
  rightStack.spacing = 2;
  rightStack.layoutVertically();
  rightStack.bottomAlignContent();

  addWeatherLine(rightStack, data.weather.icon, 32);
  addWeatherLine(rightStack, `${data.weather.description}, ${data.weather.temperature}°`, 12, true);
  addWeatherLine(rightStack, `High: ${data.weather.high}°`);
  addWeatherLine(rightStack, `Low: ${data.weather.low}°`);
  addWeatherLine(rightStack, `Wind: ${data.weather.wind} mph`);

  return w
}

function addWeatherLine(w, text, size, bold) {
  const stack = w.addStack();
  stack.setPadding(0, 0, 0, 0);
  stack.layoutHorizontally();
  stack.addSpacer();
  const line = stack.addText(text);
  line.textColor = new Color("#ffcc66");
  line.font = new Font("Menlo" + (bold ? "-Bold" : ""), size || 11);
}

async function fetchData() {
  const weather = await fetchWeather();
  const plex = await fetchPlex();
  const home = await fetchHome();
  const satPass = await fetchNextSatPass();
  
  return {
    weather,
    plex,
    home,
    satPass,
  }
}

function renderBattery() {
  const batteryLevel = Device.batteryLevel()
  const juice = "#".repeat(Math.floor(batteryLevel * 8))
  const used = ".".repeat(8 - juice.length)
  const batteryAscii = `[${juice}${used}] ${Math.round(batteryLevel * 100)}%`
  return batteryAscii
}

async function fetchWeather() {
  let location = await cache.read('location');
  if (!location) {
    try {
      Location.setAccuracyToThreeKilometers();
      location = await Location.current();
    } catch(error) {
      location = await cache.read('location');
    }
  }
  if (!location) {
    location = DEFAULT_LOCATION;
  }
  const address = await Location.reverseGeocode(location.latitude, location.longitude);
  const url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&exclude=minutely,hourly,alerts&units=imperial&lang=en&appid=" + WEATHER_API_KEY;
  const data = await fetchJson(`weather_${address[0].locality}`, url);

  return {
    location: address[0].locality,
    icon: getWeatherEmoji(data.current.weather[0].id, ((new Date()).getTime() / 1000) >= data.current.sunset),
    description: data.current.weather[0].main,
    temperature: Math.round(data.current.temp),
    wind: Math.round(data.current.wind_speed),
    high: Math.round(data.daily[0].temp.max),
    low: Math.round(data.daily[0].temp.min),
  }
}

async function fetchPlex() {
  const url = `${TAUTULLI_API_BASE}/api/v2?apikey=${TAUTULLI_API_KEY}&cmd=get_activity`; 
  const data = await fetchJson(`plex`, url);

  return {
    streams: data.response.data.stream_count,
    transcodes: data.response.data.stream_count_transcode,
  };
}

async function fetchHome() {
  const mode = await fetchHomeAssistant('states/input_select.mode');
  const temp = await fetchHomeAssistant('states/sensor.hallway_temperature');
  const livingRoomLight = (await fetchHomeAssistant('states/light.living_room')).state == "on";
  const bedRoomLight = (await fetchHomeAssistant('states/light.bedroom')).state == "on";
  const hallwayLight = (await fetchHomeAssistant('states/light.hallway')).state == "on";
  const bathroomLight = (await fetchHomeAssistant('states/light.bathroom')).state == "on";

  return {
    mode: mode.state,
    temperature: Math.round(parseFloat(temp.state)),
    lights: livingRoomLight || bedRoomLight || hallwayLight || bathroomLight,
  };
}

async function fetchHomeAssistant(path) {
  return fetchJson(path, `${HOME_ASSISTANT_API_BASE}/api/${path}`, {
    'Authorization': `Bearer ${HOME_ASSISTANT_API_KEY}`,
    'Content-Type': 'application/json',
  });
}

async function fetchNextSatPass() {  
  const passes = await fetchJson('upcoming-passes.json', UPCOMING_SAT_PASS_URL);
  const now = new Date();
  const nextPass = passes
    .filter((p) => now.getTime() < p.end)[0];

  if (!nextPass) {
    return 'No more passes today';
  }

  if (nextPass.start > now.getTime()) {
    const minutes = Math.round(((nextPass.start - now.getTime()) / 1000) / 60);
    const hours = Math.round((((nextPass.start - now.getTime()) / 1000) / 60) / 60);
    
    if (minutes > 59) {
      return `${nextPass.satellite} in ${hours}h, ${Math.round(nextPass.elevation)}°`;
    } else {
      return `${nextPass.satellite} in ${minutes}m, ${Math.round(nextPass.elevation)}°`;
    }
  } else {
    return `${nextPass.satellite} for ${Math.round(((nextPass.end - now.getTime()) / 1000) / 60)}m, ${Math.round(nextPass.elevation)}°`;
  }
}

async function fetchJson(key, url, headers) {
  const cached = await cache.read(key, 5);
  if (cached) {
    return cached;
  }

  try {
    console.log(`Fetching url: ${url}`);
    const req = new Request(url);
    req.headers = headers;
    const resp = await req.loadJSON();
    cache.write(key, resp);
    return resp;
  } catch (error) {
    try {
      return cache.read(key, 5);
    } catch (error) {
      console.log(`Couldn't fetch ${url}`);
    }
  }
}

function getWeatherEmoji(code, isNight) {
  if (code >= 200 && code < 300 || code == 960 || code == 961) {
    return "⛈"
  } else if ((code >= 300 && code < 600) || code == 701) {
    return "🌧"
  } else if (code >= 600 && code < 700) {
    return "❄️"
  } else if (code == 711) {
    return "🔥" 
  } else if (code == 800) {
    return isNight ? "🌕" : "☀️" 
  } else if (code == 801) {
    return isNight ? "☁️" : "🌤"  
  } else if (code == 802) {
    return isNight ? "☁️" : "⛅️"  
  } else if (code == 803) {
    return isNight ? "☁️" : "🌥" 
  } else if (code == 804) {
    return "☁️"  
  } else if (code == 900 || code == 962 || code == 781) {
    return "🌪" 
  } else if (code >= 700 && code < 800) {
    return "🌫" 
  } else if (code == 903) {
    return "🥶"  
  } else if (code == 904) {
    return "🥵" 
  } else if (code == 905 || code == 957) {
    return "💨" 
  } else if (code == 906 || code == 958 || code == 959) {
    return "🧊" 
  } else {
    return "❓" 
  }
}

__webpack_handle_async_dependencies__();
}, 1);

/***/ }),

/***/ 59:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ Cache)
/* harmony export */ });
class Cache {
  constructor(name, expirationMinutes) {
    this.fm = FileManager.iCloud();
    this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), name);
    this.expirationMinutes = expirationMinutes;

    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath)
    }
  }

  async read(key, expirationMinutes) {
    try {
      const path = this.fm.joinPath(this.cachePath, key);
      await this.fm.downloadFileFromiCloud(path);
      const createdAt = this.fm.creationDate(path);
      
      if (this.expirationMinutes || expirationMinutes) {
        if ((new Date()) - createdAt > ((this.expirationMinutes || expirationMinutes) * 60000)) {
          this.fm.remove(path);
          return null;
        }
      }
      
      const value = this.fm.readString(path);
    
      try {
        return JSON.parse(value);
      } catch(error) {
        return value;
      }
    } catch(error) {
      return null;
    }
  };

  write(key, value) {
    const path = this.fm.joinPath(this.cachePath, key.replace('/', '-'));
    console.log(`Caching to ${path}...`);

    if (typeof value === 'string' || value instanceof String) {
      this.fm.writeString(path, value);
    } else {
      this.fm.writeString(path, JSON.stringify(value));
    }
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackThen = typeof Symbol === "function" ? Symbol("webpack then") : "__webpack_then__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var completeQueue = (queue) => {
/******/ 			if(queue) {
/******/ 				queue.forEach(fn => fn.r--);
/******/ 				queue.forEach(fn => fn.r-- ? fn.r++ : fn());
/******/ 			}
/******/ 		}
/******/ 		var completeFunction = fn => !--fn.r && fn();
/******/ 		var queueFunction = (queue, fn) => queue ? queue.push(fn) : completeFunction(fn);
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackThen]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [], result;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						completeQueue(queue);
/******/ 						queue = 0;
/******/ 					});
/******/ 					var obj = { [webpackThen]: (fn, reject) => { queueFunction(queue, fn); dep.catch(reject); } };
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			return { [webpackThen]: (fn) => { completeFunction(fn); }, [webpackExports]: dep };
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue = hasAwait && [];
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var isEvaluating = true;
/******/ 			var nested = false;
/******/ 			var whenAll = (deps, onResolve, onReject) => {
/******/ 				if (nested) return;
/******/ 				nested = true;
/******/ 				onResolve.r += deps.length;
/******/ 				deps.map((dep, i) => {
/******/ 					dep[webpackThen](onResolve, onReject);
/******/ 				});
/******/ 				nested = false;
/******/ 			};
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = () => {
/******/ 					resolve(exports);
/******/ 					completeQueue(queue);
/******/ 					queue = 0;
/******/ 				};
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackThen] = (fn, rejectFn) => {
/******/ 				if (isEvaluating) { return completeFunction(fn); }
/******/ 				if (currentDeps) whenAll(currentDeps, fn, rejectFn);
/******/ 				queueFunction(queue, fn);
/******/ 				promise.catch(rejectFn);
/******/ 			};
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				if(!deps) return outerResolve();
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn, result;
/******/ 				var promise = new Promise((resolve, reject) => {
/******/ 					fn = () => (resolve(result = currentDeps.map(d => d[webpackExports])))
/******/ 					fn.r = 0;
/******/ 					whenAll(currentDeps, fn, reject);
/******/ 				});
/******/ 				return fn.r ? promise : result;
/******/ 			}).then(outerResolve, reject);
/******/ 			isEvaluating = false;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(679);
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	
/******/ })()
;