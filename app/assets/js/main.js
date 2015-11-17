(function( undefined )
{
  function Calculator(context)
  {
    var self = this;

    self.$context   = $(context),
    self.$keys      = self.$context.find("button"),
    self.$display   = self.$context.find("#display"),

    self.$ACKey     = self.$context.find("#resetkey"),
    self.$memoryKey = self.$context.find("#memorykey"),

    self.currentOperator,
    self.firstNum,
    self.secondNum,
    self.writingState,
    self.prevKey,
    self.memory,
    self.percentage,

    self.keyType,
    self.keyValue,
    self.displayText,

    self.debug      = true;
  }

  Calculator.prototype.reset = function()
  {
    var self = this;

    self.firstNum        = undefined;
    self.secondNum       = undefined;
    self.memory          = undefined;
    self.percentage      = undefined;

    self.currentOperator = undefined;
    self.prevKey         = undefined;

    self.keyType         = undefined;
    self.writingState    = undefined;
    self.displayText     = undefined;

    // reset keys
    self.$display.text("0");
    self.$memoryKey.text("M+");
    self.$ACKey.text("AC");
  }

  Calculator.prototype.clear = function()
  {
    var self = this;

    self.displayText = "0";
    self.$display.text("0");
    self.$ACKey.text("AC");
  }


  Calculator.prototype.calculate = function(n1, n2)
  {
    var self  = this,
        n1    = parseFloat(n1),
        n2    = parseFloat(n2),
        tot;

    switch(self.currentOperator)
    {
      case "+":
        tot = n1 + n2;
        break;

      case "-":
        tot = n1 - n2;
        break;

      case "/":
        tot = n1 / n2;
        break;

      case "*":
        tot = n1 * n2;
        break;
    }

    return tot;
  }

  Calculator.prototype.handleKey = function($btn)
  {
    var self = this;

    function handleNumber($btn)
    {
      if(self.prevKey === "=")
      {
        self.firstNum      = undefined;
        self.secondNum     = undefined;
        self.displayText   = "0";
        self.$display.text("0");
      }

      if(self.displayText === "0" || self.writingState === "operator") { self.displayText = ""; }
      if(self.keyValue === ".") { self.displayText = "0"; }

      self.$display.html(self.displayText + self.keyValue);
    }

    function handleOperator($btn)
    {
      if(!self.currentOperator){ self.currentOperator = self.keyValue; }

      if(self.writingState === "operator")
      {
        console.log("here");
        self.currentOperator = self.keyValue;
        return;
      }

      if(self.prevKey === "=")
      {
        self.secondNum = undefined;
        self.currentOperator = self.keyValue;
        return;
      }

      if(self.firstNum === undefined)
      {
        self.firstNum = self.displayText;
      }
        else if(self.secondNum === undefined)
        {
          self.secondNum = self.displayText;

          var tot = self.calculate(self.firstNum, self.secondNum);

          self.firstNum  = tot;
          self.secondNum = undefined;
          self.$display.text(tot);
        }

      self.currentOperator = self.keyValue;
    }

    function handleFunction($btn)
    {

      switch(self.keyValue)
      {
        // - Reset Calc
        case "AC":
          self.reset();
          break;

        // Clear text only
        case "C":
          self.clear();
          break;

        // Convert to negative
        case "+/-":
          var num = self.displayText * -1;
          self.displayText = num;
          self.$display.text(num);
          break;

        // Do Math
        case "=":
          if(self.secondNum === undefined) self.secondNum = self.displayText;
          var tot       = self.calculate(self.firstNum, self.secondNum);
          self.firstNum = tot;
          self.$display.text(tot);
          break;

        // Memory
        case "M+":
          $btn.text("M-");
          self.$display.text("0");
          self.memory = self.displayText;
          break;

        // Unmemorize
        case "M-":
          $btn.text("M+");
          self.$display.text(self.memory);
          self.memory = undefined;
          break;

        // - Percentage
        case "%":
          self.percentage  = (self.firstNum / 100) * self.displayText;
          self.displayText = self.percentage;
          self.$display.text(self.percentage);
          break;
      }
    }

    switch(self.keyType)
    {
      case "number":
        handleNumber($btn);
        break;

      case "operator":
        handleOperator($btn);
        break;

      case "function":
        handleFunction($btn);
        break;
    }

  }

  Calculator.prototype.log = function()
  {
    var self  = this,
        d     = {
          "firstNum"        : self.firstNum,
          "secondNum"       : self.secondNum,
          "memory"          : self.memory,
          "percentage"      : self.percentage,
          "currentOperator" : self.currentOperator,
          "prevKey"         : self.prevKey,
          "keyType"         : self.keyType,
          "writingState"    : self.writingState,
          "displayText"     : self.displayText
        };

    if(self.debug) console.log(d);
  }

  Calculator.prototype.initialize = function()
  {
    var self = this;

    self.$context.on("click", "button", function()
    {
      var $btn = $(this);

      // - Set Variables
      self.keyType     = $btn.data("type");
      self.keyValue    = $btn.text();
      self.displayText = self.$display.text();

      // - Change keys
      self.$ACKey.text("C");

      // - Handle key
      self.handleKey($btn);

      // - Set Variables
      self.writingState  = self.keyType;
      self.prevKey       = self.keyValue;

      self.log();

    });
  }

  // - Initialize Script
  var c = new Calculator("#calculator");
  c.initialize();

}(jQuery));