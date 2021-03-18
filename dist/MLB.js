// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: baseball-ball;

/////////////////////////////////////////
//
//  Configuration - PLEASE READ
//
/////////////////////////////////////////

// PLEASE READ - To set your team:
// Long-press on the widget on your homescreen, then tap "Edit Widget"
// Input your team abbreviation in the "Parameter" field.
// Set "When Interacting" to "Run Script" if you want taps to route to the MLB app.
// Find team abbreviation here: https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Baseball/Team_abbreviations

/////////////////////////

const TEAM = args.widgetParameter || 'NYY';

// simple, expanded
const LAYOUT = "expanded";

/////////////////////////////////////////
//
//  Do not edit below this line!
//
/////////////////////////////////////////

/******/
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 208:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__) => {
/* harmony import */ var _lib_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(59);
/* harmony import */ var _lib_updater__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(331);
/* harmony import */ var _lib_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(630);






const scriptVersion = 12;
const sourceRepo = "evandcoleman/scriptable";
const scriptName = "MLB";

/////////////////////////////////////////
//
//  Script
//
/////////////////////////////////////////

const cache = new _lib_cache__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z("mlbWidgetCache", 2);
const updater = new _lib_updater__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z(sourceRepo);

try {
  const widget = await (async (layout) => {
    switch (layout) {
      case 'simple':
        return createSimpleWidget();
      case 'expanded':
        return createExpandedWidget();
      default:
        throw new Error(`Invalid layout type ${layout}`);
    }
  })(LAYOUT);
  widget.url = "mlbatbat://"
  Script.setWidget(widget);
} catch (error) {
  console.log(`${error.line}: ${error.message}`);
}

try {
  await updater.checkForUpdate(scriptName, scriptVersion);
} catch (error) {
  console.log(`${error.line}: ${error.message}`);
}

Script.complete();

async function createExpandedWidget() {
  const w = new ListWidget()
  w.backgroundColor = new Color("#0F1011");
  w.setPadding(20, 15, 15, 15)

  const mainStack = w.addStack();
  mainStack.layoutVertically();

  const { game, team } = await fetchTeam(TEAM);
  const awayLogo = await fetchTeamLogo(game.teams.away.team.abbreviation);
  const homeLogo = await fetchTeamLogo(game.teams.home.team.abbreviation);
  const { gameStatus, isPlaying, isPreGame, isPostGame } = getFormattedStatus(game);

  const upperStack = mainStack.addStack();

  if (!isPreGame) {
    upperStack.layoutHorizontally();
    const scoreStack = upperStack.addStack();
    scoreStack.layoutVertically();

    const awayStack = scoreStack.addStack();
    awayStack.centerAlignContent();
    const awayLogoImage = awayStack.addImage(awayLogo);
    awayLogoImage.imageSize = new Size(32, 32);
    awayStack.addSpacer(6);
    const awayRuns = awayStack.addText(`${game.linescore.teams.away.runs || 0}`);
    awayRuns.font = Font.boldSystemFont(28);
    awayRuns.textColor = Color.white();

    const spacer = scoreStack.addSpacer();
    spacer.length = 6;

    const homeStack = scoreStack.addStack();
    homeStack.centerAlignContent();
    const homeLogoImage = homeStack.addImage(homeLogo);
    homeLogoImage.imageSize = new Size(32, 32);
    homeStack.addSpacer(6);
    const homeRuns = homeStack.addText(`${game.linescore.teams.home.runs || 0}`);
    homeRuns.font = Font.boldSystemFont(28);
    homeRuns.textColor = Color.white();
  } else {
    upperStack.layoutVertically();

    const logoStack = upperStack.addStack();
    logoStack.layoutHorizontally();
    logoStack.bottomAlignContent();
    const awayLogoImage = logoStack.addImage(awayLogo);
    awayLogoImage.imageSize = new Size(38, 38);
    logoStack.addSpacer();
    const vsText = logoStack.addText('vs.');
    vsText.textColor = Color.lightGray();
    vsText.font = Font.regularSystemFont(14);
    logoStack.addSpacer();
    const homeLogoImage = logoStack.addImage(homeLogo);
    homeLogoImage.imageSize = new Size(38, 38);
  }

  upperStack.addSpacer();
  const statusStack = upperStack.addStack();
  statusStack.layoutVertically();

  const inningStack = statusStack.addStack();
  inningStack.layoutHorizontally();
  inningStack.centerAlignContent();

  if (isPlaying) {
    inningStack.addSpacer(12);
    const arrowText = inningStack.addText(game.linescore.isTopInning ? '▲' : '▼');
    arrowText.font = Font.regularSystemFont(10);
    arrowText.textColor = Color.lightGray();
    inningStack.addSpacer(4);
    const statusText = inningStack.addText(game.linescore.currentInning.toString());
    statusText.font = Font.mediumSystemFont(22);
    statusText.textColor = Color.white();

    const basesStack = statusStack.addStack();
    basesStack.layoutHorizontally();
    const bases = getBasesImage(game);
    const basesWidgetImage = basesStack.addImage(bases);
    basesWidgetImage.rightAlignImage();
    basesWidgetImage.imageSize = new Size(42, 42);

    const outsStack = statusStack.addStack();
    outsStack.layoutHorizontally();
    const outImages = getOutsImages(game);
    for (let index in outImages) {
      if (index > 0) {
        outsStack.addSpacer(index == 0 ? null : index === 2 ? 0 : 12);
      }
      const widgetImage = outsStack.addImage(outImages[index]);
      widgetImage.imageSize = new Size(6, 6);
    }
  } else if (isPreGame) {
    inningStack.addSpacer();
    const statusText = inningStack.addText(gameStatus);
    statusText.font = Font.regularSystemFont(11);
    statusText.textColor = Color.lightGray();
    inningStack.addSpacer();
  } else {
    const statusText = inningStack.addText(gameStatus);
    statusText.font = Font.caption1();
    statusText.textColor = Color.lightGray();
  }

  mainStack.addSpacer();

  const lowerStack = mainStack.addStack();
  lowerStack.layoutVertically();

  if (isPlaying) {
    const abTitleText = lowerStack.addText("At Bat:")
    abTitleText.font = Font.mediumSystemFont(11);
    abTitleText.textColor = Color.lightGray();
    const nameCountStack = lowerStack.addStack();
    nameCountStack.layoutHorizontally();
    nameCountStack.centerAlignContent();
    const playerNameText = nameCountStack.addText(game.linescore.offense.batter.fullName);
    playerNameText.font = Font.regularSystemFont(12);
    playerNameText.textColor = Color.white();
    // playerNameText.minimumScaleFactor = 0.9;
    nameCountStack.addSpacer(4);
    const countText = nameCountStack.addText(`(${game.linescore.balls}-${game.linescore.strikes})`);
    countText.font = Font.regularSystemFont(10);
    countText.textColor = Color.lightGray();
    nameCountStack.addSpacer();

    const pitcherTitleText = lowerStack.addText("Pitching:")
    pitcherTitleText.font = Font.mediumSystemFont(11);
    pitcherTitleText.textColor = Color.lightGray();
    const namePitchesStack = lowerStack.addStack();
    namePitchesStack.layoutHorizontally();
    namePitchesStack.centerAlignContent();
    const pitcherNameText = namePitchesStack.addText(game.linescore.defense.pitcher.fullName);
    pitcherNameText.font = Font.regularSystemFont(12);
    pitcherNameText.textColor = Color.white();
    // pitcherNameText.minimumScaleFactor = 0.9;
    namePitchesStack.addSpacer(4);
    const pitchesThrown = game.linescore.defense.pitcher.stats.filter(stat => stat.type.displayName === 'gameLog' && stat.group.displayName === 'pitching')[0].stats.pitchesThrown;
    const pitchesThrownText = namePitchesStack.addText(`(P ${pitchesThrown})`);
    pitchesThrownText.font = Font.regularSystemFont(10);
    pitchesThrownText.textColor = Color.lightGray();
    namePitchesStack.addSpacer();
  } else if (isPreGame) {
    const abTitleText = lowerStack.addText("Away Pitcher:")
    abTitleText.font = Font.mediumSystemFont(11);
    abTitleText.textColor = Color.lightGray();
    const nameCountStack = lowerStack.addStack();
    nameCountStack.layoutHorizontally();
    nameCountStack.centerAlignContent();
    const playerNameText = nameCountStack.addText(game.teams.away.probablePitcher?.fullName || 'TBD');
    playerNameText.font = Font.regularSystemFont(12);
    playerNameText.textColor = Color.white();
    // playerNameText.minimumScaleFactor = 0.9;
    if (game.teams.away.probablePitcher) {
      nameCountStack.addSpacer(4);
      const winnerStats = game.teams.away.probablePitcher.stats.filter(stat => stat.type.displayName === 'statsSingleSeason' && stat.group.displayName === 'pitching')[0].stats;
      const countText = nameCountStack.addText(`(${winnerStats.wins}-${winnerStats.losses})`);
      countText.font = Font.regularSystemFont(10);
      countText.textColor = Color.lightGray();
    }
    nameCountStack.addSpacer();

    const pitcherTitleText = lowerStack.addText("Home Pitcher:")
    pitcherTitleText.font = Font.mediumSystemFont(11);
    pitcherTitleText.textColor = Color.lightGray();
    const namePitchesStack = lowerStack.addStack();
    namePitchesStack.layoutHorizontally();
    namePitchesStack.centerAlignContent();
    const pitcherNameText = namePitchesStack.addText(game.teams.home.probablePitcher?.fullName || 'TBD');
    pitcherNameText.font = Font.regularSystemFont(12);
    pitcherNameText.textColor = Color.white();
    // pitcherNameText.minimumScaleFactor = 0.9;
    if (game.teams.home.probablePitcher) {
      namePitchesStack.addSpacer(4);
      const loserStats = game.teams.home.probablePitcher.stats.filter(stat => stat.type.displayName === 'statsSingleSeason' && stat.group.displayName === 'pitching')[0].stats;
      const pitchesThrownText = namePitchesStack.addText(`(${loserStats.wins}-${loserStats.losses})`);
      pitchesThrownText.font = Font.regularSystemFont(10);
      pitchesThrownText.textColor = Color.lightGray();
    }
    namePitchesStack.addSpacer();
  } else if (isPostGame) {
    const abTitleText = lowerStack.addText("Winning Pitcher:")
    abTitleText.font = Font.mediumSystemFont(11);
    abTitleText.textColor = Color.lightGray();
    const nameCountStack = lowerStack.addStack();
    nameCountStack.layoutHorizontally();
    nameCountStack.centerAlignContent();
    const playerNameText = nameCountStack.addText(game.decisions.winner.fullName);
    playerNameText.font = Font.regularSystemFont(12);
    playerNameText.textColor = Color.white();
    // playerNameText.minimumScaleFactor = 0.9;
    nameCountStack.addSpacer(4);
    const winnerStats = game.decisions.winner.stats.filter(stat => stat.type.displayName === 'statsSingleSeason' && stat.group.displayName === 'pitching')[0].stats;
    const countText = nameCountStack.addText(`(${winnerStats.wins}-${winnerStats.losses})`);
    countText.font = Font.regularSystemFont(10);
    countText.textColor = Color.lightGray();
    nameCountStack.addSpacer();

    const pitcherTitleText = lowerStack.addText("Losing Pitcher:")
    pitcherTitleText.font = Font.mediumSystemFont(11);
    pitcherTitleText.textColor = Color.lightGray();
    const namePitchesStack = lowerStack.addStack();
    namePitchesStack.layoutHorizontally();
    namePitchesStack.centerAlignContent();
    const pitcherNameText = namePitchesStack.addText(game.decisions.loser.fullName);
    pitcherNameText.font = Font.regularSystemFont(12);
    pitcherNameText.textColor = Color.white();
    // pitcherNameText.minimumScaleFactor = 0.9;
    namePitchesStack.addSpacer(4);
    const loserStats = game.decisions.loser.stats.filter(stat => stat.type.displayName === 'statsSingleSeason' && stat.group.displayName === 'pitching')[0].stats;
    const pitchesThrownText = namePitchesStack.addText(`(${loserStats.wins}-${loserStats.losses})`);
    pitchesThrownText.font = Font.regularSystemFont(10);
    pitchesThrownText.textColor = Color.lightGray();
    namePitchesStack.addSpacer();
  }

  lowerStack.addSpacer();

  return w
}

async function createSimpleWidget() {
  const w = new ListWidget()
  w.backgroundColor = new Color("#0F1011");
  w.setPadding(15, 10, 15, 15)

  const mainStack = w.addStack();
  mainStack.layoutVertically();

  const { game, team } = await fetchTeam(TEAM);
  const awayLogo = await fetchTeamLogo(game.teams.away.team.abbreviation);
  const homeLogo = await fetchTeamLogo(game.teams.home.team.abbreviation);
  const { gameStatus, isPlaying, isPreGame, isPostGame } = getFormattedStatus(game);

  const scoreStack = mainStack.addStack();
  scoreStack.layoutVertically();

  const awayStack = scoreStack.addStack();
  awayStack.centerAlignContent();
  const awayLogoImage = awayStack.addImage(awayLogo);
  awayLogoImage.imageSize = new Size(42, 42);
  awayStack.addSpacer();
  const awayName = awayStack.addText(game.teams.away.team.abbreviation);
  awayName.font = Font.title2();
  awayName.textColor = Color.white();
  awayStack.addSpacer();
  if (!isPreGame) {
    const awayRuns = awayStack.addText(`${game.linescore.teams.away.runs || 0}`);
    awayRuns.font = Font.title2();
    awayRuns.textColor = Color.white();
  }

  const spacer = scoreStack.addSpacer();
  spacer.length = 6;

  const homeStack = scoreStack.addStack();
  homeStack.centerAlignContent();
  const homeLogoImage = homeStack.addImage(homeLogo);
  homeLogoImage.imageSize = new Size(42, 42);
  homeStack.addSpacer();
  const homeName = homeStack.addText(game.teams.home.team.abbreviation);
  homeName.font = Font.title2();
  homeName.textColor = Color.white();
  homeStack.addSpacer();
  if (!isPreGame) {
    const homeRuns = homeStack.addText(`${game.linescore.teams.home.runs || 0}`);
    homeRuns.font = Font.title2();
    homeRuns.textColor = Color.white();
  }

  mainStack.addSpacer();
  const statusStack = mainStack.addStack();
  statusStack.layoutHorizontally();
  statusStack.addSpacer();

  const statusText = statusStack.addText(gameStatus);
  statusText.font = Font.callout();
  statusText.textColor = Color.lightGray();

  return w
}

function getFormattedStatus(game, opts) {
  const options = opts || {};
  const status = game.status.abstractGameState;
  const shortStatus = game.status.abstractGameCode;
  const innings = game.linescore.innings.length;
  const short = options.short || false;

  let statusText;
  let isPlaying = false;
  let isPreGame = false;
  let isPostGame = false;
  switch (status) {
    case "Final":
    case "Completed Early":
    case "Game Over":
      isPostGame = true;
      if (innings !== 9) {
        statusText = `${short ? shortStatus : status}/${innings}`;
      } else {
        statusText = short ? shortStatus : status;
      }
      break;
    case "Delayed":
      isPlaying = true;
      statusText = `${short ? shortStatus : status}/${innings}`;
      break;
    case "Suspended":
      isPostGame = true;
      statusText = `${short ? shortStatus : status}/${innings}`;
      break;
    case "In Progress":
    case "Live":
      isPlaying = true;
      if (!short) {
        statusText = `${game.linescore.inningState} ${game.linescore.currentInningOrdinal}`;
      } else {
        statusText = `${game.linescore.isTopInning ? 'Top' : 'Bot'} ${game.linescore.currentInning}`;
      }
      break;
    case "Preview":
    case "Pre-Game":
      isPreGame = true;
      const df = new DateFormatter();
      df.useShortTimeStyle();
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 86400000);
      if ((new Date(game.gameDate)).setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
        df.useNoDateStyle();
        statusText = df.string(new Date(game.gameDate));
      } else if ((new Date(game.gameDate)).setHours(0, 0, 0, 0) === tomorrow.setHours(0, 0, 0, 0)) {
        df.useNoDateStyle();
        const rdtf = new RelativeDateTimeFormatter();
        rdtf.useNamedDateTimeStyle();
        statusText = rdtf.string(new Date(game.gameDate), now) + ' at ' + df.string(new Date(game.gameDate));
      } else {
        df.dateFormat = "E M/d 'at' h:mm a";
        statusText = df.string(new Date(game.gameDate));
      }
      break;
    default:
      statusText = short ? shortStatus : status;
      break;
  }

  return {
    gameStatus: statusText,
    isPlaying,
    isPreGame,
    isPostGame,
  }
}

