import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController, NavParams } from '@ionic/angular';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {
@ViewChild (SuperTabs) superTabs: SuperTabs;
page1 : any = CekSaldoPage;
page2 : any = Mutasipagi;
page3 : any = TransferPage;

showIcon : boolean = true;
showTitle : boolean = true;
pageTitle : string = 'Full Height'
  constructor(public toastCtrl : ToastController,
              public navParams : NavParams) { 
                const type = navParams.get('type');
                switch (type) {
                  case 'icons-only':
                    this.showTitle = false;
                    this.pageTitle += ' - Icons only';
                    break;
            
                  case 'titles-only':
                    this.showIcon = false;
                    this.pageTitle += ' - Titles only';
                    break;
                }

  }
  ngOnInit() {
  }
onTabSelect(tab: { index: number; id: string}){
    console.log(`Selected tab: `, tab)
}
}
