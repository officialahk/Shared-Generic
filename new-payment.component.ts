import { UnitOfWorkService } from './../../../services/unit-of-work.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/services/authenticationservice';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServicesDisplayName } from 'src/models/projectservice';
import { Observable, Observer } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { Person, PersonRoles } from 'src/models/person';


import { Project } from 'src/models/project';
import { UtilityService } from 'src/services/utilityservice';
import { finalize, map, startWith } from 'rxjs/operators';
import { PaymentDetailBill, PaymentSubjects } from 'src/models/payment';
import { AppAddCompanyPerson } from 'src/app/company/component/add-company-person.component';
import { MaterialType } from 'src/models/materialtype';
import { LourKeyValuePair } from 'src/models/lour';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-new-payment',
    templateUrl: './new-payment.component.html'
})
export class AppNewPaymentComponent implements OnInit {
    @Input() PaymentSubject: string;
    @Input() ProjectId: string;
    @Input() personId: string;
    paymentSubject: number;
    Waiting = false;
    companyId: string = "726caf1b-1d94-41ae-842a-f0fcc23921ba"; // temp

    filteredOptions: Observable<Project[]>;
    serviceProviderFilteredOptions: Observable<Person[]>;
    materialTypeFilteredOptions: Observable<MaterialType[]>;
    materialUnitsFilteredOptions: Observable<LourKeyValuePair[]>;
    PaymentForm: FormGroup;
    DialogTitle: string;
    PaymentDetailsBill: PaymentDetailBill[];
    companyServiceProviders: Array<any> = [];
    enabledServices: Array<any> = [];
    fileData: File = null;
    theFile:any = null;
    previewUrl:any = null;
    fileUploadProgress: string = null;
    uploadedFilePath: string = null;
    companyAccount: Array<any> = [];
    serviceId: string;
    serviceProviderType: any;

    ServiceID: number;
    constructor(private router:Router, public dialog: MatDialog, private _uow: UnitOfWorkService, private domSanitizer: DomSanitizer,
        public formbuilder: FormBuilder, public utilityservice: UtilityService) {
        this.PaymentDetailsBill = new Array();
    }

    ngOnInit(): void {
        this.PaymentForm = this.formbuilder.group({
            serviceId: [''],
            paidTo: [''],
            paidBy: [''],
            paymentMethod: [],
            paymentType: [],
            paymentSubject: [],
            companyAccountId:[''],
            amount: [0],
            transactionReferenceno: [''],
            projectMediaId:[],
            PaymentStatus:[],
            creationDate:[],
            settlementDate:[],
            materialPayments:[''],
            materialTypeId: [''],
            unit: [''],
            materialCount: [],
            matamount:[]
       })

       if(this.PaymentSubject == '1'){
         this.serviceProviderType = 0;
       }
       else{
         this.serviceProviderType = 1;
       }



        // this.filteredOptions = this.PaymentForm.controls['ProjectID'].valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(value => typeof value === 'string' ? value : value.ProjectID),
        //         map(name => name ? this._filter(name) : this.utilityservice.TempProjects.slice())
        //     );
        // this.serviceProviderFilteredOptions = this.PaymentForm.controls['ServiceProviderID'].valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(value => typeof value === 'string' ? value : value.PersonID),
        //         map(name => name ? this._serviceProviderfilter(name) : this.utilityservice.TempPersons.slice())
        //     );

        // this.materialTypeFilteredOptions = this.PaymentForm.controls['MaterialTypeID'].valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(value => typeof value === 'string' ? value : value.Item),
        //         map(name => name ? this._materialTypesfilter(name) : this.utilityservice.TempMaterialTypes.slice())
        //     );
        // this.materialUnitsFilteredOptions = this.PaymentForm.controls['Unit'].valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(value => typeof value === 'string' ? value : value.Value),
        //         map(name => name ? this._materialUnitsfilter(name) : this.utilityservice.MaterialUnits.slice())
        //     );
        this.setPaymentSubjectValue();
        this.getEnabledServices();
        this.getCompanyAccounts();

    }