function getBasesImage(game) {
  const side = 80;
  const space = 6;
  const onFirst = 'first' in game.linescore.offense;
  const onSecond = 'second' in game.linescore.offense;
  const onThird = 'third' in game.linescore.offense;

  const baseSide = (Math.sqrt(2 * Math.pow(side / 2, 2)) / 2) - space;
  const baseHyp = Math.sqrt(2 * Math.pow(baseSide, 2));
  const spaceX = Math.sqrt(Math.pow(space, 2) / 2) * 2;

  const ctx = new DrawContext();
  ctx.opaque = false;
  ctx.size = new Size(side, side);
  ctx.setStrokeColor(Color.lightGray());
  ctx.setFillColor(new Color("#FFA500"));
  ctx.setLineWidth(2);

  const thirdBasePath = new Path();
  thirdBasePath.addLines([
    new Point(0, side / 2),
    new Point(baseHyp / 2, (side / 2) + (baseHyp / 2)),
    new Point(baseHyp, side / 2),
    new Point(baseHyp / 2, (side / 2) - (baseHyp / 2))
  ]);
  thirdBasePath.closeSubpath();
  ctx.addPath(thirdBasePath);
  ctx.strokePath();
  if (onThird) {
    ctx.addPath(thirdBasePath);
    ctx.fillPath();
  }

  const secondBasePath = new Path();
  secondBasePath.addLines([
    new Point((baseHyp / 2) + spaceX, baseHyp / 2),
    new Point(baseHyp + spaceX, 0),
    new Point(baseHyp + spaceX + (baseHyp / 2), baseHyp / 2),
    new Point(baseHyp + spaceX, baseHyp)
  ]);
  secondBasePath.closeSubpath();
  ctx.addPath(secondBasePath);
  ctx.strokePath();
  if (onSecond) {
    ctx.addPath(secondBasePath);
    ctx.fillPath();
  }

  const firstBasePath = new Path();
  firstBasePath.addLines([
    new Point((side / 2) + spaceX, side / 2),
    new Point(((side / 2) + spaceX) + (baseHyp / 2), (side / 2) + (baseHyp / 2)),
    new Point(((side / 2) + spaceX) + baseHyp, side / 2),
    new Point(((side / 2) + spaceX) + (baseHyp / 2), (side / 2) - (baseHyp / 2))
  ]);
  firstBasePath.closeSubpath();
  ctx.addPath(firstBasePath);
  ctx.strokePath();
  if (onFirst) {
    ctx.addPath(firstBasePath);
    ctx.fillPath();
  }

  const image = ctx.getImage();

  return image;
}

