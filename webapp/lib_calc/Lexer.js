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
                    var parsetrig = this.parseTrig();
                    if (parsetrig){
                        tokens = tokens.concat(parsetrig)
                        continue;
                    }
                    var parsesqrt = this.parseSqrtout();
                    if(parsesqrt){
                        tokens = tokens.concat(parsesqrt)
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
                if ("+-/*^".includes(currentChar)) {
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
            lexer.sincheck = function(){
                var sinfound = false;
                var currentindex = this.index;
                if("s" == this.getChar()){
                    this.index++
                    if("i" == this.getChar()){
                        this.index++
                        if("n" == this.getChar()){
                            sinfound = true;
                            this.index++
                        }
                    }
                }
                if(sinfound){
                    var res = this.parseBrackets();
                    return ["sin", res];
                }
                else{
                    this.index = currentindex;
                }
            }
            lexer.coscheck = function(){
                var cosfound = false;
                var currentindex = this.index;
                if("c" == this.getChar()){
                    this.index++
                    if("o" == this.getChar()){
                        this.index++
                        if("s" == this.getChar()){
                            cosfound = true;
                            this.index++
                        }
                    }
                }
                if(cosfound){
                    var res = this.parseBrackets();
                    return ["cos", res];
                }
                else{
                    this.index = currentindex;
                }
            }
            lexer.tancheck = function(){
                var tanfound = false;
                var currentindex = this.index;
                if("t" == this.getChar()){
                    this.index++
                    if("a" == this.getChar()){
                        this.index++
                        if("n" == this.getChar()){
                            tanfound = true;
                            this.index++
                        }
                    }
                }
                if(tanfound){
                    var res = this.parseBrackets();
                    return ["tan", res];
                }
                else{
                    this.index = currentindex;
                }
            }
            lexer.parseSqrt = function(){
                var sqrt = false;
                var currentindex = this.index;
                if("√" == this.getChar()){
                    sqrt = true;
                    this.index++
                }
                if("s" == this.getChar()){
                    this.index++
                    if("q" == this.getChar()){
                        this.index++
                        if("r" == this.getChar()){
                            this.index++
                            if("t" == this.getChar()){
                                sqrt = true;
                                this.index++
                            }
                        }
                    }
                }
                if(sqrt){
                    var res = this.parseBrackets();
                    return ["sqrt", res];
                }
                else{
                    this.index = currentindex;
                }
            }
            lexer.parseSqrtout = function(){
                var result = this.parseSqrt();
                if(result){
                    return result;
                }
            }
            lexer.parseTrig = function (){
                var result = this.sincheck();
                if (result) {
                    return result;
                }
                result = this.coscheck();
                if (result) {
                    return result;
                }
                result = this.tancheck()
                if (result) {
                    return result;
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