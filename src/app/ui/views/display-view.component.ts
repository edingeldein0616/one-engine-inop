import { OnInit, AfterViewInit, OnDestroy, EventEmitter } from '@angular/core';
import { Listener } from 'src/app/engine/core/events';
import { ContentDictionaryService } from 'src/app/services/content-dictionary.service';
import { SelectionData } from '../controls/selector/selection-data';
import { Subject } from 'src/app/engine/core/events';
import { AppInjector } from 'src/app/app-injector.service';
import { ViewManagerService } from 'src/app/services/view-manager.service';

/**
 * Base class for all views with control panels and data display that enforces value handling, label selection, content display, and
 * Angular lifecycles.
 */
export abstract class DisplayViewComponent implements AfterViewInit {

    /**
     * content to be displayed in data panel of view
     */
    public content: string;
    protected contentUpdated: EventEmitter<void>;

    /**
     * Service used to look up content to be displayed upon selection of a label, selector or 3D marker.
     */
    protected contentDictionaryService: ContentDictionaryService;
    protected viewManagerService: ViewManagerService;
    
    constructor() {
        // Manually retrieve the dependencies from the injector so that the constructor had no dependencies that must be passed in from child.
        const injector = AppInjector.getInjector();
        this.contentDictionaryService = injector.get(ContentDictionaryService);
        this.viewManagerService = injector.get(ViewManagerService);
        this.contentUpdated = new EventEmitter<void>();
    }

    /**
     * Handles radio button selection from the control panel.
     * @param data Data from selector component selection.
     */
    public abstract onValueChanged(data: SelectionData): void;

    // Angular lifecycle interface function passed down to children
    abstract ngAfterViewInit(): void;
    
    /**
     * 
     * @param lookup Lookup value of the selected label, button or 3D marker
     */
    public onLabelSelected(lookup: string) {
        this.content = this.contentDictionaryService.getContent(lookup);
    }

}