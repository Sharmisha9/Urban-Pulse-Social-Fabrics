import { Injectable, EventEmitter, NgZone } from "@angular/core";

// import d3js
import * as d3 from "d3";

// lodash
import * as _ from "lodash";

@Injectable()
export class ParametersService {
  public timeRes: string = "HOUR";
  public filtersRes: any = [
    { name: "Family", selected: true },
    { name: "Romantic", selected: true },
    { name: "Professional", selected: false },
    { name: "Friendship", selected: false },
  ];
  public modelData: any = {
    filters: this.filtersRes,
    poiTypes: [
      "All",
      "Active Life",
      "Arts & Entertainment",
      "Beauty & Spas",
      "Food & Restaurants",
      "Nightlife",
      "Shopping",
    ],
    poiSort: [
      "# relationship word occurrences",
      "# relationship words per 1000 reviews",
      "% relationship words of selected type",
    ],
    poiTypeSelected: "All",
    poiSortSelected: "# relationship word occurrences",
    count: 100
  };
  private timeResChange: EventEmitter<any> = new EventEmitter();
  private filterResChange: EventEmitter<any> = new EventEmitter();

  public showScalarFunction: boolean = true;
  private showScalarFunctionChange: EventEmitter<any> = new EventEmitter();

  public showPulses: boolean = true;
  private showPulsesChange: EventEmitter<any> = new EventEmitter();

  public timeMax: number = 24;
  public timeSel: number = 1;
  private timeSelChange: EventEmitter<any> = new EventEmitter();

  public searchId: string = "none";
  private searchIdChange: EventEmitter<any> = new EventEmitter();

  public isSearch: boolean = false;

  constructor(private zone: NgZone) {}

  getTimeRes() {
    return this.timeRes;
  }

  getFiltersRes() {
    return this.filtersRes;
  }

  getModelData() {
    return this.modelData;
  }

  getTimeResChangeEmitter() {
    return this.timeResChange;
  }

  getFilterResChangeEmitter() {
    return this.filterResChange;
  }

  emitFilterResChange() {
    console.log({ filtersRes: this.filtersRes });
    this.filterResChange.emit(this.filtersRes);
  }

  emitTimeResChanged() {
    switch (this.timeRes) {
      case "HOUR":
        this.timeMax = 24;
        break;
      case "DAYOFWEEK":
        this.timeMax = 7;
        break;
      case "MONTH":
        this.timeMax = 12;
        break;
    }

    this.timeResChange.emit(this.timeRes);
  }

  setFiltersRes(filters: any) {
    this.filtersRes = filters;
  }

  setModelData(data: any) {
    this.modelData = data;
  }

  //--------

  getShowScalarFunction() {
    return this.showScalarFunction;
  }

  getShowScalarFunctionEmitter() {
    return this.showScalarFunctionChange;
  }

  emitShowScalarFunctionChanged() {
    this.showScalarFunctionChange.emit(this.showScalarFunction);
  }

  // -------

  getShowPulses() {
    return this.showPulses;
  }

  getShowPulsesEmitter() {
    return this.showPulsesChange;
  }

  emitShowPulsesChanged() {
    this.showPulsesChange.emit(this.showPulses);
  }

  //--------

  getTimeSel() {
    return this.timeSel;
  }

  getTimeSelEmitter() {
    return this.timeSelChange;
  }

  emitTimeSelChanged() {
    this.timeSelChange.emit(this.timeSel);
  }

  //--------

  getSearchId() {
    return this.searchId;
  }

  getSearchIdEmitter() {
    return this.searchIdChange;
  }

  emitSearchIdChanged() {
    this.searchIdChange.emit(this.searchId);
  }

  getIsSearch() {
    return this.isSearch;
  }
}
