// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bicycle;
// Importiere die Bibliotheken

// Füge deine Basic Authorization Anmeldedaten hier ein
const userID = "userid";        // TODO
const apiPassword = "apikey";   // TODO 

let param = parseInt(args.widgetParameter);
param = (isNaN(param) ? 0 : param);

// Calculate the date for the beginning of this year
let now = new Date();
let startOfThisYear = new Date(now.getFullYear() - param, 0, 1).toISOString().split('T')[0];
let endDate = new Date(now.getFullYear() - param, now.getMonth(), now.getDate() + 1).toISOString().split('T')[0];

// API URL with dynamic oldest parameter for the beginning of this year
const apiUrl = `https://intervals.icu/api/v1/athlete/${userID}/activities?oldest=${startOfThisYear}&newest=${endDate}`;

const authHeader = "Basic " + btoa("API_KEY" + ":" + apiPassword);

// Function to fetch all activities for the current year
async function getActivitiesFromThisYear() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };

  let response = await req.loadJSON();
  return response; // Returns an array of all activities for this year
}

// Function to create the widget
async function createWidget() {
  let allActivities = await getActivitiesFromThisYear();
  let activities = allActivities.filter(activity =>
    ["Ride", "VirtualRide", "GravelRide"].includes(activity.type));
  let activity = activities[0];

  let widget = new ListWidget();

  if (activity) {
    // Activity year title
    let name = widget.addText(`To Date ${now.getFullYear() - param}`);
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
    col1.addText(`⏱️ ${Math.floor(moving_time / 3600)} h`).font = Font.systemFont(12); // Total duration
    col1.addSpacer(5);
    const commutes = activities.filter(activity => activity.commute === true).reduce((a, b) => a + b.distance, 0);
    col1.addText(`🧳 ${(commutes / 1000).toFixed(0)} km`).font = Font.systemFont(12); // Commute distance
    dataStack.addSpacer();

    // Second column
    let col2 = dataStack.addStack();
    col2.layoutVertically();
    col2.addSpacer(24);
    const uniqueDays = new Set(
      activities.map(activity => activity.start_date_local.split("T")[0])
    );

    // Count the number of unique active days
    const dayCount = uniqueDays.size;
    col2.addText(`Active Days ${dayCount}`).font = Font.systemFont(12);
    col2.addSpacer(5);

    // Calculate the maximum streak
    const sortedDays = Array.from(
      new Set(activities.map(activity => activity.start_date_local.split("T")[0]))
    ).sort();
    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currentDate = new Date(sortedDays[i]);

      // Check if the days are consecutive
      if ((currentDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1; // Reset streak
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak); // Finalize max streak
    col2.addText(`Max Streak ${maxStreak}`).font = Font.systemFont(12); // Maximum streak
    col2.addSpacer(5);

    const centuries = activities.filter(activity => activity.distance >= 100000);
    const centuryCount = centuries.length;
    col2.addText(`Centuries ${centuryCount}`).font = Font.systemFont(12); // Rides over 100 km
    col2.addSpacer(5);

    const commutesCount = activities.filter(activity => activity.commute === true).length;
    col2.addText(`Commutes ${commutesCount}`).font = Font.systemFont(12); // Number of commutes
    dataStack.addSpacer();

    // Third column
    let col3 = dataStack.addStack();
    col3.layoutVertically();
    col3.addText("Max").font = Font.systemFont(14);
    col3.addSpacer(7);
    const maxDistance = activities.reduce((max, activity) => Math.max(max, activity.distance), 0);
    col3.addText(`↔️ ${Math.round(maxDistance / 1000)} km`).font = Font.systemFont(12); // Max distance
    col3.addSpacer(5);
    const maxElevation = activities.reduce((max, activity) => Math.max(max, activity.total_elevation_gain), 0);
    col3.addText(`⛰️ ${Math.round(maxElevation)} m`).font = Font.systemFont(12); // Max elevation gain
    col3.addSpacer(5);
    const maxTime = activities.reduce((max, activity) => Math.max(max, activity.moving_time), 0);
    col3.addText(`🕒 ${(maxTime / 3600).toFixed(1)} h`).font = Font.systemFont(12); // Max training time

    widget.addSpacer(10);
  } else {
    widget.addText("No activity found.");
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
