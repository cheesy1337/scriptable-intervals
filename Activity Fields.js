// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bicycle;
function loadFile (path) {
  try { var fm = FileManager.iCloud() } catch (e) { var fm = FileManager.local() }
  let code = fm.readString(fm.joinPath(fm.documentsDirectory(), path))
  if (code == null) throw new Error(`Module '${path}' not found.`)
  return Function(`${code}; return exports`)()
}
const credentials = loadFile('Intervals.js');

// Parameter 0 = Power Data, 1 = Show Heart Rate Data, 2 = Training Data
let param = parseInt(args.widgetParameter);
param = (isNaN(param) ? 2 : param);

// Calculate the date one week ago
let date = new Date();
date.setDate(date.getDate() - 7);
let oldestDate = date.toISOString().split('T')[0];

// API URL with dynamic oldest parameter
const apiUrl = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activities?oldest=${oldestDate}`;

const authHeader = "Basic " + btoa("API_KEY" + ":" + credentials.apiPassword);

// Function to fetch the last activity
async function getLastActivity() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response[0];
}

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;

  // Dynamic representation based on the presence of hours
  return hours > 0 
    ? `${hours}h${minutes}m${secs}s`
    : `${minutes}m${secs}s`;
}

async function createWidget() {
  let activity = await getLastActivity();
  
  let titles = new Array("⚡️ Average", "⚙️ Efficiency", "⚡️ Max", "💚 P/HR Z2", "⚡️ Weighted", "💪 Load");
  let data = new Array(`${activity.icu_average_watts} W`, `${activity.icu_efficiency_factor.toFixed(2)}`, `${activity.icu_pm_p_max} W`, `${(activity.icu_power_hr_z2).toFixed(2)}`, `${activity.icu_weighted_avg_watts} W`, `${activity.icu_training_load} TSS`);
  
  if(param === 1) {
    titles = new Array("❤️ Average", "🎯 Cadence", "❤️‍🔥 Max", "🚀 IF", "❤️‍🩹 HRRc", "🔨 Work");
    let hrrc = "-";
    if(activity.icu_hrr != null) hrrc = activity.icu_hrr.hrr.toString();
    data = new Array(`${activity.average_heartrate} bpm`, `${activity.average_cadence.toFixed(0)} rpm`, `${activity.max_heartrate} bpm`, `${(activity.icu_intensity).toFixed(0)} %`, `${hrrc}`, `${(activity.icu_joules / 1000).toFixed(0)} kJ`);
  }
  
  if(param === 2) {
    titles = new Array("⏳ Elapsed", "🗺️ Distance", "⏱️ Moving", "🏔️ Elevation", "🌬️ Coasting", "🚴 Speed");
    data = new Array(`${formatTime(activity.elapsed_time)}`, `${(activity.distance / 1000).toFixed(2)} km`, `${formatTime(activity.moving_time)}`, `${(activity.total_elevation_gain ?? 0).toFixed(0)} m`, `${formatTime(activity.coasting_time)}`, `${(activity.distance / activity.moving_time * 3.6).toFixed(1)} km/h`);
  }
  
  // Create widget
  let widget = new ListWidget();

  // Add row with date and time
  let dateStack = widget.addStack();
  dateStack.bottomAlignContent();
  let dateText = dateStack.addText(`📅 ${activity.start_date_local.split('T')[0]}`);
  dateText.font = Font.systemFont(10);
  dateStack.addSpacer();
  let header = dateStack.addText(activity.name);
  header.font = Font.boldSystemFont(15);
  dateStack.addSpacer();
  let timeText = dateStack.addText(`🕒 ${activity.start_date_local.split('T')[1].slice(0, 5)}`);
  timeText.font = Font.systemFont(10);
  widget.addSpacer(1);

  // Function to create stacks
  function createStack(parent, title, data) {
    let stack = parent.addStack();
    stack.size = new Size(86, 40);
    stack.layoutVertically();
    stack.setPadding(4, 4, 4, 4);
    stack.backgroundColor = new Color("#f0f0f0");
    stack.cornerRadius = 8;
    stack.borderWidth = 3;
    stack.borderColor = new Color("#d0d0d0");

    stack.addSpacer();

    let smallText = stack.addText(title);
    smallText.font = Font.systemFont(10);
    smallText.textColor = Color.darkGray();
    smallText.centerAlignText();
    stack.addSpacer(4);

    let largeText = stack.addText(data);
    largeText.font = Font.boldSystemFont(12);
    largeText.textColor = Color.black();
    largeText.centerAlignText();

    stack.addSpacer();
    return stack;
  }

  // Create container for columns
  let containerStack = widget.addStack();
  containerStack.layoutHorizontally();

  // Create three columns and set double width
  for (let i = 0; i < 3; i++) {
    let colStack = containerStack.addStack();
    colStack.layoutVertically();
    colStack.addSpacer();

    // Create two rows in each column
    for (let j = 0; j < 2; j++) {
      createStack(colStack, titles[i * 2 + j], data[i * 2 + j]);
      if (j < 1) colStack.addSpacer(8);
    }

    if (i < 2) containerStack.addSpacer(16); // Increase spacing between columns
  }

  widget.addSpacer(16);

  return widget;
}

// Execute the function
let widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();