function getOutsImages(game) {
  const radius = 8;

  const ctx = new DrawContext();
  ctx.opaque = false;
  ctx.size = new Size(radius * 2, radius * 2);
  ctx.setFillColor(Color.lightGray());

  const outs = game.linescore.outs;

  for (let i = 0; i < 3; i += 1) {
    ctx.fillEllipse(new Rect(0, 0, radius * 2, radius * 2));
  }

  const offImage = ctx.getImage();
  ctx.setFillColor(new Color("#FFA500"));

  for (let i = 1; i <= 3; i += 1) {
    ctx.fillEllipse(new Rect(0, 0, radius * 2, radius * 2));
  }

  const onImage = ctx.getImage();

  return [
    outs > 0 ? onImage : offImage,
    outs > 1 ? onImage : offImage,
    outs > 2 ? onImage : offImage,
  ];
}

async function fetchTeam(team) {
  let game;
  let days = 0;

  while (!game && days < 7) {
    let scoreboard = await fetchScoreboard(days);
    const games = scoreboard.filter(game => {
      const away = game.teams.away.team.abbreviation;
      const home = game.teams.home.team.abbreviation;

      return team === away || team === home;
    });

    game = games[0];
    days += 1;
  }

  const isHome = game.teams.home.team.abbreviation === team;

  return {
    game,
    team: isHome ? game.teams.home.team : game.teams.away.team,
  };
}

