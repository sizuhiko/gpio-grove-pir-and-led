'use strict';

window.addEventListener('load', function (){
  /**
    CH1
    2	I2C2_SDA	GPIO3_A0	gpio256
    3	I2C2_SCL	GPIO3_A1	gpio257
    4	UART3_RX	GPIO3_D3	gpio283
    5	UART3_TX	GPIO3_D4	gpio284
    7	SPI0_CS	    GPIO1_A4	gpio196
    8	SPI0_CLK	GPIO1_A5	gpio197
    9	SPI0_RX	    GPIO1_A6	gpio198
    10	SPI0_TX	    GPIO1_A7	gpio199
    11	SPI1_CS	    GPIO2_C4	gpio244
    12	SPI1_CLK	GPIO2_C3	gpio243
    13	SPI1_RX	    GPIO2_C6	gpio246
    14	SPI1_TX	    GPIO2_C5	gpio245
    -------------------------------------
    CN2			
    10	PWM0	    GPIO0_A3	gpio163
    11	I2C0_SCL	GPIO2_D5	gpio253
    12	I2C0_SDA	GPIO2_D4	gpio252
    13	UART0_TX	GPIO1_A1	gpio193
    14	UART0_RX	GPIO1_A0	gpio192
    15	   ->	    GPIO6_A1	gpio353
  */

  var PIR_PIN = 163;  // what pin we're connected to
  var LED_CLK_PIN = 283;
  var LED_DATA_PIN = 284;

  var leds = new ChainableLED(LED_CLK_PIN, LED_DATA_PIN, 3);
  var motion = new PirMotion(PIR_PIN);

  var hue = 0.0;
  var up = true;

  setInterval(function() {
    if(motion.isDetected()){
      console.log("motion detected");
      var led1 = hexToRgb(document.getElementById("led1").value);
      var led2 = hexToRgb(document.getElementById("led2").value);
      var led3 = hexToRgb(document.getElementById("led3").value);

      leds.setColorRGB(0, led1.r, led1.g, led1.b);
      leds.setColorRGB(1, led2.r, led2.g, led2.b);
      leds.setColorRGB(2, led3.r, led3.g, led3.b);

//      for (var i=0; i<3; i++) {
//        leds.setColorHSB(i, hue, 1.0, 0.5);
//      }
//      if (up) {
//        hue+= 0.1;
//      } else {
//        hue-= 0.1;
//      }
//      if (hue>=1.0 && up) {
//        up = false;
//      } else if (hue<=0.0 && !up) {
//        up = true;
//      }
    
    
    } else {
      leds.setColorRGB(0, 255, 255, 255);
      leds.setColorRGB(1, 255, 255, 255);
      leds.setColorRGB(2, 255, 255, 255);
    }
  }, 1000);
});

/**
 * http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}