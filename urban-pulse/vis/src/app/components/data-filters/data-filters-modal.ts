import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "data-filters-modal",
  templateUrl: "data-filters-modal.html",
})
export class DataFiltersModal {
  filters: any;
  poiSelected: any;
  sortSelected: any;

  constructor(
    public dialogRef: MatDialogRef<DataFiltersModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.poiSelected = data.poiTypes[0];
    this.sortSelected = data.poiSort[0];
  }

  updateAllComplete() {

  };

  onNoClick(): void {
    this.dialogRef.close();
  }
}
