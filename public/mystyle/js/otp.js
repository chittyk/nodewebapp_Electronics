class OTPInputHandler {
  constructor(selector) {
      if (selector) {
          this.selector = selector;
          this.inputs = document.querySelectorAll(selector);
          if (this.inputs.length) {
              this.inputIndex = 0;
              this.numericPattern = /^[0-9]$/;
              this.attachEventHandlers();
          } else {
              console.error("No elements found for the provided selector!");
          }
      }
  }

  attachEvent(events, selector, callback) {
      const eventsList = events
          .split(",")
          .map(event => event.trim())
          .filter(event => ["keydown", "paste"].includes(event));

      eventsList.forEach(event => {
          document.addEventListener(event, e => {
              const target = e.target;
              if (target.closest(selector)) {
                  callback.call(target, e);
              }
          });
      });
  }

  attachEventHandlers() {
      this.attachEvent("keydown", this.selector, this.handleKeyDown.bind(this));
      this.attachEvent("paste", this.selector, this.handlePaste.bind(this));
  }

  handleKeyDown(e) {
      const keyboard = e;

      if (keyboard.ctrlKey || keyboard.metaKey) {
          return;
      } else {
          e.preventDefault();
      }

      this.inputIndex = this.getInputIndex(e.target);
      switch (keyboard.key) {
          case "ArrowLeft":
              this.moveFocusLeft();
              break;
          case "ArrowRight":
              this.moveFocusRight();
              break;
          case "Backspace":
          case "Delete":
              this.inputs[this.inputIndex].value = "";
              if (keyboard.key === "Backspace") {
                  this.moveFocusLeft();
              }
              break;
          default:
              if (!this.allFilled() && this.numericPattern.test(keyboard.key)) {
                  if (this.isEmptyInput(this.inputIndex)) {
                      this.inputs[this.inputIndex].value = keyboard.key;
                  }

                  if (this.isEmptyInput(this.inputIndex + 1)) {
                      this.moveFocusRight();
                  }
              }
              break;
      }
  }

  handlePaste(e) {
      e.preventDefault();
      this.inputIndex = this.getInputIndex(e.target);

      const pasteData = e.clipboardData
          .getData("text/plain")
          .slice(0, this.inputs.length - this.inputIndex)
          .split("");

      if (pasteData.every(value => this.numericPattern.test(value))) {
          for (let i = 0; i < pasteData.length; i++) {
              this.setInputValue(this.inputIndex + i, pasteData[i]);
          }
      }
  }

  updateInputs() {
      this.inputs = document.querySelectorAll(this.selector);
  }

  isEmptyInput(inputIndex) {
      return (
          inputIndex < this.inputs.length && this.inputs[inputIndex].value === ""
      );
  }

  setInputValue(inputIndex, value) {
      if (inputIndex >= 0 && inputIndex < this.inputs.length) {
          this.inputs[inputIndex].value = value;
      }
  }

  moveFocus(direction) {
      const nextIndex = Math.min(
          Math.max(this.inputIndex + direction, 0),
          this.inputs.length - 1
      );
      this.inputs[nextIndex].focus();
      this.inputs[nextIndex].select();
  }

  moveFocusLeft() {
      this.moveFocus(-1);
  }

  moveFocusRight() {
      this.moveFocus(1);
  }

  allFilled() {
      return Array.from(this.inputs).every(input => input.value !== "");
  }

  getInputIndex(input) {
      return Array.from(this.inputs).indexOf(input);
  }

  getOTP() {
      return Array.from(this.inputs).map(input => input.value).join("");
  }

  onInputEvent(callback) {
      this.attachEvent("keydown, paste", this.selector, () => {
          callback(this.getOTP());
      });
  }
}

window.onload = () => {
  const otpInput = new OTPInputHandler(".otp-input");

  otpInput.onInputEvent((otpValue) => {
      const otpElement = document.getElementById("otpCode");
      otpElement.value = otpValue;
  });

  let timerDuration = 60; // Timer duration in seconds
  const timerDisplay = document.getElementById("timer");
  const resendBtn = document.getElementById("resendBtn");

  const startTimer = () => {
      resendBtn.classList.add("hidden");
      resendBtn.disabled = true;

      const interval = setInterval(() => {
          timerDuration--;
          timerDisplay.innerText = timerDuration;

          if (timerDuration <= 0) {
              clearInterval(interval);
              timerDisplay.innerText = "0";
              resendBtn.classList.remove("hidden");
              resendBtn.disabled = false;
          }
      }, 1000);
  };

  // Start the timer on page load
  startTimer();

  // Resend OTP button click event
  resendBtn.addEventListener("click", () => {
      // Logic to resend OTP (e.g., making an API call)
      // Reset the timer
      timerDuration = 60;
      timerDisplay.innerText = timerDuration;
      startTimer();
      // Clear the OTP inputs
      otpInput.updateInputs();
      otpInput.inputs.forEach(input => input.value = "");
  });
};
