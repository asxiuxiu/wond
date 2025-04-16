interface WondEditorOptions {
    container: HTMLElement;
}


export class WondEditor {
    constructor(options: WondEditorOptions) {
        // init canvas element
        const canvasWrapper = options.container;
        const boundingBox = canvasWrapper.getBoundingClientRect();
        const canvasElement = document.createElement('canvas');
        canvasElement.width = boundingBox.width;
        canvasElement.height = boundingBox.height;
        canvasWrapper.appendChild(canvasElement);

        const ctx = canvasElement.getContext('2d');
    }
}