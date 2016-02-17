function PirMotion(pin) {
  this._pin = pin;
  this.init();
}

PirMotion.prototype = {
  init: function() {
    navigator.mozGpio.export(this._pin);
    navigator.mozGpio.setDirection(this._pin, false /** IN **/);
  },
  isDetected: function() {
    console.log(navigator.mozGpio.getValue(this._pin));
    return navigator.mozGpio.getValue(this._pin) == 1;
  }
}
