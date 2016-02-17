// Forward declaration
// float hue2rgb(float p, float q, float t);

// --------------------------------------------------------------------------------------

function ChainableLED(clk_pin, data_pin, number_of_leds) {
  this._clk_pin  = clk_pin;
  this._data_pin = data_pin;
  this._num_leds = number_of_leds;
  this._led_state = new Array();
  this.init();
}

// --------------------------------------------------------------------------------------
ChainableLED.prototype = {
  _CL_RED:          0,
  _CL_GREEN:        1,
  _CL_BLUE:         2,
  _CLK_PULSE_DELAY: 0.02,

  init: function()
  {
    var self = this;

    navigator.mozGpio.export(self._clk_pin);
    navigator.mozGpio.setDirection(self._clk_pin, true /** OUTPUT **/);
    navigator.mozGpio.export(self._data_pin);
    navigator.mozGpio.setDirection(self._data_pin, true /** OUTPUT **/);

    for (var i=0; i<self._num_leds; i++) {
      self.setColorRGB(i, 0, 0, 0);
    }
  },

  sleep: function(ms) {
    var start = window.performance.now();
    while(window.performance.now() - start < ms);
  },

  constrain: function(x, a, b) {
    return Math.min(Math.max(x, a), b);
  },

  toByte: function(v)
  {
    var self = this;

    return parseInt(self.constrain(v, 0, 255));
  },
  
  clk: function()
  {
    var self = this;

    navigator.mozGpio.setValue(self._clk_pin, 0 /** LOW **/);
    self.sleep(self._CLK_PULSE_DELAY);
    navigator.mozGpio.setValue(self._clk_pin, 1 /** HIGH **/);
    self.sleep(self._CLK_PULSE_DELAY);
  },

  sendByte: function(b)
  {
    var self = this;

    // Send one bit at a time, starting with the MSB
    for (var i=0; i<8; i++)
    {
      // If MSB is 1, write one and clock it, else write 0 and clock
      if ((b & 0x80) != 0)
      {
        navigator.mozGpio.setValue(self._data_pin, 1 /** HIGH **/);
      } else {
        navigator.mozGpio.setValue(self._data_pin, 0 /** LOW **/);
      }
      self.clk();

      // Advance to the next bit to send
      b <<= 1;
    }
  },

  sendColor: function(red, green, blue)
  {
    var self = this;

    // Start by sending a byte with the format "1 1 /B7 /B6 /G7 /G6 /R7 /R6"
    var prefix = 0b11000000;
    if ((blue & 0x80) == 0)     prefix|= 0b00100000;
    if ((blue & 0x40) == 0)     prefix|= 0b00010000; 
    if ((green & 0x80) == 0)    prefix|= 0b00001000;
    if ((green & 0x40) == 0)    prefix|= 0b00000100;
    if ((red & 0x80) == 0)      prefix|= 0b00000010;
    if ((red & 0x40) == 0)      prefix|= 0b00000001;
    self.sendByte(prefix);

    // Now must send the 3 colors
    self.sendByte(blue);
    self.sendByte(green);
    self.sendByte(red);
  },

  setColorRGB: function(led, red, green, blue)
  {
    var self = this;

    // Send data frame prefix (32x "0")
    self.sendByte(0x00);
    self.sendByte(0x00);
    self.sendByte(0x00);
    self.sendByte(0x00);

    // Send color data for each one of the leds
    for (var i=0; i<self._num_leds; i++)
    {
      if (i == led)
      {
        self._led_state[i*3 + self._CL_RED] = red;
        self._led_state[i*3 + self._CL_GREEN] = green;
        self._led_state[i*3 + self._CL_BLUE] = blue;
      }

      self.sendColor(self._led_state[i*3 + self._CL_RED], 
                     self._led_state[i*3 + self._CL_GREEN], 
                     self._led_state[i*3 + self._CL_BLUE]);
    }

    // Terminate data frame (32x "0")
    self.sendByte(0x00);
    self.sendByte(0x00);
    self.sendByte(0x00);
    self.sendByte(0x00);
  },

  setColorHSB: function(led, hue, saturation, brightness)
  {
    var self = this;
    var r, g, b;

    hue = self.constrain(hue, 0.0, 1.0);
    saturation = self.constrain(saturation, 0.0, 1.0);
    brightness = self.constrain(brightness, 0.0, 1.0);

    if(saturation == 0.0)
    {
      r = g = b = brightness;
    }
    else
    {
      var q = (brightness < 0.5)? 
        brightness * (1.0 + saturation) : brightness + saturation - brightness * saturation;
      var p = 2.0 * brightness - q;
      r = self.hue2rgb(p, q, hue + 1.0/3.0);
      g = self.hue2rgb(p, q, hue);
      b = self.hue2rgb(p, q, hue - 1.0/3.0);
    }

    self.setColorRGB(led, self.toByte(255.0*r), self.toByte(255.0*g), self.toByte(255.0*b));
  },

// --------------------------------------------------------------------------------------

  hue2rgb: function(p, q, t)
  {
    if (t < 0.0) 
      t += 1.0;
    if(t > 1.0) 
      t -= 1.0;
    if(t < 1.0/6.0) 
      return p + (q - p) * 6.0 * t;
    if(t < 1.0/2.0) 
      return q;
    if(t < 2.0/3.0) 
      return p + (q - p) * (2.0/3.0 - t) * 6.0;

    return p;
  }
}