var _Event = (function () {
    function _Event(childEvents) {
        var _this = this;
        this.listeners = [];
        childEvents = childEvents || [];
        childEvents.forEach(function (event) {
            event.listen(function (message) {
                this.emit(message);
            }.bind(_this));
        });
    }
    _Event.prototype.listen = function (callback) {
        this.listeners.push(callback);
    };
    _Event.prototype.emit = function (message) {
        this.listeners.forEach(function (listener) {
            listener(message);
        });
    };
    return _Event;
})();
module.exports = _Event;
