// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bicycle;

/******************************************************
 * Configuration
 *****************************************************/

enableFilter = false;   // Enable this to "true" to filter only certain activity types
filterActivities = new Array("Ride", "VirtualRide", "GravelRide");  // activity types

/******************************************************
 * 
 *****************************************************/

function loadFile (path) {
  try { var fm = FileManager.iCloud() } catch (e) { var fm = FileManager.local() }
  let code = fm.readString(fm.joinPath(fm.documentsDirectory(), path))
  if (code == null) throw new Error(`Module '${path}' not found.`)
  return Function(`${code}; return exports`)()
}
const credentials = loadFile('Intervals.js');

let param = parseInt(args.widgetParameter);
param = (isNaN(param) ? 1 : param);

// Calculate the date for the beginning of the previous year
let now = new Date();
let startOfLastYear = new Date(now.getFullYear() - param, 0, 1).toISOString().split('T')[0];
let endOfHalfYear = new Date(now.getFullYear() - param, 5, 31).toISOString().split('T')[0];
let startOfHalfYear = new Date(now.getFullYear() - param, 6, 1).toISOString().split('T')[0];
let endOfLastYear = new Date(now.getFullYear() - param, 11, 31).toISOString().split('T')[0];

// API URL with dynamic "oldest" and "newest" parameters
const apiUrl = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activities?oldest=${startOfLastYear}&newest=${endOfHalfYear}`;
const apiUrl2 = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activities?oldest=${startOfHalfYear}&newest=${endOfLastYear}`;

const authHeader = "Basic " + btoa("API_KEY" + ":" + credentials.apiPassword);

// Function to fetch all activities from the first half of the previous year
async function getActivitiesFromLastYear() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response; // Returns an array of all activities
}

// Function to fetch all activities from the second half of the previous year
async function getActivitiesFromLastYear2() {
  let req = new Request(apiUrl2);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response; // Returns an array of all activities
}

// Function to create the widget
async function createWidget() {
  let activities1 = await getActivitiesFromLastYear();
  if(enableFilter)
  {
    activities1 = activities1.filter(activity =>
      filterActivities.includes(activity.type));
  }
  activities1 = activities1.map(activity => ({
      distance: activity.distance,
      total_elevation_gain: activity.total_elevation_gain,
      start_date_local: activity.start_date_local,
      moving_time: activity.moving_time,
      commute: activity.commute,
      total_work: activity.icu_joules 
    }));

  let activities2 = await getActivitiesFromLastYear2();
  if(enableFilter)
  {
    activities2 = activities2.filter(activity =>
      filterActivities.includes(activity.type));
  }
  activities2 = activities2.map(activity => ({
      distance: activity.distance,
      total_elevation_gain: activity.total_elevation_gain,
      start_date_local: activity.start_date_local,
      moving_time: activity.moving_time,
      commute: activity.commute,
      total_work: activity.icu_joules
    }));

  let activities = activities1.concat(activities2);

  // count active days (uniqueDays.size)
  const uniqueDays = new Set(
    activities.map(activity => activity.start_date_local.split("T")[0])
   );

  // Calculate Max. and Current Streak
		const sortedDays = Array.from(
      new Set(activities.map(activity => activity.start_date_local.split("T")[0]))
    ).sort();
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currentDate = new Date(sortedDays[i]);

      // Überprüfen, ob die Tage aufeinanderfolgend sind
      if ((currentDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1; // Streak zurücksetzen
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);// Finalize max streak

  let widget = new ListWidget();
  {
    // Title of the widget
    let name = widget.addText(`Total ${now.getFullYear() - param}`);
    name.font = Font.boldSystemFont(20);
    name.centerAlignText();

    widget.addSpacer(10);

    // Arrange data fields in three columns
    let dataStack = widget.addStack();
    dataStack.layoutHorizontally();

    // First column
    let col1 = dataStack.addStack();
    col1.layoutVertically();
    col1.addText("Totals").font = Font.systemFont(14);
    col1.addSpacer(7);
    const distance = activities.reduce((a, b) => a + b.distance, 0);
    col1.addText(`↔️ ${(distance / 1000).toFixed(0)} km`).font = Font.systemFont(12); // Total distance
    col1.addSpacer(5);
    const total_elevation_gain = activities.reduce((a, b) => a + b.total_elevation_gain, 0);
    col1.addText(`⛰️ ${total_elevation_gain.toFixed(0)} m`).font = Font.systemFont(12); // Total elevation gain
    col1.addSpacer(5);
    const moving_time = activities.reduce((a, b) => a + b.moving_time, 0);
    col1.addText(`⏱️ ${Math.floor(moving_time / 3600)} h`).font = Font.systemFont(12); // Total moving time
    col1.addSpacer(5);
    const commutes = activities.filter(activity => activity.commute === true).reduce((a, b) => a + b.distance, 0);
    col1.addText(`🧳 ${(commutes / 1000).toFixed(0)} km`).font = Font.systemFont(12); // Commute distance
    dataStack.addSpacer();

    // Second column
    let col2 = dataStack.addStack();
    col2.layoutVertically();
    col2.addSpacer(24);

    // Count the number of unique active days

		col2.addText(`Active Days ${uniqueDays.size}`).font = Font.systemFont(12); // Active days
    col2.addSpacer(5);

    col2.addText(`Max Streak ${maxStreak}`).font = Font.systemFont(12); // Maximum streak
    col2.addSpacer(5);

    const centuries = activities.filter(activity => activity.distance >= 100000);
    const centuryCount = centuries.length;
    col2.addText(`Centuries ${centuryCount}`).font = Font.systemFont(12); // Rides over 100 km
    col2.addSpacer(5);

    const commutesCount = activities.filter(activity => activity.commute === true).length;
    col2.addText(`Commutes ${commutesCount}`).font = Font.systemFont(12); // Number of commutes
    col2.addSpacer(5);

    dataStack.addSpacer();

    // Third column
    let col3 = dataStack.addStack();
    col3.layoutVertically();
    col3.addText("Max").font = Font.systemFont(14);
    col3.addSpacer(7);
    const maxDistance = activities.reduce((max, activity) => Math.max(max, activity.distance), 0);
    col3.addText(`↔️ ${Math.round(maxDistance/1000)} km`).font = Font.systemFont(12); // Max distance
    col3.addSpacer(5);
    const maxElevation = activities.reduce((max, activity) => Math.max(max, activity.total_elevation_gain), 0);
    col3.addText(`⛰️ ${Math.round(maxElevation)} m`).font = Font.systemFont(12); // Max elevation gain
    col3.addSpacer(5);
    const maxTime = activities.reduce((max, activity) => Math.max(max, activity.moving_time), 0);
    col3.addText(`🕒 ${(maxTime / 3600).toFixed(1)} h`).font = Font.systemFont(12); // Max moving time

    widget.addSpacer(10);
    let bottom = widget.addStack();

  } 

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