    setPaymentSubjectValue(){
      if(this.PaymentSubject == '0'){
        this.paymentSubject = 0;
      }
      else if(this.PaymentSubject == '1'){
        this.paymentSubject = 1;
      }
      else{
        this.paymentSubject = 2;
      }
    }

    gettingProviders(val){
      this.serviceId = this.PaymentForm.controls.serviceId.value;
      this.getProjectServiceProviders();
    }

    getProjectServiceProviders(){
        debugger;
        this._uow.spinner.show();
        this._uow.api.Get('project',`ProjectServiceProviders/${this.companyId}/${this.ProjectId}/${this.serviceId}/${this.serviceProviderType}`)
        .pipe(
            finalize(() => {
              this._uow.spinner.hide();
            })
        )
        .subscribe((res:any[])=>{
            this.companyServiceProviders = res;
            console.log(this.companyServiceProviders);
        }),
        (error)=>{
            console.log(error);
        }
    }

    onChange(paymentmethod){
      debugger;
      if(paymentmethod.Value == "Cash"){
        this.PaymentForm.controls.paymentMethod.setValue(0);
        this.PaymentForm.controls.paymentType.setValue(0);
      }
      else if(paymentmethod.Value == "Cheque"){
        this.PaymentForm.controls.paymentMethod.setValue(1);
        this.PaymentForm.controls.paymentType.setValue(1);
      }
      else if(paymentmethod.Value == "BankTransfer"){
        this.PaymentForm.controls.paymentMethod.setValue(2);
        this.PaymentForm.controls.paymentType.setValue(2);
      }
      else{
        this.PaymentForm.controls.paymentMethod.setValue(3);
        this.PaymentForm.controls.paymentType.setValue(3);
      }

    }

    // getEnabledServices(){
    //     this._uow.spinner.show();
    //     this._uow.api.Get('company',`CompanyEnabledServices/${this.companyId}`)
    //     .pipe(
    //       finalize(() => {
    //         this._uow.spinner.hide();
    //       })
    //     )
    //     .subscribe((res:any)=>{
    //       this.enabledServices = res;
    //       console.log(this.enabledServices);
    //     }),
    //     (error)=>{
    //       console.log(error);
    //     }
    //   }

      getCompanyAccounts(){
        this._uow.spinner.show();
        this._uow.api.Get('company',`CompanyAccount/${this.companyId}`)
        .pipe(
          finalize(() => {
            this._uow.spinner.hide();
          })
        )
        .subscribe((res:any[])=>{
          this.companyAccount = res;
          // this.displayedColumns = Object.keys(this.companyAccount[0]);
          console.log(this.companyAccount);
        }),
        (error)=>{
          console.log(error);
        }
      }

      getEnabledServices(){
        debugger;
        this._uow.spinner.show();
        this._uow.api.Get('project',`ProjectServices/${this.companyId}/${this.ProjectId}`)
        .pipe(
          finalize(() => {
            this._uow.spinner.hide();
          })
        )
        .subscribe((res:any)=>{
          this.enabledServices = res;
          console.log(this.enabledServices);
        }),
        (error)=>{
          console.log(error);
        }
      }

    displayFnMaterialUnits(keyvaluepair?: LourKeyValuePair): string | undefined {
        return keyvaluepair ? keyvaluepair.Value : undefined;
    }
    displayFnMaterialTypes(material?: MaterialType): string | undefined {
        return material ? material.Item : undefined;
    }
    // displayFn(project?: Project): string | undefined {
    //     return project ? project.projectName : undefined;
    // }
    displayFnServiceProvider(serviceprovider?: Person): string | undefined {
        return serviceprovider ? serviceprovider.Name : undefined;
    }
    private _materialUnitsfilter(name: string): LourKeyValuePair[] {
        const filterValue = name.toLowerCase();

        return this.utilityservice.MaterialUnits.filter(option => option.Value.toLowerCase().includes(filterValue));
    }
    private _materialTypesfilter(name: string): MaterialType[] {
        const filterValue = name.toLowerCase();

        return this.utilityservice.TempMaterialTypes.filter(option => option.Item.toLowerCase().includes(filterValue));
    }
    private _serviceProviderfilter(name: string): Person[] {
        const filterValue = name.toLowerCase();

        return this.utilityservice.TempPersons.filter(option => option.Name.toLowerCase().includes(filterValue));
    }
    // private _filter(name: string): Project[] {
    //     const filterValue = name.toLowerCase();

