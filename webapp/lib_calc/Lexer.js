sap.ui.define([
    'sap/ui/base/Object',
], function (Object) {
    'use strict';
    var Lexer = Object.extend("xyz", {
        constructor() {
            var lexer = {};
            lexer.index = 0;
            lexer.text = "";
            lexer.parse = function (text) {
                this.text = text.replace(/\s/g, "");
                var tokens = [];
                while (this.index < this.text.length) {
                    if (")" == this.getChar()) {
                        break;
                    }
                    var parseOp = this.parseOperator();
                    if (parseOp) {
                        tokens.push(parseOp);
                        continue;
                    }
                    var brackets = this.parseBrackets();
                    if (brackets) {
                        tokens.push(brackets);
                        continue;
                    }
                    else {
                        tokens.push(this.parseNumber())
                    }
                }
                return tokens;
            };
            lexer.parseOperator = function () {
                var currentChar = this.getChar()
                if ("+-/*".includes(currentChar)) {
                    this.index++;
                    return currentChar
                } else {
                    return null;
                }
            };

            lexer.parseNumber = function () {
                var prefix = 1;

                if ("+-".includes(this.getChar())) {
                    if (this.getChar() == "-") {
                        prefix = -1
                    }
                    this.index++;
                }
                var vltsinnvoll = 0;
                var commaindex = -1;
                var processcomplete = false;
                while (this.index < this.text.length) {
                    if (/\d/.test(this.getChar())) {
                        processcomplete = true;
                        vltsinnvoll = parseFloat(this.getChar()) + vltsinnvoll * 10;
                        if (commaindex >= 0) {
                            commaindex++;
                        }
                        this.index++;
                    }
                    else if (",.".includes(this.getChar())) {
                        commaindex = 0;
                        this.index++;

                    }
                    else if (processcomplete) {
                        break;
                    }
                    else {
                        throw new Error("Da hast du wohl etwas falsch gemacht :)");
                    }
                }

                return commaindex >= 0 ? vltsinnvoll / (10 ** commaindex) : vltsinnvoll;
            };
            lexer.parseBrackets = function () {
                if ("(" == this.getChar()) {
                    this.index++;
                    var localparse = this.parse(this.text);
                    this.index++;
                    return localparse;
                }
            }
            lexer.getChar = function () {
                return this.text[this.index]
            };

            return lexer;
        },

    });
    return Lexer;
});