var pluginName  = "calculator",
    defaults    = {};

function Plugin(context, options)
{
  this.settings     = $.extend({}, options, defaults);

  this.$context         = $(context);
  this.$display         = this.$context.find("#display");
  this.$keys            = this.$context.find("#keys");
  this.$memoryKey       = this.$keys.find("#memorykey");
  this.$resetKey        = this.$keys.find("#resetkey");
  this.$memoryKey       = this.$keys.find("#memorykey");
  this.firstNum         = undefined;
  this.secondNum        = undefined;
  this.floatNum         = false;
  this.currentOperator  = undefined;
  this.writingState     = undefined;
  this.prevKey          = undefined;
  this.keyType          = undefined;
  this.keyValue         = undefined;
  this.memory           = undefined;

  this.init();
}

Plugin.prototype = {


  init: function()
  {
    var self = this;

    this.events();
    this.utilities.debug.call(self);
  },

  events: function()
  {

    var self = this;

    self.$keys.on("click", "button", function()
    {
      var $btn = $(this);

      self.keyType      = $btn.data("type");
      self.keyValue     = $btn.text();

      self.$resetKey.text("C");

      switch(self.keyType)
      {
        case "number":    self.handle.num.call(self);       break;
        case "operator":  self.handle.operator.call(self);  break;
        case "function":  self.handle.func.call(self);      break;
      }

      if(self.keyValue === "AC") return;

      self.writingState = self.keyType;
      self.prevKey      = self.keyValue;

      self.utilities.debug.call(self);

    });

  },

  calculate: function(num1, num2)
  {
    var self = this,
        tot;

    num1 = parseFloat(num1);
    num2 = parseFloat(num2);

    switch(self.currentOperator)
    {
      case "+": tot = self.operations.addition(num1, num2);       break;
      case "-": tot = self.operations.subtraction(num1, num2);    break;
      case "*": tot = self.operations.multiplication(num1, num2); break;
      case "/": tot = self.operations.division(num1, num2);       break;
    }

    return tot;
  },

  render: function(text)
  {
    var self  = this;

    self.$display.text(text);

    return text;
  },

  handle: {
    num: function()
    {
      var self  = this,
          num   =  self.$display.text();

      // if clicked operator
      if(self.writingState === "operator") num = "0";
      if(self.prevKey === "=")
      {
        num             = "0";
        self.firstNum   = undefined;
        self.secondNum  = undefined;
      }

      // make a clean number
      if(num === "0") num = "";

      // make float number
      if(self.keyValue === ".")
      {
        if(num == "") num = "0";
        if(self.floatNum) return;
        self.floatNum = true;
      }

      self.render(num + self.keyValue);
    },

    operator: function()
    {
      var self        = this,
          displayText = parseFloat( self.$display.text() ),
          tot;

      self.floatNum = false;

      if(!self.currentOperator) self.currentOperator = self.keyValue;

      // change operator only
      if(self.writingState === "operator")
      {
        self.writingState = self.keyValue;
        return;
      }

      if(self.prevKey === "=")
      {
        self.currentOperator  = self.keyValue;
        self.secondNum        = undefined;
        self.firstNum         = displayText;
        return;
      }

      // setting numbers
      if(self.firstNum === undefined)
      {
        self.firstNum = displayText;
      }
        else if(self.secondNum === undefined)
        {
          self.secondNum  = displayText;
          tot             = self.calculate(self.firstNum, self.secondNum);

          self.render(tot);

          self.firstNum   = tot;
          self.secondNum  = undefined;
        }

      self.currentOperator = self.keyValue;
    },

    func: function()
    {
      var self = this;

      switch(self.keyValue)
      {
        case "=": self.functions.getResult.call(self); break;
        case "M+": self.functions.memorize.call(self); break;
        case "M-": self.functions.unmemorize.call(self); break;
        case "%": self.functions.percentage.call(self); break;
        case "+/-": self.functions.convertPolarity.call(self); break;
        case "AC": self.functions.resetCalc.call(self); break;
        case "C": self.functions.clearDisplay.call(self); break;
      }
    }
  },

  operations: {
    addition:       function(num1, num2){return num1 + num2;},
    subtraction:    function(num1, num2){return num1 - num2;},
    multiplication: function(num1, num2){return num1 * num2;},
    division:       function(num1, num2){return num1 / num2;}
  },

  functions: {
    resetCalc: function()
    {
      var self = this;

      self.$resetKey.text("AC");
      self.$display.text("0");

      self.firstNum         = undefined;
      self.secondNum        = undefined;
      self.keyValue         = undefined;
      self.keyType          = undefined;
      self.currentOperator  = undefined;
      self.floatNum         = false;
      self.memory           = undefined;
    },

    clearDisplay: function()
    {
      var self = this;

      self.$resetKey.text("AC");
      self.$display.text("0");
    },

    memorize: function()
    {
      var self  = this,
          m     = self.$display.text();

      self.memory = parseFloat( m );
      self.$display.text("0");
      self.$memoryKey.text("M-");

      return m;
    },

    unmemorize: function()
    {
      var self  = this,
          m     = self.memory;

      self.$display.text(m);
      self.memory = undefined;
      self.$memoryKey.text("M+");

      return m;
    },

    convertPolarity: function()
    {
      var self  = this,
          num   = self.$display.text();

      self.$display.text(num*-1);

      return num*-1;
    },

    percentage: function()
    {
      var self        = this,
          percentage  = (self.firstNum / 100) * self.$display.text();

      self.$display.text( percentage );

      return percentage;
    },

    getResult: function()
    {
      var self        = this,
          displayText = parseFloat( self.$display.text() ),
          tot;

      if(self.secondNum === undefined) self.secondNum = displayText;

      tot = self.calculate(self.firstNum, self.secondNum);
      self.render(tot);

      self.firstNum = tot;

      return tot;
    }
  },

  utilities: {
    debug: function()
    {
      var self = this,
          o;

      if(!self.settings.debug) return;

      o = self;

      console.log( o );
      return o;
    }
  }

}

$.fn[pluginName] = function(options)
{
  $(this).each(function()
  {
    return new Plugin(this, options)
  })
}

$("#calculator").calculator();