async function fetchScoreboard(inDays) {
  const df = new DateFormatter();
  df.dateFormat = "yyyy-MM-dd";
  const now = new Date();
  const date = now.getHours() < 5 ? new Date(now.getTime() - 43200000) : new Date(now.getTime() + (86400000 * (inDays || 0)));
  const dateString = df.string(date);
  const url = `https://statsapi.mlb.com/api/v1/schedule?date=${dateString}&language=en&hydrate=team(league),venue(location,timezone),linescore(matchup,runners,positions),decisions,homeRuns,probablePitcher,flags,review,seriesStatus,person,stats,broadcasts(all)&sportId=1`;
  const data = await _lib_http__WEBPACK_IMPORTED_MODULE_2__/* .fetchJson */ .r({
    cache,
    url,
    cacheKey: `mlb_scores_${TEAM}_${inDays}`,
  });

  return data.dates[0].games;
}

async function fetchTeamLogo(team) {
  const req = new Request(`https://a.espncdn.com/i/teamlogos/mlb/500/${team.toLowerCase()}.png`);
  return req.loadImage();
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


/***/ }),

/***/ 630:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "r": () => (/* binding */ fetchJson)
/* harmony export */ });
async function fetchJson({ url, headers, cache, cacheKey, cacheExpiration }) {
  if (cache && cacheKey) {
    const cached = await cache.read(cacheKey, cacheExpiration);
    if (cached) {
      return cached;
    }
  }

  try {
    console.log(`Fetching url: ${url}`);
    const req = new Request(url);
    if (headers) {
      req.headers = headers;
    }
    const resp = await req.loadJSON();
    if (cache && cacheKey) {
      cache.write(cacheKey, resp);
    }
    return resp;
  } catch (error) {
    if (cache && cacheKey) {
      try {
        return cache.read(cacheKey, cacheTimeout || 1);
      } catch (error) {
        console.log(`Couldn't fetch ${url}`);
      }
    } else {
      console.log(error);
    }
  }
}


