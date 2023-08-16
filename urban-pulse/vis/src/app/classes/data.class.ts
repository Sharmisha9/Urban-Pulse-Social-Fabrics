import { Injectable } from "@angular/core";
import { Http, URLSearchParams } from "@angular/http";

// my imports
import { ParametersService } from "./params.class";
const fs = require("fs");

// import d3js
import * as d3 from "d3";

// observables
import { Observable } from "rxjs/Observable";

// RXJS Imports
import "rxjs/add/observable/of";
import "rxjs/add/observable/forkJoin";

import "rxjs/add/operator/share";
import "rxjs/add/operator/map";

// lodash
import * as _ from "lodash";

@Injectable()
export class DataService {
  // data
  private data: any = null;
  // observable
  private dataObs: Observable<any>;

  // scalars
  private scalars: any = null;
  // observable
  private scalarsObs: Observable<any>;

  // parameters
  private cities: any = ["map1", "map2"];
  private resolutions: any = ["HOUR", "DAYOFWEEK", "MONTH"];
  private resolutionsData: any = {
    ALL: {
      isMaxima: false,
      maxRank: 0,
      fnRank: 0,
      sigRank: 0,
      maxTime: [0],
      sigMaxTime: [0],
      fn: [0],
      scalars: [0],
    },
    HOUR: {
      isMaxima: true,
      maxRank: 0,
      fnRank: 0,
      sigRank: 0,
      maxTime: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      sigMaxTime: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      fn: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      scalars: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      x: 0,
      y: 0,
    },
    DAYOFWEEK: {
      isMaxima: false,
      maxRank: 0,
      fnRank: 0,
      sigRank: 0,
      maxTime: [0, 0, 0, 0, 0, 0, 0],
      sigMaxTime: [0, 0, 0, 0, 0, 0, 0],
      fn: [0, 0, 0, 0, 0, 0, 0],
      scalars: [0, 0, 0, 0, 0, 0, 0],
      x: 0,
      y: 0,
    },
    MONTH: {
      isMaxima: false,
      maxRank: 0,
      fnRank: 0,
      sigRank: 0,
      maxTime: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      sigMaxTime: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      fn: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      scalars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      x: 0,
      y: 0,
    },
  };

  private colorScales: any = {
    map1: d3
      .scaleLinear()
      .range(<any[]>["#dcdc3d", "#e0e052", "#e4e468"])
      .domain([0, 1]),
    map2: d3
      .scaleLinear()
      .range(<any[]>["#deebf7", "#9ecae1", "#3182bd"])
      .domain([0, 1]),
  };

  private colors: any = {
    map1: "orange",
    map2: "blue",
  };
  businesses: any;
  businessesObs: Observable<any>;

  // private business_coords = [];

  constructor(private http: Http, private paramsService: ParametersService) {}

  getParam(paramId: string) {
    let params = new URLSearchParams(window.location.search.substring(1));
    let someParam = params.get(paramId);
    return someParam;
  }

  getPaths() {
    // data1
    let param1 = this.getParam("data1");
    // let param2 = this.getParam('data2');

    if (!param1) {
      alert("Data parameters not supplied");
      return;
    }

    let param1tk = param1.split(/[;,]+/);
    // let param2tk = param2.split(/[;,]+/);

    if (param1tk.length < 2) {
      alert("Data parameters not supplied");
      return;
    }

    let paths = {
      map1: param1tk[0] + "/" + param1tk[1],
      // map2: param2tk[0] + '/' + param2tk[1],
      group1: param1tk[2],
      // group2: param2tk[2],
    };

    return paths;
  }

  resetScalarsObservable() {
    this.scalarsObs = null;
    this.scalars = null;
  }

  getMultipleScalars() {
    // this scope
    var that = this;

    // data paths
    var paths = this.getPaths();

    // current resolution
    var cRes = this.paramsService.getTimeRes();
    var cTime = this.paramsService.getTimeSel();
    var group1 = paths["group1"] === "none" ? "" : "-" + paths["group1"];
    // var group2 = paths['group2'] === 'none' ? '' : '-' + paths['group2'];

    // get the observables
    if (this.scalars) {
      return Observable.of(this.scalars);
    } else if (this.scalarsObs) {
      return this.scalarsObs;
    } else {
      console.log("Http Call: Getting scalar data.");

      // observables
      var obs1 = this.http
        .get(
          "./" + paths["map1"] + "_" + cRes + "_" + cTime + group1 + ".scalars"
        )
        .map((res: any) => res.text());
      // var obs2 = this.http
      //   .get('./' + paths['map2'] + '_' + cRes + '_' + cTime + group2 + '.scalars')
      //   .map((res: any) => res.text());

      this.scalarsObs = Observable.forkJoin(obs1)
        .map((response) => {
          that.scalars = [];

          for (let id = 0; id < response.length; id++) {
            var textByLine = response[id].split("\n");
            var json = {};
            json["gridSize"] = textByLine[0]
              .split(",")
              .map(function (x: string) {
                return parseInt(x);
              });
            json["latLng"] = textByLine[1].split(",").map(function (x: string) {
              return parseFloat(x);
            });
            json["values"] = textByLine.slice(3).map(function (x: string) {
              return parseFloat(x);
            });
            json["range"] = [d3.min(json["values"]), d3.max(json["values"])];

            that.scalars.push(json);
          }

          return this.scalars;
        })
        .share();

      console.log({ s: this.scalarsObs });

      return this.scalarsObs;
    }
  }

