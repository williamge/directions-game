
export class _Event<T>{
    private listeners: ((T) => void)[] = [];
    
    constructor(childEvents?: any[]) {
        childEvents = childEvents || [];
        childEvents.forEach(
            (event) => {
                event.listen(
                    function (message: T) {
                        this.emit(message);
                    }.bind(this)
                )
            }
        )
    }
    
    listen(callback: (T) => void){
        this.listeners.push(callback);
    }
    
    emit(message: T) {
        this.listeners.forEach(
            (listener) => {
                listener(message);
            }
        )
    }
}