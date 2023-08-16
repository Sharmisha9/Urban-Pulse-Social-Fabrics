// angular components
import { Component, NgZone } from '@angular/core';
import { DataService } from '../../classes/data.class';
import { ParametersService } from '../../classes/params.class';
import { MatDialog } from '@angular/material';
import { DataFiltersModal } from '../data-filters/data-filters-modal';

@Component({
  selector: "urban-pulse",
  templateUrl: "./main.component.html",
})
export class MainComponent {
  // app title
  appTitle: string = "Urban Pulse (Web Version)";
  modalData: any;

  constructor(
    private dataService: DataService,
    private paramsService: ParametersService,
    private zone: NgZone,
    public dialog: MatDialog
  ) {
    this.paramsService.getSearchIdEmitter().subscribe((searchId: any) => {
      // update dom
      this.zone.run(() => null);
    });
    this.modalData = this.paramsService.getModelData();
  }

  openDialog() {
    let dialogRef = this.dialog.open(DataFiltersModal, {
      height: "560px",
      width: "600px",
      data: this.modalData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed", result);
      this.dataService.resetFeaturesObservable()
      this.paramsService.setModelData(result)
      this.paramsService.emitFilterResChange();

      // this.animal = result;
    });
  }

  emitSearchIdChanged() {
    // emit signal
    this.paramsService.emitSearchIdChanged();
  }

  emitTimeResChanged() {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeResChanged();
  }

  emitTimeSelChanged() {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeSelChanged();
  }
}
