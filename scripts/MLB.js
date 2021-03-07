// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: baseball-ball;

const TEAM = "NYY";

// simple, expanded
const LAYOUT = "expanded";

/////////////////////////////////////////
//
//  Cache
//
/////////////////////////////////////////

class Cache {
  constructor(name) {
    this.fm = FileManager.iCloud();
    this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), name);

    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath)
    }
  }

  async read(key, expirationMinutes) {
    try {
      const path = this.fm.joinPath(this.cachePath, key);
      await this.fm.downloadFileFromiCloud(path);
      const createdAt = this.fm.creationDate(path);
      
      if (expirationMinutes) {
        if ((new Date()) - createdAt > (expirationMinutes * 60000)) {
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

///////////////////////////////////////////

const cache = new Cache("mlbWidgetCache");
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
Script.setWidget(widget);
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

    const spacer = scoreStack.addSpacer();
    spacer.length = 6;

    const homeStack = scoreStack.addStack();
    homeStack.centerAlignContent();
    const homeLogoImage = homeStack.addImage(homeLogo);
    homeLogoImage.imageSize = new Size(32, 32);
    homeStack.addSpacer(6);
    const homeRuns = homeStack.addText(`${game.linescore.teams.home.runs || 0}`);
    homeRuns.font = Font.boldSystemFont(28);
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
    inningStack.addSpacer();
    const arrowText = inningStack.addText(game.linescore.isTopInning ? '▲' : '▼');
    arrowText.font = Font.regularSystemFont(10);
    arrowText.textColor = Color.lightGray();
    inningStack.addSpacer(4);
    const statusText = inningStack.addText(game.linescore.currentInning.toString());
    statusText.font = Font.mediumSystemFont(22);

    const basesStack = statusStack.addStack();
    basesStack.layoutHorizontally();
    basesStack.addSpacer();
    const bases = getBasesImage(game);
    const basesWidgetImage = basesStack.addImage(bases);
    basesWidgetImage.rightAlignImage();
    basesWidgetImage.imageSize = new Size(42, 42);

    const outsStack = statusStack.addStack();
    outsStack.layoutHorizontally();
    const outImages = getOutsImages(game);
    for (let index in outImages) {
      outsStack.addSpacer(index == 0 ? null : index === 2 ? 0 : 12);
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
    const playerNameText = nameCountStack.addText(game.teams.away.probablePitcher.fullName);
    playerNameText.font = Font.regularSystemFont(12);
    // playerNameText.minimumScaleFactor = 0.9;
    nameCountStack.addSpacer(4);
    const winnerStats = game.teams.away.probablePitcher.stats.filter(stat => stat.type.displayName === 'statsSingleSeason' && stat.group.displayName === 'pitching')[0].stats;
    const countText = nameCountStack.addText(`(${winnerStats.wins}-${winnerStats.losses})`);
    countText.font = Font.regularSystemFont(10);
    countText.textColor = Color.lightGray();
    nameCountStack.addSpacer();

    const pitcherTitleText = lowerStack.addText("Home Pitcher:")
    pitcherTitleText.font = Font.mediumSystemFont(11);
    pitcherTitleText.textColor = Color.lightGray();
    const namePitchesStack = lowerStack.addStack();
    namePitchesStack.layoutHorizontally();
    namePitchesStack.centerAlignContent();
    const pitcherNameText = namePitchesStack.addText(game.teams.home.probablePitcher.fullName);
    pitcherNameText.font = Font.regularSystemFont(12);
    // pitcherNameText.minimumScaleFactor = 0.9;
    namePitchesStack.addSpacer(4);
    const loserStats = game.teams.home.probablePitcher.stats.filter(stat => stat.type.displayName === 'statsSingleSeason' && stat.group.displayName === 'pitching')[0].stats;
    const pitchesThrownText = namePitchesStack.addText(`(${loserStats.wins}-${loserStats.losses})`);
    pitchesThrownText.font = Font.regularSystemFont(10);
    pitchesThrownText.textColor = Color.lightGray();
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
  awayStack.addSpacer();
  if (!isPreGame) {
    const awayRuns = awayStack.addText(`${game.linescore.teams.away.runs || 0}`);
    awayRuns.font = Font.title2();
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
  homeStack.addSpacer();
  if (!isPreGame) {
    const homeRuns = homeStack.addText(`${game.linescore.teams.home.runs || 0}`);
    homeRuns.font = Font.title2();
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

  const firstBasePath = new Path();
  firstBasePath.addLines([
    new Point(0, side / 2),
    new Point(baseHyp / 2, (side / 2) + (baseHyp / 2)),
    new Point(baseHyp, side / 2),
    new Point(baseHyp / 2, (side / 2) - (baseHyp / 2))
  ]);
  firstBasePath.closeSubpath();
  ctx.addPath(firstBasePath);
  ctx.strokePath();
  if (onFirst) {
    ctx.addPath(firstBasePath);
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

  const thirdBasePath = new Path();
  thirdBasePath.addLines([
    new Point((side / 2) + spaceX, side / 2),
    new Point(((side / 2) + spaceX) + (baseHyp / 2), (side / 2) + (baseHyp / 2)),
    new Point(((side / 2) + spaceX) + baseHyp, side / 2),
    new Point(((side / 2) + spaceX) + (baseHyp / 2), (side / 2) - (baseHyp / 2))
  ]);
  thirdBasePath.closeSubpath();
  ctx.addPath(thirdBasePath);
  ctx.strokePath();
  if (onThird) {
    ctx.addPath(thirdBasePath);
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
  const data = await fetchJson(`mlb_scores_${dateString}`, url);

  return data.dates[0].games;
}

async function fetchTeamLogo(team) {
  const req = new Request(`https://a.espncdn.com/i/teamlogos/mlb/500/${team.toLowerCase()}.png`);
  return req.loadImage();
}

async function fetchJson(key, url, headers) {
  const cached = await cache.read(key, 1);
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
      return cache.read(key, 1);
    } catch (error) {
      console.log(`Couldn't fetch ${url}`);
    }
  }
}
