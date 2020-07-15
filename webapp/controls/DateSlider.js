sap.ui.define([
	'./ui5BaseComponents/RangeSlider',
	'sap/ui/core/format/DateFormat',
], function (RangeSlider, DateFormat) {

	var CHARACTER_WIDTH_PX = 7.5;

	/**
	 * A custom RangeSlider that allows the selection
	 * of date Ranges.
	 */
	return RangeSlider.extend('root.controls.DateSlider', {
		metadata: {
			properties: {

				/**
				 * The scale of time. Default is seconds (1000).
				 * The scaled value is calculated by Number(date)/scale
				 */
				scale: { type: "float", defaultValue: 1000 },

				/**
				 * Formatter string for the date
				 */
				dateFormat: { type: "string", defaultValue: "dd.MM.yyyy HH:mm:ss" },

				/**
				 * Maximum number of displayed Tickmarks
				 */
				maxTickMarks: { type: "int", defaultValue: 20 },

				/**
				 * Minimum date for the slider
				 */
				minDate: { type: "object" },

				/**
				 * Maximum date for the slider
				 */
				maxDate: { type: "object" },

				/**
				 * Selected Date Range
				 */
				dateRange: { type: "object[]", defaultValue: [new Date(), new Date()] },

				/**
				 * If tickmarks should be shown or not
				 */
				showTickMarks: { type: "boolean", defaultValue: true },

				/**
				 * Configuration for the scaling in seconds of the tickmarks.
				 * Each entry represents one scaling entry with the specified date time format.
				 */
				tickMarkConfig: {
					type: "object[]", defaultValue: [
						{ scale: 1, format: "mm:ss" },
						{ scale: 10, format: "mm:ss" },
						{ scale: 60, format: "HH:mm" },
						{ scale: 60 * 2, format: "HH:mm" },
						{ scale: 60 * 5, format: "HH:mm" },
						{ scale: 60 * 10, format: "HH:mm" },
						{ scale: 60 * 20, format: "HH:mm" },
						{ scale: 60 * 30, format: "HH:mm" },
						{ scale: 60 * 60, format: "HH:mm" },
						{ scale: 60 * 60 * 2, format: "dd HH:mm" },
						{ scale: 60 * 60 * 4, format: "dd HH:mm" },
						{ scale: 60 * 60 * 8, format: "dd HH:mm" },
						{ scale: 60 * 60 * 24, format: "dd.MM.yyyy" },
						{ scale: 60 * 60 * 24 * 2, format: "dd.MM.yyyy" },
						{ scale: 60 * 60 * 24 * 4, format: "dd.MM.yyyy" },
						{ scale: 60 * 60 * 24 * 10, format: "dd.MM.yyyy" }
					]
				},
			}
		},

		iOffset: 0,
		iTickMarkScale: 1,
		sTickMarkFormat: "dd.MM.yy HH:mm:ss",
		oTickMarkFormatter: undefined,
		oDateFormatter: undefined,

		init: function() {
			this.setScale(this.getScale());

			RangeSlider.prototype.init.call(this, arguments);
		},

		/**
		 * Calculates the label size by using the date formatter string
		 * @augments RangeSlider.onBeforeRendering
		 */
		onBeforeRendering: function () {
			RangeSlider.prototype.onBeforeRendering.call(this, arguments);

			this._iLongestRangeTextWidth = this.getDateFormat().length * CHARACTER_WIDTH_PX;
		},

		/**
		 * wrapper to set the step size and update all depending values
		 * @param {number} iScale - the scale of the time (step size)
		 */
		setScale: function (iScale) {
			this.setProperty("scale", iScale);
			var oMinDate = this.getMinDate();
			if (oMinDate) {
				this.setMinDate(oMinDate);
			}
		},

		/**
		 * wrapper to set the tick mark config and adjust the timemark scale
		 * @param {Array<object>} aConfigArray
		 */
		setTickMarkConfig: function (aConfigArray) {
			this.setProperty("tickMarkConfig", aConfigArray);
			this._adjustTickmarkScale();
		},

		/**
		 * Wrapper to set the format for the date and the formatter
		 * @param {string} sFormat - the format of the date
		 */
		setDateFormat: function (sFormat) {
			this.oDateFormatter = DateFormat.getDateInstance({ pattern: sFormat });
			this.setProperty("dateFormat", sFormat);
		},

		/**
		 * Wrapper logic to set the min date and calculate the minimum slider value
		 * @param {Date} oStartDate - Start date for the slider
		 */
		setMinDate: function (oStartDate) {
			if (!oStartDate) {
				throw new Error("the minDate property can't be null or undefined");
			}
			var iOffset = Math.round(Number(oStartDate) / this.getScale());
			this.iOffset = iOffset;
			this.setMin(0);
			this.setProperty("minDate", oStartDate, true);
			this.setDateRange(this.getDateRange());
			var oMaxDate = this.getMaxDate();
			if (oMaxDate) {
				this.setMaxDate(oMaxDate);
			}
		},

		/**
		 * Wrapper logic to set the max date adn the max slider value
		 * @param {Date} oEndDate - end date for the slider
		 */
		setMaxDate: function (oEndDate) {
			if (!oEndDate) {
				throw new Error("the maxDate property can't be null or undefined");
			}
			var iScale = this.getScale();
			var iOffset;
			if (this.iOffset > 0) {
				iOffset = this.iOffset;
			} else {
				iOffset = Math.round(Number(this.getMaxDate()) / iScale);
			}
			var iEndDateScaled = Math.round(Number(oEndDate) / iScale);
			if (iEndDateScaled - iOffset == 0) {
				this.setMax(1)
			} else {
				this.setMax(iEndDateScaled - iOffset);
			}
			this._adjustTickmarkScale();
			this.setProperty("maxDate", oEndDate, true);
			var aDateRange = this.getDateRange();
			if (aDateRange) {
				this.setDateRange(aDateRange);
			}
		},

		/**
		 * Wrapper logic to set the date range and update the range
		 * @param {Date[]} aDates - array of the two dates for the range
		 * @param {boolean} noRangeUpdate - if the range should be updated. This flag is used to avoid another update 
		 * of the range when the dates are derived from the range
		 */
		setDateRange: function (aDates, noRangeUpdate) {
			if (!aDates || aDates.length < 2) {
				throw new Error("Expected a dateRange with two dates. Got " + aDates.toString())
			}

			var iOffset;
			if (this.iOffset > 0) {
				iOffset = this.iOffset;
			} else {
				iOffset = Math.round(Number(this.getMinDate()) / this.getScale());
			}
			var iRangeStart = Math.round(Number(aDates[0]) / this.getScale()) - iOffset;
			var iRangeEnd = Math.round(Number(aDates[1]) / this.getScale()) - iOffset;
			this.setProperty("dateRange", aDates, true);
			if (!noRangeUpdate) {
				this.setRange([iRangeStart, iRangeEnd]);
			}
		},

		/**
		 * Adjusts the scale of the tickmarks to the configured TickMarkConfig.
		 * The first value that results in less tickmarks than the configured max value is being chosen
		 */
		_adjustTickmarkScale: function () {
			var iTimeRangeScaled = this.getMax();
			var iTickMarkCount = this.getMaxTickMarks();
			var aTickMarkConfig = this.getTickMarkConfig();
			var iScale = this.getScale();
			for (var iConfIndex in aTickMarkConfig) {
				var oConf = aTickMarkConfig[iConfIndex];
				var iNormalizedScale = (oConf.scale * 1000) / iScale;
				if ((iTimeRangeScaled / iNormalizedScale) <= iTickMarkCount && iNormalizedScale >= 1) {
					this.sTickMarkFormat = oConf.format;
					this.iTickMarkScale = iNormalizedScale;
					this.oTickMarkFormatter = DateFormat.getDateInstance({ pattern: oConf.format });
					return;
				}
			}
		},

		/**
		 * Triggers the liveChange event of the Slider
		 * @override Overridden to use the dateRange as well
		 */
		_triggerLiveChange: function () {
			var aRange = this.getRange();

			if (aRange[0] > (aRange[1])) {
				this.setRange(aRange.reverse());
				return;
			}
			var oStartDate = new Date((aRange[0] + this.iOffset) * this.getScale());
			var oEndDate = new Date((aRange[1] + this.iOffset) * this.getScale());
			var aDateRange = [oStartDate, oEndDate];
			this.setDateRange(aDateRange, true);
			this._liveChangeLastValue = this._liveChangeLastValue || [];

			bFireLiveChange = aDateRange.some(function (fValue, index) {
				return fValue !== this._liveChangeLastValue[index];
			}, this);


			if (bFireLiveChange) {
				this._liveChangeLastValue = aDateRange.slice();
				this.fireLiveChange({ dateRange: aDateRange, range: aRange });
			}
		},

		/**
		 * Adds the date range to the change event
		 * @augments RangeSlider.fireChange
		 */
		fireChange: function (oParam) {
			oParam.dateRange = this.getDateRange();
			RangeSlider.prototype.fireChange.call(this, oParam);
		},

		/**
		 * adds the date range to the param for the event
		 * @param {object} oParam 
		 */
		_fireChangeAndLiveChange: function (oParam) {
			var aRange = oParam.range;
			var aRange = this.getRange();
			var oStartDate = new Date((aRange[0] + this.iOffset) * this.getScale());
			var oEndDate = new Date((aRange[1] + this.iOffset) * this.getScale());
			var aDateRange = [oStartDate, oEndDate];
			oParam.dateRange = aDateRange;
			this.fireChange(oParam);
			this.fireLiveChange(oParam);
		},

		/**
		 * Updates the tooltip to the new date value
		 * @override
		 * @param {object} oTooltip 
		 * @param {float} fNewValue 
		 */
		_updateTooltipContent: function (oTooltip, fNewValue) {
			var bInputTooltips = this.getInputsAsTooltips(),
				sNewValue = this._dateToString(this._convertToDate(fNewValue));

			if (!bInputTooltips) {
				oTooltip.text(sNewValue);
			} else if (bInputTooltips && oTooltip.getValue() !== sNewValue) {
				oTooltip.setValue(sNewValue);
				oTooltip.$("inner").attr("value", sNewValue);
			}
		},

		/**
		 * Checks if the handles aren't swapped or at the same position after the update
		 * and updates the handle
		 * @param {object} oHandle 
		 * @param {float} fValue 
		 */
		_updateHandle: function (oHandle, fValue) {
			var aRange = this.getRange();
			var bIsStartHandle = this._mHandleTooltip.start.handle === oHandle;

			if ((bIsStartHandle && Math.round(fValue) < aRange[1]) || (!bIsStartHandle && Math.round(fValue) > aRange[0])) {
				RangeSlider.prototype._updateHandle.call(this, oHandle, fValue);
			}
		},

		/**
		 * converts a scaled slider value back to a date value
		 * @param {number} value - scaled value
		 */
		_convertToDate: function (value) {
			return new Date(this.getScale() * (value + this.iOffset));
		},

		/**
		 * formats a date by using the predefined formatter string
		 * @param {Date} oDate - the date to format
		 */
		_dateToString: function (oDate) {
			if (!this.oDateFormatter) {
				this.oDateFormatter = DateFormat.getDateInstance({ pattern: this.getDateFormat() });
			}
			return this.oDateFormatter.format(oDate);
		},

		/**
		 * formats the date by using the tickmark formatter string
		 * @param {Date} oDate - the date to format
		 */
		_tickMarkDateToString: function (oDate) {
			if (!this.oTickMarkFormatter) {
				this.oTickMarkFormatter = DateFormat.getDateInstance({ pattern: this.sTickMarkFormat });
			}
			return this.oTickMarkFormatter.format(oDate);
		},
	});
});