    //     return this.utilityservice.TempProjects.filter(option => option.projectName.toLowerCase().includes(filterValue));
    // }
    disabled(value) {
        alert(value)
    }
    FileChange(fileInputEvent: any): void {
      debugger;
        const file = fileInputEvent.target.files[0];
        const imgUrl = window.URL.createObjectURL(file);
        // const sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(imgUrl);
        // var reader = new FileReader();
        // const url = reader.readAsDataURL(file)
        this._uow.spinner.show();
        var obj = {
            projectId: this.ProjectId,
            mediaStorageURL: imgUrl,
            mediaTypeId: 0,
            isShared: true,
            creationDate: new Date()
        }
        this._uow.api.HttpPost('project',`ProjectMedia/${this.companyId}`, obj)
        .pipe(
            finalize(()=> {
                this._uow.spinner.hide();
            })
        )
        .subscribe((res:any)=> {
            console.log(res);
            this.utilityservice.showSuccessToast('File Saved');
            // this.PaymentForm.controls.projectMediaId.setValue(res);
            this.PaymentForm.controls.projectMediaId.setValue(res.projectMediaId);
        }),
        (error)=> {
            console.log(error);
        }
        console.log(fileInputEvent.target.files[0]);
        fileInputEvent.stopPropagation();
    }

    onSubmit() {
      debugger;
      this._uow.spinner.show();
      if(this.PaymentForm.value.projectMediaId == null){
        this.PaymentForm.controls.projectMediaId.setValue("00000000-0000-0000-0000-000000000000");
      }
      else{
        this.PaymentForm.controls.projectMediaId.value;
      }
      var obj = {
        companyId: this.companyId,
        projectId: this.ProjectId,
        paidTo: this.PaymentForm.controls.companyAccountId.value,
        paidBy: this.personId,
        paymentMethod: this.PaymentForm.controls.paymentMethod.value,
        paymentType: this.PaymentForm.controls.paymentMethod.value,
        paymentSubject: this.paymentSubject,
        companyAccountId: this.PaymentForm.controls.companyAccountId.value,
        amount: this.PaymentForm.controls.amount.value,
        transactionReferenceno: this.PaymentForm.controls.transactionReferenceno.value.toString(),
        projectMediaId: this.PaymentForm.controls.projectMediaId.value,
        paymentStatus: 0,
        creationDate: new Date(),
        settlementDate: new Date(),
        materialPayments: this.PaymentDetailsBill
      }
      this._uow.api.HttpPost('project', `Payment/${this.companyId}`, obj)
      .pipe(
        finalize(()=> {
          this._uow.spinner.hide();
        })
      )
      .subscribe((res:any) => {
        console.log(res);
        this.utilityservice.showSuccessToast('Payment Saved Successfully');
        this.PaymentForm.reset();
        this.router.navigate(['project/']);

      }),
      (error)=>{
        console.log(error);
        this.utilityservice.showDangerToast('Payment not saved.')
      }
    }

    OnMakePaymentClick() { }

    openServiceProviderDialog(event: any): void {
        this.DialogTitle = 'Service Provider Information';

        let dialogRef = this.dialog.open(AppAddCompanyPerson, {
            width: '75%',
            height: '75%',
            data: { Title: this.DialogTitle, personRole: PersonRoles.ServiceProvider }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result == 'ok')
                console.log('refresh data now ')
        });
        event.stopPropagation();
    }
    // onMaterialChange(val){
    //   this.PaymentForm.controls.
    // }

    OnAddItemClick() {
        this.PaymentDetailsBill.push(
            {
                // SrNo: this.PaymentDetailsBill.length + 1,
                materialTypeId: this.PaymentForm.controls['materialTypeId'].value,
                unit: this.PaymentForm.controls['unit'].value,
                materialCount: this.PaymentForm.controls['materialCount'].value,
                amount: this.PaymentForm.controls['matamount'].value
            }

        );
        console.log(this.PaymentDetailsBill);

    }

}
