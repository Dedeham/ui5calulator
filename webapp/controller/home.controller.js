sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"root/lib_calc/Lexer"
], function (Controller, JSONModel, Lexer) {
	"use strict";

	return Controller.extend("UIUI5 Calculator\webapp\controller.home", {
		onInit: function () {
			var inputModel = new JSONModel({
				"expression": ""
			});
			this.getView().setModel(inputModel, "inputModel");

		},
		calc: function (list) {
			if (typeof list == "object") {
				for (let e = 0; e < list.length; e++) {
					if (typeof list[e] == "object") {
						list[e]  = this.calc(list[e]);
					}
				}
				var postFix = changeToPostfix(list);
				var result = evaluatePostFix(postFix);
				return result;
			}
			else {
				alert("da gibt es wohl ein kleines problem, es wurde keine liste eingegeben.")
			}
		},
		//spalte komplett ausleeren
		clearInput: function () {
			this.getView().getModel("inputModel").setProperty("/expression", ""); //setzte textfeld auf ""
		},
		//in spalte einfügen
		editInput: function (ch) {
			var expression = this.getView().getModel("inputModel").getProperty("/expression");
			if ("+/*-".indexOf(ch) == -1) {
				expression += ch; // wenn "#-*/" nicht vorhanden ist, dann hinzufügen von zahlen
			} else {
				expression += (" " + ch + " "); //else -> wenn vorhanden ist, dann operatoren hizufügen
			}
			this.getView().getModel("inputModel").setProperty("/expression", expression);
		},
		//ergebnis berechnen
		validCompute: function () {
			var expression = this.getView().getModel("inputModel").getProperty("/expression");
			try {

				var lexer = Lexer();
				var expList = lexer.parse(expression);
			}
			catch (parseerror) {
				sap.m.MessageToast.show(parseerror.message)
			}
			if (isValid(expList) && expList.length) {
				var result = this.calc(expList);
				if (result != null) {
					this.getView().getModel("inputModel").setProperty("/expression", result);
					return;
				}
			}
			alert("Kein Vollständiger ausdruck!");

		}

	});
});
var isValid = function (expList) {
	for (var i = 1; i < expList.length; ++i) {
		if (("+-/*^".indexOf(expList[i - 1]) !== -1) && ("+-/*^".indexOf(expList[i]) !== -1))
			return false;
	}
	console.log(expList[expList.length - 1]);
	return ("+-/*^".indexOf(expList[expList.length - 1]) === -1);
}
var changeToPostfix = function (expression) {

	var postFix = new Array();
	var stack = new Array();
	var precedence = {
		"+": 1,
		"-": 1,
		"/": 2,
		"*": 2,
		"": 2,
		"^": 3
	}

	expression.forEach(element => {

		if ("+-/*^".indexOf(element) == -1) {
			postFix.push(element);
		} else {

			while (stack.length != 0 && precedence[stack[stack.length - 1]] > precedence[element]) {
				postFix.push(stack.pop());
			}

			stack.push(element);
		}

	});
	while (stack.length > 0)
		postFix.push(stack.pop());

	return postFix;
}
var evaluatePostFix = function (postFix) {

	var stack = Array();
	postFix.forEach(elements => {
		if ("+-/*^".indexOf(elements) == -1) {
			stack.push(parseFloat(elements));
		} else {
			if (stack.length < 2)
				return null;
			var a = stack.pop();

			var b = stack.pop();
			stack.push(performOperation(b, a, elements));
		}
	});
	return stack.pop();
}
var performOperation = function (a, b, operator) {
	switch (operator) {
		case "*":
			return parseFloat(a) * parseFloat(b);
		case "-":
			return parseFloat(a) - parseFloat(b);
		case "/":
			return parseFloat(a) / parseFloat(b);
		case "+":
			return parseFloat(a) + parseFloat(b);
		case "^":
			return Math.pow(parseFloat(a), parseFloat(b));
		default:
			alert("Math Fehler");
			return null;
	}
}