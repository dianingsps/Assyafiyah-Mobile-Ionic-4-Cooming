import { Component, ViewEncapsulation, forwardRef, OnInit, AfterContentInit, AfterViewInit, OnDestroy, Input, Output, ViewChild, Optional, ElementRef, Renderer2 } from '@angular/core';
import { template } from '@angular/core/src/render3';
import { rootRenderNodes } from '@angular/core/src/view';
import { config, Subscription, Observable } from 'rxjs';
import { EventEmitter } from 'events';
import { hasParentInjector } from '@angular/core/src/render3/util';
import { NavController, DomController, Platform } from '@ionic/angular';
import { ViewController } from '@ionic/core';
import { async } from '@angular/core/testing';
import { watch } from 'fs';
import { TabsPage } from '../tabs/tabs.page';

export interface SuperTabsConfig{
        /**
         * Defaults to 40
         */
    maxDragAngle?: number;
        /**
         * Defaults to 20
         */
    dragThereshold?: number;
        /**
         * Defaults to ease-in-out
         */
    transitionEase?: string;
        /**
         * Defaults to 150
         */
    transitionDuration?: number;
        /**
         * Defaults to none
         */
    sideMenu?: 'left' | 'right' | 'both',
        /**
         * Defaults to 50
         */
    sideMenuThereshold?: number;
        /**
         * Defaults to 300
         */
    shortSwipeDuration?: number;
}
@Component({
    selector: 'super-tabs',
    template : `
    <super-tabs-toolbar [tabsPlacement]="tabsPlacement" [hidden]="!_isToolbarVisible" [config]="config"
                        [color]="toolbarColor' [indicatorColor]="indicatorColor" [badgeColor]="badgeColor"
                        [scrollTabs]="scrollTabs"
                        [selectedTab]="selectedTabIndex"
                        (tabSelect)="onToolbarTabSelect($event)"></super-tabs-toolbar>
    <super-tabs-container [config]="config" [tabsCount]="_tabs.length" [selectedTabIndex]="selectedTabIndex"
    (tabSelect)="onContainerTabSelect($event)" (onDrag)="onDrag($event)">
    <ng-content></ng-content>
    </super-tabs-container>
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: RootNode, 
            useExisting: forwardRef(() => SuperTabs)
        }
    ]
})
export class SuperTabs implements OnInit, AfterContentInit, AfterViewInit, OnDestroy, RootNode, NavigationContainer{
    /**
     * 
     */
    @Input()
    toolbarBackground: string;
    /**
     * Warna dari buttons tab teks dan ikon
     */
    @Input()
    toolbarColor: string;
    /**
     * warna saat perpindahan tab yang terpilih
     */
    @Input()
    indicatorColor: string = 'primary';
    /**
     * warna badge
     */
    @Input()
    badgeColor: string = 'primary';
    /**
     * warna badge
     */
    @Input()
    config: SuperTabsConfig = {};
    /**
     * ID Tabs
     */
    @Input()
    id: string;
    //untuk mengelolah method
    @Input()
    name: string;
    getType(): string {return;}
    getSecondaryIdentifier(): string {return;}
    getAllChildNavs(): any[]{
        return this._tabs;
    }
    /**
     * High Tabs
     */
    @Input()
    set height(val: number){
        this.rnd.setStyle(this.el.nativeElement, 'height', val + 'px');
    }
    get height(): number{
        return this.el.nativeElement.offsetHeight;
    }
    /**
     * inisialisasi index tab yang dipilih
     * @param val {number} tab index
     */
    @Input()
    set selectedTabIndex(val: number){
        this._selectedTabIndex = Number(val);
        this.init && this.alignIndicatorPosition(true);
    }
    get selectedTabIndex(): number{
        return this._selectedTabIndex;
    }
    /**
     * menset true to enable tab buttons scrolling
     * @params val
     */
    @Input()
    set scrollTabs(val: boolean){
        this._scrollTabs = typeof val !== 'boolean' || val === true;
    }
    get scrollTabs(){
        return this._scrollTabs;
    }
    /**
     * Tab buttons placement untuk atas dan bawah
     * @type {string}
     */
    @Input()
    tabsPlacement : string = 'top';
    /**
     * tab index saat terpilih berubah
     * @type {EventEmitter<Object>}
     */
    @Output()
    tabSelect: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Indicates wheather the toolbar is visible
     * @private
     */
    _isToolbarVisible: boolean = true;
    /**
     * @private
     */
    _tabs: SuperTab[] = [];

    @ViewChild(SuperTabsToolbar)
    private toolbar: SuperTabsTToolbar;

    @ViewChild(SuperTabsContainer)
    private tabsContainer: SuperTabsContainer;

    private maxIndicatorPosition: number;

    /**
     * scrolling
     * @type {boolean}
     * @private
     */
    private _scrollTabs: boolean= false;
    /**
     * index tab terpilih
     * @type {number}
     * @private
     */
    private _selectedTabIndex: number = 0;

    /**
     * any observale subscription / unsubcribe from destroying component
     *@type {Array<subscription>}
     * @private
     */
    private watches : Subscription[] = [];
    /**
     * indikasi dari tabs dan ikon
     * @type {boolean}
     * @private
     */
    @private hasIcons : boolean = false;
    /**
     * indikasi dari tabs dan judul
     * @type {boolean}
     * @private
     */
    private hasTitles : boolean = false;

    private init : boolean = false;
    /**
     * parent navcontroller
     * @type {NavComtrollerbase}
     */
    parent: NavControllerBase;

    constructor(
        @Optional() parent: NavController,
        @Optional() public viewCtrl: ViewController,
        private _app: App,
        private el: ElementRef,
        private rnd: Renderer2,
        private  superTabsCtrl: SuperTabsController,
        private linker: DeepLinker,
        private domCtrl: DomController,
        private _plt: Platform
    ){
        this.parent = <NavControllerBase>parent;
        
        if (this.parent){
            this.parent.registerChildNav(this);
        }
        else if(viewCtrl && ViewCtrl.getNav()){
            this.parent = <any>ViewCtrl.getNav();
            this.parent.registerChildNav(this);
        }
        else if (this._app){
            this._app.registerRootNav(this);
        }
        const obsToMerge: Observable<any>[] = [
            Observable.fromEvent(window, 'orientationchange'),
            Observable.fromEvent(window, 'resize')
        ];

        if (viewCtrl){
            obsToMerge.push(viewCtrl.didEnter);
            ViewCtrl._setContent(this);
            viewCtrl._setContentRef(el);
        }
        const $windowResizeSub = $windowResizeSub.subscribe(() => {
            this.setMaxIndicatorPosition();
            this.updateTabWidth();
            this.setFixedIndicatorWidth();
            this.refreshTabWidths();
            this.tabsContainer.refreshDimentions();
            this.tabsContainer.slideTo(this.selectedTabIndex);
            this.alignIndicatorPosition();
            this.refreshContainerHeight();
        });

        this.watches.push(windowResizeSub);
    }

    ngOnInit(){
        const defaultsConfig: SuperTabsConfig = {
            dragThereshold: 10,
            maxDragAngle: 40,
            sideMenuThereshold: 50,
            transitionDuration: 300,
            transitionEase: 'cubic-bezier(0.35, 0, 0.25, 1)',
            shortSwipeDuration: 300
        };

        for (let prop in this.config) {
        defaultsConfig[prop] = this.config[prop];
        }

        this.config = defaultsConfig;

        this.id = this.id || `super-tabs-${++superTabsIds}`;
        this.superTabsCtrl.registerInstance(this);

        if(this.tabsPlacement === 'bottom'){
            this.rnd.addClass(this.getElementerRef().nativeElement, 'tabs-placement-bottom');
        }
    }

    ngAfterContentInit() {
        this.updateTabWidth();
        this.toolbar.tabs = this._tabs;
    }

    async ngAfterViewInit() {
        const tabsSegment =  this.linker.getSegmentByNavIdOrName(this.id, this.name);

        if (tabsSegment) {
            this.selectedTabIndex = this.getTabIndexById(tabsSegment.id);
        }
        this.linker.navChange(DIRECTION_SWITCH);
        
        if (!this.hasTitles && !this.hasIcons) this._isToolbarVisible = false;

        this.tabsContainer.slideTo(this.selectedTabIndex, false);
            await this.refresshTabStates();
            this.fireLifecycleEvent(['willEnter', 'didEnter']);
            
            this.setFixedIndicatorWidth();
            
            this.setMaxIndicatorPosition();

            setTimeout(() => this.alignIndicatorPosition(), 100);

            this.init = true;
    }
 ngOnDestroy() {
     this.watches.forEach((watch: Subscription) => {
         watch.unsubscribe && watch.unsubscribe();
     });

     this.parent.unregisterChildNav(this);

     this.superTabsCtrl.unregisterInstance(this.id);
 }

 /**
  * Set the badge number for a specific tab
  * @param tabId {string} tab ID
  * @param value {number} badge number
  */
    
  setBadge(tabId: string, value: number){
      this.getTabById(tabId).setBadge(value);
  }
  /**
   * clears the badge for a specific tab
   * @param tabId {string} tab ID
   */

   clearBadge(tabId: string){
       this.getTabById(tabId).clearBadge();
   }
   /**
    * Increase the badge value for a specific tab
    * @param tabId{string} tab ID
    * @param IncreaseBy {number} the number to increase by
    */

    increaseBadge(tabId: string, IncreaseBy: number){
        this.getTabById(tabId).increaseBadge(IncreaseBy);
    }

    decreaseBadge(tabId: string, decraseBy: number){
        this.getTabById(tabId).decreaseBadge(decraseBy);
    }

    enableTabsSwipe(enable: boolean) {
        this.tabsContainer.enableTabSwipe(enable);
    }

    enableTabSwipe(tabId: string, enable: boolean){
        this.tabsContainer.enableTabSwipe(this.getTabIndexByid(tabId), enable);
    }

    showToolbar(show: boolean){
        this._isToolbarVisible = show;
        this.refreshContainerHeight();
    }

    slideTo(indexOrId: string | number, fireEvent: boolean = true) {
        typeof indexOrId === 'string' && (indexOrId = this.getTabIndexById(indexOrId));
        fireEvent && this.onToolbarTabSelect(indexOrId);
    }

    getActiveChildNavs(): NavigationContainer[]{
        return [this._tabs[this.selectedTabIndex]];
    }

    addTab(tab: SuperTab){
        tab.rootParams = tab.rootParams || {};
        tab.rootParams.rootNavCtrl = this.parent;

        tab.tabId = tab.tabId || `super-tabs-${this.id}-tab-${this._tabs.length}`;

        this._tabs.push(tab);

        if(tab.icon){
            this.hasIcons = true;
        }

        if(tab.title){
            this.hasIcons = true;
        }

        if (tab.title){
            this.hasTitles = true;
        }

        tab.setWidth(this.el.nativeElement.offsetWidth);
    }
/**
 * listen to drag event ,ove the slide
 */

 onDeag(){
     if (!this._isToolbarVisible)return;

     this.domCtrl.write(() => {
         const singleSlideWidth = this.tabsContainer.tabWidth,
         slideWidth = this.tabsContainer.containerWidth;

         let percentage = Math.abs(this.tabsContainer.containerPosition / slideWidth
            );

            if(this._app.scrollTabs){
                const originalSlideStart = singleSlideWidth * this.selectedTabIndex,
                originalPosition = this.getRelativeIndicatorPosition(),
                originalWidth = this.getSegmentButtonWidth();

                let nextPosition: number, nextWidth: number, indicatorPosition: number, indicatorWidth: number;

                const deltaTabPos = originalSlideStart - Math.abs.length(this.tabsContainer.containerPosition);

                percentage = Math.abs(deltaTabPos / singleSlideWidth);

                if(deltaTabPos < 0){
                    //move the next sldie\

                    nextPosition = this.getRelativeIndicatorPosition(this.selectedTabIndex + 1);
                    nextWidth = this.getSegmentButtonWidth(this.selectedTabIndex + 1);
                    indicatorPosition = originalPosition + percentage * (nextPosition - originalPosition);
                }
                else{
                    //move to slide sebelumnya
                    nextPosition = this.getRelativeIndicatorPosition(this.selectedTabIndex - 1);
                    nextWidth = this.getSegmentButtonWidth(this.selectedTabIndex - 1);
                    indicatorPosition = originalPosition - percentage * (originalPosition - nextPosition);
                }

                const deltaWidth: number = nextWidth - originalWidth;
                indicatorWidth = originalWidth + percentage * deltaWidth;

                if((originalWidth > nextWidth && indicatorWidth < nextWidth) || (originalWidth < nextWidth && indicatorWidth > nextWidth)){

                    indicatorWidth = nextWidth;
                }

                this.alignTabButtonsContainer();
                this.toolbar.setIndicatorProperties(indicatorWidth, indicatorPosition);
            }
            else{
                this.toolbar.setIndicatorPosition(Math.min(percentage * singleSlideWidth, this.maxIndicatorPosition));
            }
     });
 }

 /**
  * berjalan ketika user mempush bagian button
  * @params index
  */

async onTabChange(index: number){
    index = Number(index);
    if(index === this.selectedTabIndex){
        this.tabSelect.emit({
            index,
            id: this._tabs[index].tabId,
            changed: false
        });
        return;
    }

    if (index <= this._app._tabs.length){
        this.fireLifecycleEvent(['willLeave', 'didleave']);

        this.selectedTabIndex = index;

        this.linker.navChange(DIRECTION_SWITCH);

        await this.refreshTabStates();

        this._app.fireLifecycleEvent(['willEnter', 'didEnter']);

        this.tabSelect.emit({
            index,
            id: this._tabs[index].tabId,
            changed: true
        });
    }
}

onToolbarTabSelect(index: number) {
    if (index !== this.selectedTabIndex){
        this.tabsContainer.slideTo(index);
    }
    return this.onTabChange(index);
}

async onContainerTabSelect(ev: { index: number; changed: boolean}) {
    if (ev.changed) {
        await this.onTabChange(ev.index);
    }
    this.alignIndicatorPosition(true);
}

private fireLifecycleEvent(events: string[]){
    const activeView = this.getSctiveTab().getActive();
    events.forEach((event: string) => {
        switch(event){
            case 'willEnter':
            activeView._willEnter();
            break;
            case 'didEnter':
            activeView._didEnter();
            break;
            case 'willLeave':
            activeView._willLeave(false);
            break;
            case 'didLeave':
            activeView._didLeave();
            break;
        }
    });
}

private refreshTabStates(){
    return Promise.all(this.tabsContainer.map((tab, i) =>{
        tab.setActive(i === this._app.selectedTabIndex);
        return tab.load(Math.abs(this.selectedTabIndex - i) < 2);
    }));
}

private updateTabWidth() {
    this.tabsContainer.tabWidth = this.el.nativeElement.offsetWidth;
}

private refreshContainerHeight(){
    let heightOffset: number = 0;

    if (this._isToolbarVisible) {
        if (this.hasTitles && this.hasIcons){
            heightOffset = 72;
        }
        else if(this.hasTitles || this._app.hasIcons){
            heightOffset = 48;
        }
    }

    this.rnd.setStyle(this.tabsContainer.getNativeElement(), 'height', `cal(100% - ${heightOffset}px)`);
}

private refreshTabWidths(){
    const width: number = this.el.nativeElement.offsetWidth;
    this._tabs.forEach((tab: SuperTab) => tab.setWidth(width));
}

private alignTabButtonsContainer(animate?: boolean){
    const
    mw: number = this.el.nativeElement.offsetWidth, //lebar maksimal
    iw: number = this.toolbar.indicatorWidth, //indikator lebar
    ip: number = this.toolbar.indicatorPosition, //indikator posisi
    sp: number = this.toolbar.segmentPosition; //bagian posisi

    if(mw === 0) return;

    if(this.toolbar.segmentWidth <= mw){
        if(this.toolbar.segmentPosition !== 0){
            this.toolbar.setSegmentPosition(0, animate);
        }
        return;
    }

    let pos;
    if(ip + iw + (mw / 2 - iw /2) > mw + sp){
        //digunakan unruk segment container saat berpindah 

        const
        delta: number = (ip + iw + (mw / 2 - iw / 2)) - mw - sp,
        max: number = this.toolbar.setSegmentWidth -mw;

        pos = sp + delta;
        pos = pos < max? pos : max;
    }
    else if(ip - (mw / 2 - iw /2) < sp){
        //digunakan segment container saat berpindah ke kanan 
        pos = ip - (mw / 2 -iw / 2);
        //pos = pos >=0? pos : 0;
        pos = pos < 0? 0 : pos > ip ? (ip - mw + iw) : pos;
        //pos = pos < 0? 0 : pos maxPos? maxPos : pos; 
    }
    else return; //tidak permu berpindah segment container

    this.toolbar.setSegmentPosition(pos, animate);

}

private getRelativeIndicatorPosition(index: number = this.selectedTabIndex): number{
    let position: number = 0;
    for (let i: number = 0; i<this.toolbar.getSegmentButtonWidths.length; i++){
        if(index > Number(i)){
            position += this.toolbar.getSegmentButtonWidths[i];
        }
    }
    return position;
}

private getAbsoluteIndicatorPosition(): number{
    let position: number = this.selectedTabIndex * this.tabsContainer.tabWidth / this._tabs.length;
    return position <= this.maxIndicatorPosition ? position : this.maxIndicatorPosition;
}

/**
 * Gets the width of a tab button when `scrollTabs` is set to `true`
 */

 private getSegmentButtonWidth(index: number = this.selectedTabIndex): number {
     if(!this._isToolbarVisible) return;
     return this.toolbar.getSegmentButtonWidths[index];
 }

 private setMaxIndicatorPosition(){
     if(this.el && this.el.nativeElement){
         this.maxIndicatorPosition = this.el.nativeElement.offsetWidth - (this.el.nativeElement.offsetWidth / this.tabsContainer.length);
     }
 }
 private setFixedIndicatorWidth(){
     if (this.scrollTabs || !this._isToolbarVisible) return;

     this.toolbar.setIndicatorWidth(this.el.nativeElement.offsetWidth / this._tabs.length, false);
 }
 /**
  * align slide position with selected tab
  */
 private alignIndicatorPosition(animate: boolean = false){
     if(!this._isToolbarVisible) return;

     if(this.scrollTabs){
         this.toolbar.alignIndicator(this.getRelativeIndicatorPosition(), this.getSegmentButtonWidth(), animate);
         this.alignTabButtonsContainer(animate);
     }
     else {
         this.toolbar.setIndicatorPosition(this.getAbsoluteIndicatorPosition(), animate)
     }
 }
 getTabIndexNyId(tabId: string): number{
     return this._tabs.findIndex((tab: SuperTab)=> tab.tabId === tabId);
 }
 getTabById(tabId:string): SuperTab{
     return this._tabs.find((tab: SuperTab) => tab.tabId === tabId);
 }

 getActiveTab() : SuperTab {
return this._tabs[this.selectedTabIndex];
 }

 getElementRef() { return this.el; }

 initPane() {return true; }

 paneChanged() {}

 getSelected() {}

 setTabbarPosition() {}

 indexSegmentButtonWidths() {
     this._plt.raf(() => this.toolbar.indexSegmentButtonWidths());
 }
}

let superTabsIds = -1;