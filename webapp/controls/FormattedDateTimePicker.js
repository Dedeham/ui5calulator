sap.ui.define([
	"sap/m/DateTimePicker",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast"
], function(DateTimePicker, DateFormat, MessageToast) {
	return DateTimePicker.extend("root.controls.FormattedDateTimePicker", {
		
		_formatter: null,

		init: function() {
			window._setInputSelection = function (oInput, iStartPos, iEndPos) {
				oInput.focus();
				if (typeof oInput.selectionStart != "undefined") {
					oInput.selectionStart = iStartPos;
					oInput.selectionEnd = iEndPos;
				} else if (document.selection && document.selection.createRange) {
					// IE branch
					oInput.select();
					var range = document.selection.createRange();
					range.collapse(true);
					range.moveEnd("character", iEndPos);
					range.moveStart("character", iStartPos);
					range.select();
				}
			};
			DateTimePicker.prototype.init.call(this, arguments);
		},

		setDisplayFormat: function(sFormat) {
			this._formatter = DateFormat.getDateInstance({ pattern: sFormat});
			DateTimePicker.prototype.setDisplayFormat.call(this, sFormat);
		},
		
		onfocusin: function (oEvent) {
			var currentDateTimePickerObject = this.$();
			if (currentDateTimePickerObject[0] !== undefined) {
				if (currentDateTimePickerObject[0].childNodes !== undefined) {
					// To run on InternetExplorer: We have to directly access the DOM object (Input field part) of the DateTimePicker 
					// In Chrome it would be sufficient to access the DateTimePicker SAPUI5 object and call selectText method on it 
					var sDisplayFormat = this.getDisplayFormat()
					var iTimeStart = sDisplayFormat.indexOf("H");
					var iTimeEnd = sDisplayFormat.length;
					var currentDateTimePickerObjectInput = currentDateTimePickerObject[0].childNodes[0];
					currentDateTimePickerObjectInput.setAttribute("onfocus", "_setInputSelection(this, " + iTimeStart + "," + iTimeEnd + ")");
				}
			}
			DateTimePicker.prototype.onfocusin.call(this, oEvent);
		},
		// Event if datetime picker loses focus
		onfocusout: function (oEvent) {
			var currentDateTimePickerObject = this.$();
			if (currentDateTimePickerObject[0].childNodes) {
				var currentDateTimePickerObjectInput = currentDateTimePickerObject[0].childNodes[0];
				var sDate = currentDateTimePickerObjectInput.value;
				var oParsedDate = this._formatter.parse(sDate);
				var oMaxDate = this.getMaxDate();
				var oMinDate = this.getMinDate();
				var bValid = true;
				var oOldDate = this.getDateValue();

				if (oParsedDate) {
					if ((oMaxDate && oParsedDate > oMaxDate) || (oMinDate && oParsedDate < oMinDate)) {
						if (oMaxDate && oParsedDate > oMaxDate) {
							this.setDateValue(oMaxDate);
							currentDateTimePickerObjectInput.value = this._formatter.format(oMaxDate);
						} else {
							this.setDateValue(oMinDate);
							currentDateTimePickerObjectInput.value = this._formatter.format(oMinDate);
						}
						this.setValueState(sap.ui.core.ValueState.None);
						bValid = false;
					} else {
						this.setDateValue(oParsedDate);
						currentDateTimePickerObjectInput.value = this._formatter.format(oParsedDate);
					}
				} else {
					// invalid input
					currentDateTimePickerObjectInput.value = this._formatter.format(this.getDateValue());
					bValid = false;
				}
			}
			if (bValid) {
				this.setValueState(sap.ui.core.ValueState.None);
				if (this.getDateValue() != oOldDate) {
					this.fireChange({ value: this.getDateValue(), valid: bValid });
				}
			} else {
				this.fireChange({ value: this.getDateValue(), valid: bValid });
			}
			DateTimePicker.prototype.onfocusout.call(this, oEvent);
		},
	});
})