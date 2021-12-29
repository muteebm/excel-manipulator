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
  dataSets = [];
  @ViewChild('content') contentModal;

  constructor(private modalService: NgbModal) {
    this.workbook = XLSX.utils.book_new();
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
    console.log(files)
			const reader = new FileReader();
			// reader.readAsBinaryString(file);
      
			reader.onload = () => {
				const csv: any = reader.result;
        var workbook = XLSX.read(csv, {type: 'binary'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        
        this.sheetOptions = workbook.SheetNames;
        this.sheet = XLSX.utils.sheet_to_json(sheet, {header: 1})
        console.log(this.sheet)
        this.dataSets.push({
          dataSetName: files.name,
          jsonSheet: this.sheet,
          sheetExportLocation: '',
          selectedSheet: '',
          colStart: '',
          rowStart: 0,
          startImportRow: 1,
          endImportRow: 0,
          importCols: [],
          cols: []
        });
        this.selectedIndex = this.dataSets.length -1;
    this.readExcel($event)

        this.addWorksheettoWorkbook()
        this.sheetKeys = Object.keys(this.sheet[0])
        // var sheet_name_list = workbook.SheetNames;
        // let columnHeaders = [];
        // for (var sheetIndex = 0; sheetIndex < sheet_name_list.length; sheetIndex++) {
        //     var worksheet = workbook.Sheets[sheet_name_list[sheetIndex]];
        //     for (let key in worksheet) {
        //         let regEx = new RegExp("^\(\\w\)\(1\){1}$");
        //         if (regEx.test(key) == true) {
        //             columnHeaders.push(worksheet[key].v);
        //         }
        //     }
        //     console.log(columnHeaders)
        // }
        this.open(this.contentModal)
			};

      reader.readAsBinaryString(files);
      

			reader.onerror = function () {
				console.log('error is occured while reading file!');
			};
	}

  readExcel(event) {
    const workbook = new Workbook();
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const arryBuffer = new Response(target.files[0]).arrayBuffer();
    arryBuffer.then(function (data) {
      workbook.xlsx.load(data)
        .then(function () {

          // play with workbook and worksheet now
          console.log(workbook);
          console.log( workbook.worksheets);
          const worksheet = workbook.getWorksheet(1);
          console.log(worksheet)
          // this.dataSets[this.selectedIndex].endImportRow = worksheet.rowCount;
          console.log('rowCount: ', worksheet.rowCount);
          console.table(worksheet.columns)
          const col = worksheet.getColumn('A');
          col.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
            // ...
            console.log(cell.value, rowNumber);
          });
        });
    });
  }

  addWorksheettoWorkbook(): any {
    const tempSheet = XLSX.utils.json_to_sheet(this.dataSets[this.selectedIndex].jsonSheet, {skipHeader: true});
    XLSX.utils.book_append_sheet(this.workbook, tempSheet, this.dataSets[this.selectedIndex].sheetExportLocation);
    console.log(this.workbook);
  }

  exportWorkbook(): any {
    XLSX.writeFile(this.workbook, `${this.exportWorkbookName}.xlsx`)
  }
}
