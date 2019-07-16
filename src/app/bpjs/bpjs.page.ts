import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, NavParams, ToastController, AlertController, ModalController } from '@ionic/angular';
import { text } from '@angular/core/src/render3';
import { Http2SecureServer } from 'http2';
import { Config } from '@ionic/core';

@Component({
  selector: 'app-bpjs',
  templateUrl: './bpjs.page.html',
  styleUrls: ['./bpjs.page.scss'],
})
export class BPJSPage implements OnInit {
  loading: Loading;
  data: any = {};
  number: '' ;
  periode: '' ;
  lTrue: true;
  cError: "";
  rootNavCtrl: NavController;
  optionList: Array<{value : string, text: string, checked: boolean}> = [];
  constructor() { }

  ngOnInit(public navCtrl : NavController, public navParams : NavParams,
    public toastCtrl : ToastController,
    public loadingCtrl : LoadingController,
    public config : Config,
    public alertCtrl : AlertController,
    public func : Function, public modalCtrl : ModalController) {

      this.lTrue = true; 
      this.cError = "";
      this.rootNavCtrl = navParams.get('rootNavCtrl');
      var vaPeriode= ["1", "2", "3", "4", "5"];
        for(var i=0; i<vaPeriode.length; i++){
            this.optionList. push({ value: vaPeriode[i], text:" month", checked:false});
        }
  }
  ionViewDidLoad(){
      console.log('ionViewDidLoad PaymentListrikPage');
  }

}
