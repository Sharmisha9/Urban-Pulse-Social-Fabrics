let csvToJson = require("csvtojson");
const fs = require("fs");
process.env.TZ = "America/Indianapolis";
const fastcsv = require("fast-csv");

let lbX = 300;
let lbY = 300;
let rtX = -300;
let rtY = -300;

(async () => {
  try {
    const indianapolis = await csvToJson({
      noheader: true,
      output: "line",
    }).fromFile("./yelp_indianapolis.csv");

    const philadelphia = await csvToJson({
      noheader: true,
      output: "line",
    }).fromFile("./yelp_philadelphia.csv");

    const tampa = await csvToJson({
      noheader: true,
      output: "line",
    }).fromFile("./yelp_tampa.csv");

    const tucson = await csvToJson({
      noheader: true,
      output: "line",
    }).fromFile("./yelp_tucson.csv");

    const nashville = await csvToJson({
      noheader: true,
      output: "line",
    }).fromFile("./yelp_nashville.csv");

    // let allCoordsata = await csvToJson({
    //   noheader: true,
    //   output: 'line',
    // }).fromFile('./yelp_final.csv');

    // allCoordsata = allCoordsata.map(x => {
    //   return x.split(',')
    // });

    // var file = fs.createWriteStream('../src/data/yelp_geo_coords.json');
    // file.write(JSON.stringify(allCoordsata));

    // let set = new Set();

    indianapolis.forEach((line) => {
      let str = line.split(",");
      let x = Number(str[0]);
      let y = Number(str[1]);

      lbX = Math.min(x, lbX);
      lbY = Math.min(y, lbY);
      rtX = Math.max(x, rtX);
      rtY = Math.max(y, rtY);
    });

    console.log("========= INDIANAPOLIS ==========");
    console.log({ lbX, lbY, rtX, rtY });
    console.log("========= INDIANAPOLIS ==========");

    lbX = 300;
    lbY = 300;
    rtX = -300;
    rtY = -300;

    philadelphia.forEach((line) => {
      let str = line.split(",");
      let x = Number(str[0]);
      let y = Number(str[1]);

      lbX = Math.min(x, lbX);
      lbY = Math.min(y, lbY);
      rtX = Math.max(x, rtX);
      rtY = Math.max(y, rtY);
      // set.add(`${str[0]},${str[1]}`);
    });

    console.log("========= philadelphia ==========");
    console.log({ lbX, lbY, rtX, rtY });
    console.log("========= philadelphia ==========");

    lbX = 300;
    lbY = 300;
    rtX = -300;
    rtY = -300;

    tucson.forEach((line) => {
      let str = line.split(",");
      let x = Number(str[0]);
      let y = Number(str[1]);

      lbX = Math.min(x, lbX);
      lbY = Math.min(y, lbY);
      rtX = Math.max(x, rtX);
      rtY = Math.max(y, rtY);
      // set.add(`${str[0]},${str[1]}`);
    });

    console.log("========= tucson ==========");
    console.log({ lbX, lbY, rtX, rtY });
    console.log("========= tucson ==========");

    lbX = 300;
    lbY = 300;
    rtX = -300;
    rtY = -300;

    tampa.forEach((line) => {
      let str = line.split(",");
      let x = Number(str[0]);
      let y = Number(str[1]);

      lbX = Math.min(x, lbX);
      lbY = Math.min(y, lbY);
      rtX = Math.max(x, rtX);
      rtY = Math.max(y, rtY);
      // set.add(`${str[0]},${str[1]}`);
    });

    console.log("========= tampa ==========");
    console.log({ lbX, lbY, rtX, rtY });
    console.log("========= tampa ==========");

    lbX = 300;
    lbY = 300;
    rtX = -300;
    rtY = -300;

    nashville.forEach((line) => {
      let str = line.split(",");
      let x = Number(str[0]);
      let y = Number(str[1]);

      lbX = Math.min(x, lbX);
      lbY = Math.min(y, lbY);
      rtX = Math.max(x, rtX);
      rtY = Math.max(y, rtY);
      // set.add(`${str[0]},${str[1]}`);
    });

    console.log("========= nashville ==========");
    console.log({ lbX, lbY, rtX, rtY });
    console.log("========= nashville ==========");
  } catch (err) {
    console.log(err);
    process.exit();
  }
})();
