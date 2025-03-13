# scriptable-intervals

## Setup
Copy these js files in the iOS Cloud Scriptable Folder. Important: Change your User ID and API Key in the "Intervals.js" file. You find these in the settings page of intervals.icu. 
The "Intervals.js" file should look something like this (Note: This are of course fake credentials):

![credentials](https://github.com/user-attachments/assets/20a48cb2-a248-4702-a377-6e6433638eb2)

## Activity Fields Big
This Widget shows a bunch of data (in sum 18 fields) of the last activity. 

![IMG_1604](https://github.com/user-attachments/assets/7352951e-e8f5-4534-a043-97497f111a18)

Additionaly if you did the route during the last year more than once, it will check your position on this route. It will show a medal, if you are 1., 2. or 3. place on this route. 

![IMG_1618](https://github.com/user-attachments/assets/1196e6ca-e486-42a5-939f-66b41a4a0eae)


## Activity Fields
This is the same as Activity Fields Big, but it shows only 6 Fields in a Medium Widget. 

![Activity Fields](https://github.com/user-attachments/assets/93a951f4-11fa-402d-b466-eb7d7a096e9f)

### Parameters
If you set the argument (Parameter) of the widget to "1" you get HR Data. If you use "0" you get Power Data. If you leave it blank, you got the times and speed and so on as shown in the screenshot. 


## Activity Histogram
This shows the power or hr histogram of the last activity. 

![Activity Histogram](https://github.com/user-attachments/assets/7a7618a3-760b-4042-b98c-9e4d5ff99874)

### Parameters
If you set the argument (Parameter) of the widget to "2" you get HR Data. If you use "1" or leave it blank you get Power Data. 
You can change the variable minBucket in the script to show only buckets bigger than this value (for example to exclude 0W Buckets).


## Activity TiZ
This shows the Power or HR Time in Zones of the last activity. 

![Activity TiZ](https://github.com/user-attachments/assets/093c3bb7-8e4a-496b-82c1-727fb2fd813e)

### Parameters
If you set the argument (Parameter) of the widget to "2" you get HR Time in Zones. If you use "1" or leave it blank you get Power Time in Zones. 

## Fitness Chart
This shows the fitness chart. The Form curve is coloured depending on your todays value. 

![IMG_1609](https://github.com/user-attachments/assets/64e6c6c6-ec60-4e9c-a488-01d136ed587f)

## Power Curve
This shows the power duration curve of the last activity in dark purple, and the power duration curve of the last 42 days. 

![IMG_1610](https://github.com/user-attachments/assets/fd956edc-d553-4b55-b8a3-629f18c2928a)


## Totals To Date
This shows the Totals from the beginning of the current year until today. 

![IMG_1611](https://github.com/user-attachments/assets/0911363c-60e0-40bf-89e2-2ea0d2926a4e)

### Parameters
If you set the Parameter to "1", it will show the Totals from the beginning of last year until the same date as today of last year. If you set it to "2" it will be the year before and so on. 

## Totals Weekly
This shows the Totals of the current week. You can show distance, load, moving time and total work.  

![IMG_1612](https://github.com/user-attachments/assets/da2e50f2-4bf0-48ff-8af7-7bf11ff1e6f5)

### Parameters
If you set the Parameter to "1", it will show the Weekly distance.
If you set the Parameter to "2", it will show the Weekly Load.
If you set the Parameter to "3", it will show the Weekly Work.
If you set the Parameter to "4", it will show the Weekly Moving Time.
If you add a second parameter (e.g. "2,1") it will show the the Load of the week before. 

## Totals Year
This shows the Totals from last year. 

![IMG_1613](https://github.com/user-attachments/assets/38399574-3a49-4d29-81ca-300fd077926a)

### Parameters
If you set the Parameter to "1", it will show the Totals from the year before last year, and so on. 
