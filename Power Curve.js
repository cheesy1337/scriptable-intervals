// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
function loadFile (path) {
  try { var fm = FileManager.iCloud() } catch (e) { var fm = FileManager.local() }
  let code = fm.readString(fm.joinPath(fm.documentsDirectory(), path))
  if (code == null) throw new Error(`Module '${path}' not found.`)
  return Function(`${code}; return exports`)()
}
const credentials = loadFile('Intervals.js');

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const formattedToday = `${year}-${month}-${day}`;

const pastDate = new Date();
pastDate.setDate(today.getDate() - 42);
const pastYear = pastDate.getFullYear();
const pastMonth = String(pastDate.getMonth() + 1).padStart(2, "0");
const pastDay = String(pastDate.getDate()).padStart(2, "0");
const formattedPastDate = `${pastYear}-${pastMonth}-${pastDay}`;

// Function to fetch power curve data from the API
const getPowerCurveData = async () => {
  const url = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activity-power-curves{ext}?oldest=${formattedPastDate}&newest=${formattedToday}`;
  const req = await new Request(url);
  const auth = btoa(`API_KEY:${credentials.apiPassword}`);
  req.headers = {
    Authorization: `Basic ${auth}`,
  };
  const res = await req.loadJSON();
  
  return res; // Return the fetched data
};

// Function to generate a power curve chart
const getPowerCurveChart = async () => {
  const data = await getPowerCurveData();
  
  // Labels for the X-axis durations
  const desiredLabels = [5, 15, 30, 60, 120, 210, 300, 450, 600, 900, 1200, 1800, 2700, 3600, 5400, 7200, 10800];

  // Filter durations and map them for the X-axis
  const filterDurations = data.secs.filter(sec => desiredLabels.includes(sec));
  const durations = filterDurations.map(sec => sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m`);

  // Data for the last activity (dark purple)
  const lastActivityPowers = filterDurations.map(sec => {
    const index = data.secs.indexOf(sec);
    return data.curves[0].watts[index] || 0; // First curve corresponds to the last activity
  }).filter(value => value > 0);

  // Maximum values for the last 42 days (light purple)
  const maxPowers = filterDurations.map(sec => {
    const index = data.secs.indexOf(sec);
    return Math.max(...data.curves.map(curve => curve.watts[index] || 0));
  }).filter(value => value > 0);

  // Chart configuration
  const chartConfig = {
    type: 'line',
    data: {
      labels: durations, // X-axis labels
      datasets: [
        {
          label: 'Last Activity',
          data: lastActivityPowers, 
          fill: false,
          borderColor: "#6633CC",   // Dark purple
          lineTension: 0.2,
          pointRadius: 1,
          borderWidth: 2,
        },
        {
          label: 'Last 42 Days',
          data: maxPowers, 
          fill: false,
          borderColor: "#9370DB",   // Light purple
          lineTension: 0.2,
          pointRadius: 1,
          borderWidth: 2,
        },
      ],
    },
    options: {
      legend: {
        labels: {
          fontSize: 10,
        },
      },
      scales: {
        xAxes: [
          {
            position: 'bottom',
            scaleLabel: {
              display: true,
              labelString: "Duration",
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Power (W)",
            },
          },
        ],
      },
    },
  };

  const url = "https://quickchart.io/chart";

  const request = new Request(url);
  request.method = "POST";
  request.headers = { "Content-Type": "application/json" };
  request.body = JSON.stringify({
    width: 350,
    height: 350,
    chart: chartConfig,
  });

  try {
    const imageData = await request.loadImage();

    const widget = new ListWidget();

    const stack = widget.addStack();
    stack.layoutVertically();

    const imageWidget = stack.addImage(imageData);

    imageWidget.imageSize = new Size(320, 320);
    imageWidget.centerAlignImage();

    Script.setWidget(widget);
    widget.presentLarge();
  } catch (error) {
    console.error(error);
  }
};

// Execute the function to generate the chart
getPowerCurveChart();
