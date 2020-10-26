// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: book;

/**
 * WIDGET CONFIGURATION
 */
const LIGHT_BG_COLOUR = '#F1F1F1'
const DARK_BG_COLOUR = '#F1F1F1'
const INSTAPAPER_RSS_FEED_URL = ""

const data = await fetchData()
const widget = await createWidget(data)

// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
  await widget.presentSmall()
}
// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()

async function createWidget(data) {
  const gradientBg = [
    new Color(`${LIGHT_BG_COLOUR}D9`),
    new Color(`${DARK_BG_COLOUR}D9`),
  ]
  const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = gradientBg
  const bg = new Color(LIGHT_BG_COLOUR)
  const logoReq = await new Request('https://i.imgur.com/BKjVm7c.png')
  const logoImg = await logoReq.loadImage()

  const w = new ListWidget()
  w.useDefaultPadding()
  w.backgroundColor = bg
  w.backgroundGradient = gradient

  const itemFontSize = config.widgetFamily === 'large' ? 15 : 12

  const headerRow = w.addStack()
  headerRow.layoutHorizontally()

  const wimg = headerRow.addImage(logoImg)
  wimg.imageSize = new Size(18, 18)
  headerRow.addSpacer(10)

  const title =
    config.widgetFamily === 'small' ? 'Instapaper' : 'Instapaper: Unread'
  const headerTitle = headerRow.addText(title)
  headerTitle.font = Font.semiboldSystemFont(15)
  headerTitle.textColor = Color.black()
  headerTitle.textOpacity = 0.9

  w.addSpacer(10)

  const widgetCount = config.widgetFamily === 'large' ? 7 : 3
  data.forEach(({ title, link }, index) => {
    if (index > widgetCount) {
      return
    }
    const itemTitle = w.addText(title[0])
    itemTitle.font = Font.systemFont(itemFontSize)
    itemTitle.textColor = Color.black()
    itemTitle.textOpacity = 0.9
    itemTitle.url = link[0]

    if (index < widgetCount) {
      const spacing = config.widgetFamily === 'large' ? 8 : 6
      w.addSpacer(spacing)
    }
  })

  return w
}

async function fetch(url) {
  const req = new Request(url)
  const json = await req.loadJSON()
  return json
}

async function fetchData() {
  const unreadData = await fetch(
    `https://rsstojson.com/v1/api/?rss_url=${INSTAPAPER_RSS_FEED_URL}`
  )

  return unreadData.rss.channel[0].item
}

function addSymbol({
  symbol = 'applelogo',
  stack,
  color = Color.black(),
  size = 20,
}) {
  const _sym = SFSymbol.named(symbol)
  const wImg = stack.addImage(_sym.image)
  wImg.tintColor = color
  wImg.imageSize = new Size(size, size)
}
