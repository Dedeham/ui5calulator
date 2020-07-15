sap.ui.define([
	'./ui5BaseComponents/RangeSliderRenderer',
	'./ui5BaseComponents/SliderRenderer',
	'sap/ui/core/format/DateFormat'
], function (RangeSliderRenderer, SliderRenderer, DateFormat) {

	var CHARACTER_WIDTH_PX = 5.8;

	return RangeSliderRenderer.extend('root.controls.DateSliderRenderer', {

		/**
		 * Renders the handles of the slider and the tickmarks (if they are enabled)
		 * @override to add tickmark rendering
		 */
		renderHandles: function (oRm, oControl) {
			RangeSliderRenderer.renderHandles.call(this, oRm, oControl);
			if (oControl.getShowTickMarks()) {
				this.renderTickMarks(oRm, oControl);
			}
		},

		/**
		 * Renders all tickmarks according to the calculated interval
		 */
		renderTickMarks: function (oRm, oControl) {
			var iInterval = oControl.iTickMarkScale;
			var iScale = oControl.getScale();
			var iStartDateScaled = Math.round(Number(oControl.getMinDate()) / iScale);
			var iTimeRangeScaled = oControl.getMax();
			var iOffset = Math.round(iStartDateScaled % iInterval);
			iStartDateScaled -= iOffset;

			for (var i = 0; i <= iTimeRangeScaled; i += iInterval) {
				var fPosition = ((i - iOffset) / iTimeRangeScaled) * 100;
				if (fPosition >= 0 && fPosition <= 100) {
					this.renderTickMark(oRm, fPosition, oControl._tickMarkDateToString(new Date((iStartDateScaled + i) * iScale)))
				}
			}
		},

		/**
		 * Renders a single tickmark. The style is defined in the {@link ./control-style.css} which needs to be included.
		 */
		renderTickMark: function (oRm, position, label) {
			var fTextWidth = (CHARACTER_WIDTH_PX * label.length);
			var TICKMARK_CSS_CLASS = "sliderTickMark";
			oRm.write("<div");
			oRm.addClass(TICKMARK_CSS_CLASS)
			oRm.writeClasses();
			oRm.addStyle("left", position + "%");
			oRm.addStyle("width", fTextWidth + "px");
			oRm.writeStyles();
			oRm.write("><div");

			oRm.addClass(TICKMARK_CSS_CLASS + "-inner");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write("></div>");
			oRm.write("<span");
			oRm.addClass(TICKMARK_CSS_CLASS + "-label");
			oRm.addClass("sapMSliderLabel");
			oRm.writeClasses();
			oRm.addStyle("margin", "0 -" + fTextWidth / 2 + "px");
			oRm.writeStyles();
			oRm.write(">");
			oRm.write(label);
			oRm.write("</span>")
			oRm.write("</div>")
		},


		/**
		 * renders the start label of the control if tickmarks are disabled
		 * @override to render the date instead of the raw value
		 */
		renderStartLabel: function (oRM, oControl) {
			if (oControl.getShowTickMarks()) {
				return;
			}
			oRM.write("<div");
			oRM.addClass(SliderRenderer.CSS_CLASS + "Label");
			oRM.writeClasses();
			oRM.write(">");

			oRM.write(oControl._dateToString(oControl.getMinDate()));

			oRM.write("</div>");
		},

		/**
		 * renders the end label of the control if tickmarks are disabled
		 * @override to render the date instead of the raw value
		 */
		renderEndLabel: function (oRM, oControl) {
			if (oControl.getShowTickMarks()) {
				return;
			}
			oRM.write("<div");
			oRM.addClass(SliderRenderer.CSS_CLASS + "Label");
			oRM.writeClasses();
			oRM.write(">");

			oRM.write(oControl._dateToString(oControl.getMaxDate()));

			oRM.write("</div>");
		},

		/**
		 * Renders the tooltip for the control.
		 * @override To use the date instead of the raw value
		 */
		writeHandleTooltip: function (oRm, oSlider) {
			var oDate = oSlider._convertToDate(oSlider.getValue());
			oRm.writeAttribute("title", oSlider._dateToString(oDate));
		},
	});
})