/***/ }),

/***/ 331:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ Updater)
/* harmony export */ });
/* harmony import */ var _cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(59);
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(630);



class Updater {
  constructor(repo) {
    this.repo = repo;
    this.fm = FileManager.iCloud();
    this.cache = new _cache__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z("edcWidgetUpdaterCache", 15);
  }

  async checkForUpdate(name, version) {
    const latestVersion = await this.getLatestVersion(name);

    if (latestVersion > version) {
      console.log(`Version ${latestVersion} is greater than ${version}. Updating...`);
      await this.updateScript(name, latestVersion);

      return true;
    }

    console.log(`Version ${version} is not newer than ${latestVersion}. Skipping update.`);

    return false;
  }

  async getLatestVersion(name) {
    const url = `https://api.github.com/repos/${this.repo}/releases`;
    const data = await _http__WEBPACK_IMPORTED_MODULE_1__/* .fetchJson */ .r({
      url,
      cache: this.cache,
      cacheKey: name
    });

    if (!data || data.length === 0) {
      return null;
    }

    const matches = data
      .filter(x => x.tag_name.startsWith(`${name}-`) && !x.draft && !x.prerelease)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    if (!matches|| matches.length === 0) {
      return null;
    }

    const release = matches[0];
    const version = release.tag_name.split('-').slice(-1)[0];

    return parseInt(version, 10);
  }

  async updateScript(name, version) {
    const url = `https://raw.githubusercontent.com/${this.repo}/${name}-${version}/dist/${name}.js`;
    const req = new Request(url);
    const content = await req.loadString();

    const path = this.fm.joinPath(this.fm.documentsDirectory(), name + '.js');

    this.fm.writeString(path, content);
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
/******/ 	var __webpack_exports__ = __webpack_require__(208);
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	
/******/ })()
;