  resetFeaturesObservable() {
    this.dataObs = null;
    this.data = null;
    this.businessesObs = null;
    this.businesses = null;
  }

  getCoordinatesWithinRadius(businesses: any, center: any, radius: any) {
    const EARTH_RADIUS = 6371e3; // in meters
    const radians = (degrees: any) => degrees * (Math.PI / 180);

    const [centerLat, centerLong] = center;
    const result = [];

    for (const biz of businesses) {
      const lat = biz.latitude;
      const long = biz.longitude;
      const latDiff = radians(lat - centerLat);
      const longDiff = radians(long - centerLong);

      const a =
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(radians(lat)) *
          Math.cos(radians(centerLat)) *
          Math.sin(longDiff / 2) *
          Math.sin(longDiff / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = EARTH_RADIUS * c;

      if (distance <= radius) {
        result.push(biz);
      }
    }

    return result;
  }

  getBusinessess() {
    var that = this;

    var paths = this.getPaths();
    const mapPath = paths["map1"];
    let citySel = "Indianapolis";

    if (mapPath.includes("indiana_polis")) {
      citySel = "Indianapolis";
    } else if (mapPath.includes("philadelphia")) {
      citySel = "Philadelphia";
    } else if (mapPath.includes("tampa")) {
      citySel = "Tampa";
    } else if (mapPath.includes("tucson")) {
      citySel = "Tucson";
    } else if (mapPath.includes("nashville")) {
      citySel = "Nashville";
    }

    console.log({ citySel });

    var group1 = paths["group1"] === "none" ? "" : "-" + paths["group1"];
    const filtersData = this.paramsService.getModelData();
    const selectedFilters = filtersData.filters.filter((x: any) => x.selected);
    const filters = selectedFilters.map((x: any) => x.name);
    const { poiTypeSelected, poiSortSelected, count, poiSort } = filtersData;
    const sortType = poiSort.indexOf(poiSortSelected);

    if (this.businesses) {
      return Observable.of(this.data);
    }

    if (this.businessesObs) {
      return this.businessesObs;
    }

    const map = {};

    const sortArr = (arr: any, column: any) => {
      return arr.sort((a: any, b: any) => {
        if (sortType === 0) {
          return b[column] - a[column];
        }
        if (sortType === 1) {
          return b[column] / b.num_reviews - a[column] / a.num_reviews;
        }
        if (sortType === 2) {
          return (
            b[column] / b.num_relationship_words -
            a[column] / a.num_relationship_words
          );
        }
        return b.rank - a.rank;
      });
    };

    var obs2 = this.http
      .get("../../data/yelp_final.json")
      .map((res: any) => res.json());
    var obs1 = this.http
      .get("./" + paths["map1"] + group1 + "-features.json")
      .map((res: any) => res.json());

    this.businessesObs = Observable.forkJoin(obs2, obs1)
      .map(([businesses, response]) => {
        var index = 0;
        that.data = [];

        businesses = businesses.filter((x: any) => {
          return x.city === citySel
        })

        // responses iteration
        var feat = response.features;
        feat.forEach((f: any) => {
          f.cityId = that.cities[0];

          // for each resolution
          that.resolutions.forEach(function (tRes: string) {
            // skip unavailable resolutions
            if (!(tRes in f.resolutions)) return;

            // rank computation
            var fnRank = f.resolutions[tRes].fnRank;
            var maxRank = f.resolutions[tRes].maxRank;
            var sigRank = f.resolutions[tRes].sigRank;

            // x and y values for the scatter plot
            var x = Math.sqrt(
              maxRank * maxRank + fnRank * fnRank + sigRank * sigRank
            );
            var y = f.rank;

            // add plot coords
            f.resolutions[tRes].x = x;
            f.resolutions[tRes].y = y;
          });

          // console.log({ f });
          f.latLng.forEach((latLng: any) => {
            let buses = this.getCoordinatesWithinRadius(businesses, latLng, 200);
            // console.log({ index, buses });
            buses.forEach((buz: any) => {
              buz.id = index;
              buz.cityId = "map1";
              buz.gridIndex = f.gridIndex;
              buz.latLng = f.latLng;
              buz.rank = f.rank;
              buz.resolutions = { ...that.resolutionsData, ...f.resolutions };
              // console.log({ res: JSON.stringify(f.resolutions) });
            });
          });
          index++;
        });

        if (poiTypeSelected !== "All") {
          if (poiTypeSelected === "Food & Restaurants") {
            businesses = businesses.filter((b: any) => {
              return (
                b.categories.includes("Food") ||
                b.categories.includes("Restaurants")
              );
            });
          } else {
            businesses = businesses.filter((b: any) => {
              return b.categories.includes(poiTypeSelected);
            });
          }
        }

        let family_arr = [];
        let rom_arr = [];
        let pro_arr = [];
        let friend_arr = [];

        if (filters.includes("Family")) {
          family_arr = sortArr(businesses, "family");
          family_arr = family_arr.slice(0, count);
          family_arr = family_arr.map((i: any) => ({ ...i, type: "family" }));
        }
        if (filters.includes("Romantic")) {
          rom_arr = sortArr(businesses, "romantic");
          rom_arr = rom_arr.slice(0, count);
          rom_arr = rom_arr.map((i: any) => ({ ...i, type: "romantic" }));
        }
        if (filters.includes("Professional")) {
          pro_arr = sortArr(businesses, "professional");
          pro_arr = pro_arr.slice(0, count);
          pro_arr = pro_arr.map((i: any) => ({ ...i, type: "professional" }));
        }
        if (filters.includes("Friendship")) {
          friend_arr = sortArr(businesses, "friendship");
          friend_arr = friend_arr.slice(0, count);
          friend_arr = friend_arr.map((i: any) => ({
            ...i,
            type: "friendship",
          }));
        }

        let final_arr = family_arr.concat(rom_arr, pro_arr, friend_arr);

        that.businesses = final_arr.map((biz: any, index: number) => {
          const latLng = [biz.latitude, biz.longitude];
          return {
            cityId: "map1",
            gridIndex: 0,
            rank: 0,
            resolutions: this.resolutionsData,
            x: 0,
            y: 0,
            ...biz,
            latLng,
            id: biz.id,
            name: biz.name,
            family_confidence: biz.family_confidence,
            romantic_confidence: biz.romantic_confidence,
            professional_confidence: biz.professional_confidence,
            friendship_confidence: biz.friendship_confidence,
            type: biz.type,
            categories: biz.categories,
          };
        });
        // responses iteration

        this.businesses = this.businesses.sort(
          (x: any, y: any) => y.rank - x.rank
        );

        // console.log({ a: this.businesses });
        // return the response
        return this.businesses;
      })
      .share();

    this.data = this.businesses;

    return this.businessesObs;
  }

  getMultipleFeatures() {
    // this scope
    var that = this;
    // data paths
    var paths = this.getPaths();
    // groupBy
    var group1 = paths["group1"] === "none" ? "" : "-" + paths["group1"];
    // var group2 = paths['group2'] === 'none' ? '' : '-' + paths['group2'];

    // get the observables
    if (this.data) {
      return Observable.of(this.data);
    } else if (this.dataObs) {
      return this.dataObs;
    } else {
      console.log("Http Call: Getting feature data.");

      // observables
      var obs1 = this.http
        .get("./" + paths["map1"] + group1 + "-features.json")
        .map((res: any) => res.json());
      // var obs2 = this.http.get('./' + paths['map2'] + group2 + '-features.json').map((res: any) => res.json());

      this.dataObs = Observable.forkJoin(obs1)
        .map(([response]) => {
          // resets the index
          var index = 0;
          that.data = [];

          // responses iteration
          var feat = response.features;

          feat.forEach(function (f: any) {
            // feature id
            f.id = index;
            // index update
            index += 1;

            // city id
            f.cityId = that.cities[0];

            // for each resolution
            that.resolutions.forEach(function (tRes: string) {
              // skip unavailable resolutions
              if (!(tRes in f.resolutions)) return;

              // rank computation
              var fnRank = f.resolutions[tRes].fnRank;
              var maxRank = f.resolutions[tRes].maxRank;
              var sigRank = f.resolutions[tRes].sigRank;

              // x and y values for the scatter plot
              var x = Math.sqrt(
                maxRank * maxRank + fnRank * fnRank + sigRank * sigRank
              );
              var y = f.rank;

              // add plot coords
              f.resolutions[tRes].x = x;
              f.resolutions[tRes].y = y;
            });

            that.data.push(f);
          });

          // sort features
          this.data = this.data.sort(function (x: any, y: any) {
            return d3.descending(x.rank, y.rank);
          });

          // return the response
          return this.data;
        })
        .share();

      return this.dataObs;
    }
  }

  getData() {
    return this.data;
  }

  getBusinesses() {
    return this.businesses;
  }

  getResolution() {
    return this.resolutions;
  }

  getCities() {
    return this.cities;
  }

  getColor(cityId: string) {
    return this.colors[cityId];
  }

  getColorScale(cityId: string) {
    return this.colorScales[cityId];
  }
}
