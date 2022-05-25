import { data } from 'jquery';
import { UtilityService } from 'src/services/utilityservice';
import { UnitOfWorkService } from './../../services/unit-of-work.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/services/authenticationservice';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServicesDisplayName } from 'src/models/projectservice';
import { Observable, Observer } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AppAddCompanyPerson } from './component/add-company-person.component';
import { PersonRoles } from 'src/models/person';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-company-info',
    templateUrl: './company-info.component.html'
})
export class AppCompanyInfoComponent implements OnInit {
    companyStakeHolders: Array<any> = [];
    // companyStakeHolders1: Array<any> = [];
    // companyStakeHolders2: Array<any> = [];
    companyId: string = "726caf1b-1d94-41ae-842a-f0fcc23921ba";
    displayedColumns = ['name', 'email', 'mobile', 'role' , 'action'];
    dataSource: any;
    dataSource2: any;
    dataSource3: any;
    personId: string;
    Waiting = false;
    DialogTitle: string;
    personRole: number;
    selectedTab: number = 0;
    serviceId: string;
    ServiceProviderType: any;
    name: string;
    email: string;
    mobileNumber: string;
    editStatus: boolean;

    @ViewChild(MatPaginator, { static:true,}) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(public dialog: MatDialog, public formbuilder: FormBuilder,
        private _uow: UnitOfWorkService, public toastr: UtilityService) {
            this._uow.activatedRoute.queryParams.subscribe((params)=>{
                this.serviceId = params['serviceId'];
            })
    }
    ngOnInit(): void {
        // this.selectedTab = 0;
        this.tabChanged(0);
    }

    openDialog(): void {
        debugger;
        let setwidth = '50%';
        let setheight = '50%';
        if (this.selectedTab === 0) {
            this.DialogTitle = 'Customer Information';
            this.personRole = PersonRoles["Customer"];
        }
        else if (this.selectedTab === 1) {
            this.DialogTitle = 'Service Provider Information';
            this.personRole = PersonRoles["ServiceProvider"];
            setwidth = '55%';
            setheight = '55%';
        }
        else {
            this.DialogTitle = 'Employee Information';
            this.personRole = PersonRoles["Employee"];
        }
        let dialogRef = this.dialog.open(AppAddCompanyPerson, {
            width: setwidth,
            height: setheight,
            data: { Title: this.DialogTitle, personRole: this.personRole }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result == 'ok')
                console.log(this.selectedTab + 'refresh data now ')
        });
    }

    openEditDialog(element): void {
        debugger;
        if (this.selectedTab === 0) {
            this.personRole = PersonRoles["Customer"];
        }
        else if (this.selectedTab === 1) {
            this.personRole = PersonRoles["ServiceProvider"];
        }
        else {
            this.personRole = PersonRoles["Employee"];
        }
        this.personId = element.personID,
        this.name = element.name;
        this.email = element.email;
        this.mobileNumber = element.mobileNumber;
        this.editStatus = true;
        let dialogRef = this.dialog.open(AppAddCompanyPerson, {
            width: '50%',
            height: '50%',
            data: { personId: this.personId, name: this.name, email: this.email, mobileNumber: this.mobileNumber, personRole: this.personRole, editStatus: this.editStatus}
    }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'ok')
        {}
    });
    }

    getCompanyStakeholdersByRole(){
        debugger;
        this._uow.spinner.show();
        // this.personRole = this.dataSource.personRole;
        this._uow.api.Get('company',`CompanyServiceProviders/${this.companyId}/${this.personRole}`)
        .pipe(
            finalize(() => {
              this._uow.spinner.hide();
            })
        )
        .subscribe((res:any[])=>{
            this.companyStakeHolders = res;
            console.log(this.companyStakeHolders);
            this.dataSource = new MatTableDataSource(this.companyStakeHolders);
        }),
        (error)=>{
            console.log(error);
        }
    }

    getCompanyStakeholdersByRoleAndId(){
        this._uow.spinner.show();
        this._uow.api.Get('company',`CompanyServiceProviders/${this.companyId}/${this.personRole}/${this.personId}`)
        .pipe(
            finalize(() => {
              this._uow.spinner.hide();
            })
        )
        .subscribe((res:any[])=>{
            this.companyStakeHolders = res;
            console.log(this.companyStakeHolders);
            this.dataSource2 = new MatTableDataSource(this.companyStakeHolders);
        }),
        (error)=>{
            console.log(error);
        }
    }

    getCompanyServiceProviders(){
        this._uow.spinner.show();
        this._uow.api.Get('company',`CompanyServiceProviders/${this.companyId}/${this.serviceId}/${this.ServiceProviderType}`)
        .pipe(
            finalize(() => {
              this._uow.spinner.hide();
            })
        )
        .subscribe((res:any)=>{
            this.companyStakeHolders = res;
            console.log(this.companyStakeHolders);
            this.dataSource3 = new MatTableDataSource(this.companyStakeHolders);
        }),
        (error)=>{
            console.log(error);
        }
    }

    disabled(value) {
        alert(value)
    }
    applyFilterCustomers(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    applyFilterServiceProviders(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    applyFilterEmployees(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    tabChanged(event: any) {
        debugger;
        this.selectedTab = event.index;
        if(this.selectedTab == undefined){
            this.selectedTab = 0;
        }
        if(this.selectedTab == 0){
            this.personRole = PersonRoles["Customer"];
            this.getCompanyStakeholdersByRole();
            this.dataSource = new MatTableDataSource(this.companyStakeHolders);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }
        else if(this.selectedTab == 1){
            this.personRole = PersonRoles["ServiceProvider"];
            this.getCompanyStakeholdersByRole();
            this.dataSource = new MatTableDataSource(this.companyStakeHolders);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }
        else{
            this.personRole = PersonRoles["Employee"];
            this.getCompanyStakeholdersByRole();
            this.dataSource = new MatTableDataSource(this.companyStakeHolders);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }
    }
    

    

}