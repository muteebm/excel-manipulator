import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

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

  constructor(private modalService: NgbModal) {}

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
    console.log($event)
    console.log("CALLED")
		const files = $event.target.files[0];
    console.log(files)
			const reader = new FileReader();
			// reader.readAsBinaryString(file);
      
			reader.onload = () => {
				const csv: any = reader.result;
        var workbook = XLSX.read(csv, {type: 'binary'});
        console.log(workbook)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        console.log(workbook.Sheets[workbook.SheetNames[0]])
        
        this.sheetOptions = workbook.SheetNames;
        this.sheet = XLSX.utils.sheet_to_json(sheet)
        console.log(this.sheet)
        this.sheetKeys = Object.keys(this.sheet[0])
        var sheet_name_list = workbook.SheetNames;
let columnHeaders = [];
for (var sheetIndex = 0; sheetIndex < sheet_name_list.length; sheetIndex++) {
    var worksheet = workbook.Sheets[sheet_name_list[sheetIndex]];
    for (let key in worksheet) {
        let regEx = new RegExp("^\(\\w\)\(1\){1}$");
        if (regEx.test(key) == true) {
            columnHeaders.push(worksheet[key].v);
        }
    }
    console.log(columnHeaders)
}
			};

      reader.readAsBinaryString(files);
      

			reader.onerror = function () {
				console.log('error is occured while reading file!');
			};
	}
}
