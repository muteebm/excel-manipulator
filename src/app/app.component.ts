import { Component, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'excel-manipulator';
  sheetOptions = [];
  sheet: unknown[];
  sheetKeys: string[];
  exportWorkbookName = 'Testing';
  selectedIndex: number;
  workbook: any;
  columns = [];
  colHeaders = {};
  dataSets = [];
  jsonArray;
  @ViewChild('content') contentModal;
  customStyles = {
    iconColor: "",
    iconSize: "",
    tagBackground: "",
    tagFont: "",
    tagSize: "",
    tagBox_minHeight: "",
    tagBox_Height: "",
    tagBox_Width: "",
    tagBox_Background: "",
    tag_InputColor: "",
    tag_InputPlaceholder: "Col Codes",
    tagBox_fontColor: ""
  };
  typeaheads:any = [
  ]
  allowedTags =  [];

  constructor(private modalService: NgbModal) {
    this.workbook = XLSX.utils.book_new();
  }

  tagInput(tags: any) {
    this.dataSets[this.selectedIndex].importCols = tags;
    tags.forEach((tag: any) => {
      this.dataSets[this.selectedIndex].colHeaders[tag] = 'Default';
    })
    console.log(this.dataSets[this.selectedIndex].colHeaders);
  }

  onFail(msg){
    alert(msg);
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size: 'lg'}).result.then((result) => {
    }, (reason) => {
    });
  }

  ngOnInit() {
    const ws: XLSX.WorkSheet = {};
    console.log(ws)
  }

  uploadListener($event: any): void {
		const files = $event.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const csv: any = reader.result;
        var workbook = XLSX.read(csv, {type: 'binary'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]] 

        this.sheet = XLSX.utils.sheet_to_json(sheet, {header: 1})
        this.dataSets.push({
          dataSetName: files.name,
          jsonSheet: this.sheet,
          excelJsWorkbook: '',
          sheetExportLocation: '',
          selectedSheet: '',
          colStart: 'A',
          rowStart: 0,
          startImportRow: 0,
          endImportRow: 0,
          sheetOptions: workbook.SheetNames, 
          importCols: [],
          isExportWithHeaders: false,
          colHeaders: {},
          cols: {}
        });
        this.selectedIndex = this.dataSets.length? this.dataSets.length - 1 : 0;
        this.readExcel($event)
        this.sheetKeys = Object.keys(this.sheet[0])
			};

      reader.readAsBinaryString(files);
      

			reader.onerror = function () {
				console.log('error is occured while reading file!');
			};
	}

  getColHeaderKeys(): any {
    return Object.keys(this.dataSets[this.selectedIndex].colHeaders);
  }

  mainFileListener($event: any): void {
    const files = $event.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const csv: any = reader.result;
        this.workbook = XLSX.read(csv, {type: 'binary'});
        this.exportWorkbookName = files.name.split('.')[0];
      }
      reader.readAsBinaryString(files);
  }

  readExcel(event) {
    var that = this;
    const workbook = new Workbook();
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const arryBuffer = new Response(target.files[0]).arrayBuffer();
    arryBuffer.then(function (data) {
      workbook.xlsx.load(data)
        .then( () => {
          that.dataSets[that.selectedIndex].excelJsWorkbook = workbook;
          // console.log(this.dataSets)
          // this.dataSets[this.selectedIndex].excelJsWorkbook = workbook;
          // play with workbook and worksheet now
          const worksheet = workbook.getWorksheet(1);
          that.dataSets[that.selectedIndex].endImportRow = worksheet.rowCount;
          // console.log('rowCount: ', worksheet.rowCount);
          // console.table(worksheet.columns)
          // const col = worksheet.getColumn('A');
          // col.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
          //   // ...
          //   console.log(cell.value, rowNumber);
          // });
        });
    });
    
  }

  trimColAndRows(workbook, sheet, datasetIndex): any {
    const worksheet = workbook.getWorksheet(sheet);
    var that = this;
    // this.dataSets[this.selectedIndex].endImportRow = worksheet.rowCount;
    worksheet.rowCount
    that.jsonArray = new Array(worksheet.rowCount);
    let index=0;
    this.dataSets[datasetIndex].importCols.forEach((col: any) => {
      const colVal = worksheet.getColumn(col.toUpperCase());
      colVal.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
        // ...
        if(that.jsonArray[rowNumber-1]?.length) {
          that.jsonArray[rowNumber-1].push(cell.value);
        }
        else {
          that.jsonArray[rowNumber-1] = [cell.value];
        }
      });
      index += 1;
    })
    that.jsonArray = that.jsonArray.slice(this.dataSets[datasetIndex].startImportRow, this.dataSets[datasetIndex].endImportRow+1)
    this.dataSets[datasetIndex].jsonSheet = that.jsonArray;
    this.modalService.dismissAll();
  }

  parseJsonForHeaders(sheet: any, index: any) {
    let headerArray = [];
    for(const col in this.dataSets[index].colHeaders) {
      headerArray.push(this.dataSets[index].colHeaders[col]);
    }
    sheet.unshift(headerArray);
    return sheet;
  }

  addWorksheettoWorkbook(sheet: any, index): any {
    if(this.dataSets[index].isExportWithHeaders) {
      sheet = this.parseJsonForHeaders(sheet, index);
    }
    const tempSheet = XLSX.utils.json_to_sheet(sheet, {skipHeader: true});
    XLSX.utils.book_append_sheet(this.workbook, tempSheet, this.dataSets[index].sheetExportLocation);
    this.modalService.dismissAll();
  }

  exportWorkbook(): any {
    console.log(this.dataSets)
    this.dataSets.forEach((val: any, index: any ) => {
      this.addWorksheettoWorkbook(val.jsonSheet, index)
    })
     XLSX.writeFile(this.workbook, `${this.exportWorkbookName}.xlsx`)
  }
}
