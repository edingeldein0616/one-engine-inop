import { OnInit, AfterViewInit, OnDestroy, EventEmitter } from '@angular/core';
import { Listener } from 'src/app/engine/core/events';
import { ContentDictionaryService } from 'src/app/services/content-dictionary.service';
import { SelectionData } from '../controls/selector/selection-data';
import { Subject } from 'src/app/engine/core/events';
import { AppInjector } from 'src/app/app-injector.service';

/**
 * Base class for all model display views that enforces value handling, label selection, content display and
 * Angular lifecycles.
 */
export abstract class DisplayViewComponent implements OnInit, AfterViewInit, OnDestroy, Listener {

    /**
     * content to be displayed in data panel of view
     */
    public content: string;
    /**
     * Service used to look up content to be displayed upon selection of a label, selector or 3D marker.
     */
    protected contentDictionaryService: ContentDictionaryService;
    
    constructor() {
        // Manually retrieve the dependencies from the injector so that the constructor had no dependencies that must be passed in from child.
        const injector = AppInjector.getInjector();
        this.contentDictionaryService = injector.get(ContentDictionaryService);
    }

    /**
     * Handles radio button selection from the control panel.
     * @param data Data from selector component selection.
     */
    public abstract onValueChanged(data: SelectionData): void;

    // Angular lifecycle interface functions passed down to children
    abstract ngOnInit(): void;
    abstract ngAfterViewInit(): void;
    abstract ngOnDestroy(): void;

    /**
     * Event system callback function.
     * @param topic Event topic
     * @param subject Subject data
     */
    abstract receive(topic: string, subject: Subject): void;
    
    /**
     * 
     * @param lookup Lookup value of the selected label, button or 3D marker
     */
    public onLabelSelected(lookup: string) {
        this.content = this.contentDictionaryService.getContent(lookup);
    }

}