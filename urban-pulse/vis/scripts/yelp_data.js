let csvToJson = require('csvtojson');
const fs = require('fs');
var readline = require('node:readline');
const events = require('events');
process.env.TZ = 'UTC';
const fastcsv = require('fast-csv');

const IndianaPolisZips = new Set();
const bz = new Set();
const activity = {};
const businesses = [];
const checkins = [];
const IndianaPolisRequiredData = [];
const PhiladelphiaRequiredData = [];
const TucsonRequiredData = [];
const TampaRequiredData = [];
const NashvilleRequiredData = [];

const IndianaPolisBusinesses = [];
const PhiladelphiaBusinesses = [];
const TucsonBusinesses = [];
const TampaBusinesses = [];
const NashvilleBusinesses = [];

(async () => {
  try {
    let rl1 = readline.createInterface({
      input: fs.createReadStream('./yelp_academic_dataset_business.json'),
    });

    rl1
      .on('line', function (line) {
        const biz = JSON.parse(line);
        businesses.push(biz);
      })
      .on('error', function (e) {
        // something went wrong
        console.log(e);
      });

    await events.once(rl1, 'close');

    rl2 = readline.createInterface({
      input: fs.createReadStream('./yelp_academic_dataset_checkin.json'),
    });

    let count = 0;

    await rl2
      .on('line', function (line) {
        const checkin = JSON.parse(line);
        checkins.push(checkin);
      })
      .on('error', function (e) {
        // something went wrong
        console.log(e);
      });

    await events.once(rl2, 'close');

    const business_locs = [];

    businesses.forEach((business) => {
      // console.log({ p: business.postal_code });
      if (business.city === "Indianapolis") {
        IndianaPolisBusinesses.push(business);
        // console.log({ a: 'testing' });
        business_locs.push([
          business.latitude,
          business.longitude,
          business.business_id,
          business.name,
        ]);
        activity[business.business_id] = {
          city: business.city,
          lat: business.latitude,
          long: business.longitude,
          checkins: [],
        };
      }

      if (business.city === "Philadelphia") {
        PhiladelphiaBusinesses.push(business);
        // console.log({ a: 'testing' });
        business_locs.push([
          business.latitude,
          business.longitude,
          business.business_id,
          business.name,
        ]);
        activity[business.business_id] = {
          city: business.city,
          lat: business.latitude,
          long: business.longitude,
          checkins: [],
        };
      }

      if (business.city === "Tucson") {
        TucsonBusinesses.push(business);
        // console.log({ a: 'testing' });
        business_locs.push([
          business.latitude,
          business.longitude,
          business.business_id,
          business.name,
        ]);
        activity[business.business_id] = {
          city: business.city,
          lat: business.latitude,
          long: business.longitude,
          checkins: [],
        };
      }

      if (business.city === "Tampa") {
        TampaBusinesses.push(business);
        // console.log({ a: 'testing' });
        business_locs.push([
          business.latitude,
          business.longitude,
          business.business_id,
          business.name,
        ]);
        activity[business.business_id] = {
          city: business.city,
          lat: business.latitude,
          long: business.longitude,
          checkins: [],
        };
      }

      if (business.city === "Nashville") {
        NashvilleBusinesses.push(business);
        // console.log({ a: 'testing' });
        business_locs.push([
          business.latitude,
          business.longitude,
          business.business_id,
          business.name,
        ]);
        activity[business.business_id] = {
          city: business.city,
          lat: business.latitude,
          long: business.longitude,
          checkins: [],
        };
      }
    });

    ip_checkins = [];

    const dates = [];
    checkins.forEach((checkin) => {
      const checkindates = checkin.date.split(', ');
      dates.push(...checkindates);
      const businessDetails = activity[checkin.business_id];
      if (businessDetails) {
        const dates = checkin.date.split(', ');
        dates.forEach((date) => {
          const d = new Date(date);
          const epoch = d.getTime() / 1000.0;
          ip_checkins.push(date);
          activity[checkin.business_id].checkins.push(epoch);
        });
      }
    });

    Object.keys(activity).forEach((businessId) => {
      const details = activity[businessId];

      if (details.city === "Indianapolis") {
        details.checkins.forEach((checkin) => {
          IndianaPolisRequiredData.push([details.lat, details.long, checkin]);
        });
      }
      if (details.city === "Philadelphia") {
        details.checkins.forEach((checkin) => {
          PhiladelphiaRequiredData.push([details.lat, details.long, checkin]);
        });
      }
      if (details.city === "Tucson") {
        details.checkins.forEach((checkin) => {
          TucsonRequiredData.push([details.lat, details.long, checkin]);
        });
      }
      if (details.city === "Tampa") {
        details.checkins.forEach((checkin) => {
          TampaRequiredData.push([details.lat, details.long, checkin]);
        });
      }
      if (details.city === "Nashville") {
        details.checkins.forEach((checkin) => {
          NashvilleRequiredData.push([details.lat, details.long, checkin]);
        });
      }
    });

    // Assuming the 'activity' object has already been populated with data

    // Function to calculate median value of an array of numbers
    function median(values) {
      if (values.length === 0) return 0;
      values.sort(function (a, b) {
        return a - b;
      });
      var half = Math.floor(values.length / 2);
      if (values.length % 2) return values[half];
      return (values[half - 1] + values[half]) / 2.0;
    }

    // Function to calculate median check-ins per business in a city
    function medianCheckinsPerBusinessInCity(activity, city) {
      let checkins = [];
      for (const [business_id, value] of Object.entries(activity)) {
        if (value.city === city && value.checkins) {
          checkins = checkins.concat(value.checkins.length);
        }
      }
      console.log(`Total check-ins  in ${city}: ${checkins.reduce((partialSum, a) => partialSum + a, 0)}`);
      return median(checkins);
    }
    
    const cities = [
      "Philadelphia",
      "Indianapolis",
      "Tucson",
      "Tampa",
      "Nashville",
    ];
    cities.forEach(city => {
    const medianCheckins = medianCheckinsPerBusinessInCity(activity, city);
    console.log(`Median check-ins per business in ${city}: ${medianCheckins}`);
    })


    const countBusinessesByCity = (businesses) => {
      const result = {};
      for (const business of businesses) {
        const city = business.city;
        if (!result[city]) {
          result[city] = 0;
        }
        result[city]++;
      }
      // Convert result to an array of objects
      const resultArray = Object.entries(result).map(([city, count]) => ({ city, count }));
      // Sort the array by count in descending order
      resultArray.sort((a, b) => b.count - a.count);
      return resultArray.slice(0, 10); // Return the top 10 elements
    };

    const getCountPerSeason = (dates) => {
      const result = {
        Spring: 0,
        Summer: 0,
        Fall: 0,
        Winter: 0,
      };
      for (const date of dates) {
        const month = parseInt(date.substring(5, 7));
        switch (month) {
          case 3:
          case 4:
          case 5:
            result.Spring++;
            break;
          case 6:
          case 7:
          case 8:
            result.Summer++;
            break;
          case 9:
          case 10:
          case 11:
            result.Fall++;
            break;
          case 12:
          case 1:
          case 2:
            result.Winter++;
            break;
          default:
            break;
        }
      }
      return result;
    };

    const getCountPerHour = (events) => {
      const result = {};
      for (const event of events) {
        const hour = event.substring(11, 13);
        if (!result[hour]) {
          result[hour] = 0;
        }
        result[hour]++;
      }
      return result;
    };

    const getCountPerDayOfWeek = (events) => {
      const result = {};
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (const event of events) {
        const date = new Date(event);
        const dayOfWeek = date.getDay();
        const dayOfWeekString = daysOfWeek[dayOfWeek];
        if (!result[dayOfWeekString]) {
          result[dayOfWeekString] = 0;
        }
        result[dayOfWeekString]++;
      }
      return result;
    };

    console.log(getCountPerSeason(dates));
    console.log(getCountPerHour(dates));
    console.log(getCountPerDayOfWeek(dates));
    console.log(countBusinessesByCity(businesses));

    console.log(getCountPerSeason(ip_checkins));
    console.log(getCountPerHour(ip_checkins));
    console.log(getCountPerDayOfWeek(ip_checkins));

    // const ws = fs.createWriteStream('yelp_indianapolis.csv');
    // fastcsv.write(IndianaPolisRequiredData).pipe(ws);

    // const ws2 = fs.createWriteStream('yelp_businesses.csv');
    // fastcsv.write(business_locs).pipe(ws2);

    // const ws3 = fs.createWriteStream('indianapolis_businesses.csv');
    // fastcsv.write(IndianaPolisBusinesses).pipe(ws3);
    // ws3.end();


    // const ws4 = fs.createWriteStream("yelp_philadelphia.csv");
    // fastcsv.write(PhiladelphiaRequiredData).pipe(ws4);

    // const ws5 = fs.createWriteStream("yelp_tucson.csv");
    // fastcsv.write(TucsonRequiredData).pipe(ws5);

    // const ws6 = fs.createWriteStream("yelp_tampa.csv");
    // fastcsv.write(TampaRequiredData).pipe(ws6);

    // const ws7 = fs.createWriteStream("yelp_nashville.csv");
    // fastcsv.write(NashvilleRequiredData).pipe(ws7);

  } catch (err) {
    console.log(err);
    process.exit();
  }
})();

async function execute() {
  console.log({ NYActivity: activity });
}

// const businesses = require(filePath);
// const checkins = require(filePath);
