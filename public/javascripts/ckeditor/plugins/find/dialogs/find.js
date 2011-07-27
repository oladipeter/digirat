﻿/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */

(function() {
    var a;

    function b(i) {
        return i.type == CKEDITOR.NODE_TEXT && i.getLength() > 0 && (!a || !i.isReadOnly());
    }

    ;
    function c(i) {
        return!(i.type == CKEDITOR.NODE_ELEMENT && i.isBlockBoundary(CKEDITOR.tools.extend({}, CKEDITOR.dtd.$empty, CKEDITOR.dtd.$nonEditable)));
    }

    ;
    var d = function() {
        var i = this;
        return{textNode:i.textNode,offset:i.offset,character:i.textNode ? i.textNode.getText().charAt(i.offset) : null,hitMatchBoundary:i._.matchBoundary};
    },e = ['find','replace'],f = [
        ['txtFindFind','txtFindReplace'],
        ['txtFindCaseChk','txtReplaceCaseChk'],
        ['txtFindWordChk','txtReplaceWordChk'],
        ['txtFindCyclic','txtReplaceCyclic']
    ];

    function g(i) {
        var j,k,l,m;
        j = i === 'find' ? 1 : 0;
        k = 1 - j;
        var n,o = f.length;
        for (n = 0; n < o; n++) {
            l = this.getContentElement(e[j], f[n][j]);
            m = this.getContentElement(e[k], f[n][k]);
            m.setValue(l.getValue());
        }
    }

    ;
    var h = function(i, j) {
        var k = new CKEDITOR.style(CKEDITOR.tools.extend({fullMatch:true,childRule:function() {
            return false;
        }}, i.config.find_highlight)),l = function(x, y) {
            var z = new CKEDITOR.dom.walker(x);
            z.guard = y ? c : null;
            z.evaluator = b;
            z.breakOnFalse = true;
            this._ = {matchWord:y,walker:z,matchBoundary:false};
        };
        l.prototype = {next:function() {
            return this.move();
        },back:function() {
            return this.move(true);
        },move:function(x) {
            var z = this;
            var y = z.textNode;
            if (y === null)return d.call(z);
            z._.matchBoundary = false;
            if (y && x && z.offset > 0) {
                z.offset--;
                return d.call(z);
            } else if (y && z.offset < y.getLength() - 1) {
                z.offset++;
                return d.call(z);
            } else {
                y = null;
                while (!y) {
                    y = z._.walker[x ? 'previous' : 'next'].call(z._.walker);
                    if (z._.matchWord && !y || z._.walker._.end)break;
                    if (!y && !c(z._.walker.current))z._.matchBoundary = true;
                }
                z.textNode = y;
                if (y)z.offset = x ? y.getLength() - 1 : 0; else z.offset = 0;
            }
            return d.call(z);
        }};
        var m = function(x, y) {
            this._ = {walker:x,cursors:[],rangeLength:y,highlightRange:null,isMatched:false};
        };
        m.prototype = {toDomRange:function() {
            var x = new CKEDITOR.dom.range(i.document),y = this._.cursors;
            if (y.length < 1) {
                var z = this._.walker.textNode;
                if (z)x.setStartAfter(z); else return null;
            } else {
                var A = y[0],B = y[y.length - 1];
                x.setStart(A.textNode, A.offset);
                x.setEnd(B.textNode, B.offset + 1);
            }
            return x;
        },updateFromDomRange:function(x) {
            var A = this;
            var y,z = new l(x);
            A._.cursors = [];
            do{
                y = z.next();
                if (y.character)A._.cursors.push(y);
            } while (y.character)
            A._.rangeLength = A._.cursors.length;
        },setMatched:function() {
            this._.isMatched = true;
        },clearMatched:function() {
            this._.isMatched = false;
        },isMatched:function() {
            return this._.isMatched;
        },highlight:function() {
            var A = this;
            if (A._.cursors.length < 1)return;
            if (A._.highlightRange)A.removeHighlight();
            var x = A.toDomRange(),y = x.createBookmark();
            k.applyToRange(x);
            x.moveToBookmark(y);
            A._.highlightRange = x;
            var z = x.startContainer;
            if (z.type != CKEDITOR.NODE_ELEMENT)z = z.getParent();
            z.scrollIntoView();
            A.updateFromDomRange(x);
        },removeHighlight:function() {
            var y = this;
            if (!y._.highlightRange)return;
            var x = y._.highlightRange.createBookmark();
            k.removeFromRange(y._.highlightRange);
            y._.highlightRange.moveToBookmark(x);
            y.updateFromDomRange(y._.highlightRange);
            y._.highlightRange = null;
        },isReadOnly:function() {
            if (!this._.highlightRange)return 0;
            return this._.highlightRange.startContainer.isReadOnly();
        },moveBack:function() {
            var z = this;
            var x = z._.walker.back(),y = z._.cursors;
            if (x.hitMatchBoundary)z._.cursors = y = [];
            y.unshift(x);
            if (y.length > z._.rangeLength)y.pop();
            return x;
        },moveNext:function() {
            var z = this;
            var x = z._.walker.next(),y = z._.cursors;
            if (x.hitMatchBoundary)z._.cursors = y = [];
            y.push(x);
            if (y.length > z._.rangeLength)y.shift();
            return x;
        },getEndCharacter:function() {
            var x = this._.cursors;
            if (x.length < 1)return null;
            return x[x.length - 1].character;
        },getNextCharacterRange:function(x) {
            var y,z,A = this._.cursors;
            if ((y = A[A.length - 1]) && y.textNode)z = new l(n(y)); else z = this._.walker;
            return new m(z, x);
        },getCursors:function() {
            return this._.cursors;
        }};
        function n(x, y) {
            var z = new CKEDITOR.dom.range();
            z.setStart(x.textNode, y ? x.offset : x.offset + 1);
            z.setEndAt(i.document.getBody(), CKEDITOR.POSITION_BEFORE_END);
            return z;
        }

        ;
        function o(x) {
            var y = new CKEDITOR.dom.range();
            y.setStartAt(i.document.getBody(), CKEDITOR.POSITION_AFTER_START);
            y.setEnd(x.textNode, x.offset);
            return y;
        }

        ;
        var p = 0,q = 1,r = 2,s = function(x, y) {
            var z = [-1];
            if (y)x = x.toLowerCase();
            for (var A = 0; A < x.length; A++) {
                z.push(z[A] + 1);
                while (z[A + 1] > 0 && x.charAt(A) != x.charAt(z[A + 1] - 1))z[A + 1] = z[z[A + 1] - 1] + 1;
            }
            this._ = {overlap:z,state:0,ignoreCase:!!y,pattern:x};
        };
        s.prototype = {feedCharacter:function(x) {
            var y = this;
            if (y._.ignoreCase)x = x.toLowerCase();
            for (; ;) {
                if (x == y._.pattern.charAt(y._.state)) {
                    y._.state++;
                    if (y._.state == y._.pattern.length) {
                        y._.state = 0;
                        return r;
                    }
                    return q;
                } else if (!y._.state)return p; else y._.state = y._.overlap[y._.state];
            }
            return null;
        },reset:function() {
            this._.state = 0;
        }};
        var t = /[.,"'?!;: \u0085\u00a0\u1680\u280e\u2028\u2029\u202f\u205f\u3000]/,u = function(x) {
            if (!x)return true;
            var y = x.charCodeAt(0);
            return y >= 9 && y <= 13 || y >= 8192 && y <= 8202 || t.test(x);
        },v = {searchRange:null,matchRange:null,find:function(x, y, z, A, B, C) {
            var L = this;
            if (!L.matchRange)L.matchRange = new m(new l(L.searchRange), x.length); else {
                L.matchRange.removeHighlight();
                L.matchRange = L.matchRange.getNextCharacterRange(x.length);
            }
            var D = new s(x, !y),E = p,F = '%';
            while (F !== null) {
                L.matchRange.moveNext();
                while (F = L.matchRange.getEndCharacter()) {
                    E = D.feedCharacter(F);
                    if (E == r)break;
                    if (L.matchRange.moveNext().hitMatchBoundary)D.reset();
                }
                if (E == r) {
                    if (z) {
                        var G = L.matchRange.getCursors(),H = G[G.length - 1],I = G[0],J = new l(o(I), true),K = new l(n(H), true);
                        if (!(u(J.back().character) && u(K.next().character)))continue;
                    }
                    L.matchRange.setMatched();
                    if (B !== false)L.matchRange.highlight();
                    return true;
                }
            }
            L.matchRange.clearMatched();
            L.matchRange.removeHighlight();
            if (A && !C) {
                L.searchRange = w(true);
                L.matchRange = null;
                return arguments.callee.apply(L, Array.prototype.slice.call(arguments).concat([true]));
            }
            return false;
        },replaceCounter:0,replace:function(x, y, z, A, B, C, D) {
            var I = this;
            a = 1;
            var E = false;
            if (I.matchRange && I.matchRange.isMatched() && !I.matchRange._.isReplaced && !I.matchRange.isReadOnly()) {
                I.matchRange.removeHighlight();
                var F = I.matchRange.toDomRange(),G = i.document.createText(z);
                if (!D) {
                    var H = i.getSelection();
                    H.selectRanges([F]);
                    i.fire('saveSnapshot');
                }
                F.deleteContents();
                F.insertNode(G);
                if (!D) {
                    H.selectRanges([F]);
                    i.fire('saveSnapshot');
                }
                I.matchRange.updateFromDomRange(F);
                if (!D)I.matchRange.highlight();
                I.matchRange._.isReplaced = true;
                I.replaceCounter++;
                E = true;
            } else E = I.find(y, A, B, C, !D);
            a = 0;
            return E;
        }};

        function w(x) {
            var y,z = i.getSelection(),A = i.document.getBody();
            if (z && !x) {
                y = z.getRanges()[0].clone();
                y.collapse(true);
            } else {
                y = new CKEDITOR.dom.range();
                y.setStartAt(A, CKEDITOR.POSITION_AFTER_START);
            }
            y.setEndAt(A, CKEDITOR.POSITION_BEFORE_END);
            return y;
        }

        ;
        return{title:i.lang.findAndReplace.title,resizable:CKEDITOR.DIALOG_RESIZE_NONE,minWidth:350,minHeight:165,buttons:[CKEDITOR.dialog.cancelButton],contents:[
            {id:'find',label:i.lang.findAndReplace.find,title:i.lang.findAndReplace.find,accessKey:'',elements:[
                {type:'hbox',widths:['230px','90px'],children:[
                    {type:'text',id:'txtFindFind',label:i.lang.findAndReplace.findWhat,isChanged:false,labelLayout:'horizontal',accessKey:'F'},
                    {type:'button',align:'left',style:'width:100%',label:i.lang.findAndReplace.find,onClick:function() {
                        var x = this.getDialog();
                        if (!v.find(x.getValueOf('find', 'txtFindFind'), x.getValueOf('find', 'txtFindCaseChk'), x.getValueOf('find', 'txtFindWordChk'), x.getValueOf('find', 'txtFindCyclic')))alert(i.lang.findAndReplace.notFoundMsg);
                    }}
                ]},
                {type:'vbox',padding:0,children:[
                    {type:'checkbox',id:'txtFindCaseChk',isChanged:false,style:'margin-top:28px',label:i.lang.findAndReplace.matchCase},
                    {type:'checkbox',id:'txtFindWordChk',isChanged:false,label:i.lang.findAndReplace.matchWord},
                    {type:'checkbox',id:'txtFindCyclic',isChanged:false,'default':true,label:i.lang.findAndReplace.matchCyclic}
                ]}
            ]},
            {id:'replace',label:i.lang.findAndReplace.replace,accessKey:'M',elements:[
                {type:'hbox',widths:['230px','90px'],children:[
                    {type:'text',id:'txtFindReplace',label:i.lang.findAndReplace.findWhat,isChanged:false,labelLayout:'horizontal',accessKey:'F'},
                    {type:'button',align:'left',style:'width:100%',label:i.lang.findAndReplace.replace,onClick:function() {
                        var x = this.getDialog();
                        if (!v.replace(x, x.getValueOf('replace', 'txtFindReplace'), x.getValueOf('replace', 'txtReplace'), x.getValueOf('replace', 'txtReplaceCaseChk'), x.getValueOf('replace', 'txtReplaceWordChk'), x.getValueOf('replace', 'txtReplaceCyclic')))alert(i.lang.findAndReplace.notFoundMsg);
                    }}
                ]},
                {type:'hbox',widths:['230px','90px'],children:[
                    {type:'text',id:'txtReplace',label:i.lang.findAndReplace.replaceWith,isChanged:false,labelLayout:'horizontal',accessKey:'R'},
                    {type:'button',align:'left',style:'width:100%',label:i.lang.findAndReplace.replaceAll,isChanged:false,onClick:function() {
                        var x = this.getDialog(),y;
                        v.replaceCounter = 0;
                        v.searchRange = w(true);
                        if (v.matchRange) {
                            v.matchRange.removeHighlight();
                            v.matchRange = null;
                        }
                        i.fire('saveSnapshot');
                        while (v.replace(x, x.getValueOf('replace', 'txtFindReplace'), x.getValueOf('replace', 'txtReplace'), x.getValueOf('replace', 'txtReplaceCaseChk'), x.getValueOf('replace', 'txtReplaceWordChk'), false, true)) {
                        }
                        if (v.replaceCounter) {
                            alert(i.lang.findAndReplace.replaceSuccessMsg.replace(/%1/, v.replaceCounter));
                            i.fire('saveSnapshot');
                        } else alert(i.lang.findAndReplace.notFoundMsg);
                    }}
                ]},
                {type:'vbox',padding:0,children:[
                    {type:'checkbox',id:'txtReplaceCaseChk',isChanged:false,label:i.lang.findAndReplace.matchCase},
                    {type:'checkbox',id:'txtReplaceWordChk',isChanged:false,label:i.lang.findAndReplace.matchWord},
                    {type:'checkbox',id:'txtReplaceCyclic',isChanged:false,'default':true,label:i.lang.findAndReplace.matchCyclic}
                ]}
            ]}
        ],onLoad:function() {
            var x = this,y,z,A = false;
            this.on('hide', function() {
                A = false;
            });
            this.on('show', function() {
                A = true;
            });
            this.selectPage = CKEDITOR.tools.override(this.selectPage, function(B) {
                return function(C) {
                    B.call(x, C);
                    var D = x._.tabs[C],E,F,G;
                    F = C === 'find' ? 'txtFindFind' : 'txtFindReplace';
                    G = C === 'find' ? 'txtFindWordChk' : 'txtReplaceWordChk';
                    y = x.getContentElement(C, F);
                    z = x.getContentElement(C, G);
                    if (!D.initialized) {
                        E = CKEDITOR.document.getById(y._.inputId);
                        D.initialized = true;
                    }
                    if (A)g.call(this, C);
                };
            });
        },onShow:function() {
            v.searchRange = w();
            this.selectPage(j);
        },onHide:function() {
            var x;
            if (v.matchRange && v.matchRange.isMatched()) {
                v.matchRange.removeHighlight();
                i.focus();
                x = v.matchRange.toDomRange();
                if (x)i.getSelection().selectRanges([x]);
            }
            delete v.matchRange;
        },onFocus:function() {
            if (j == 'replace')return this.getContentElement('replace', 'txtFindReplace'); else return this.getContentElement('find', 'txtFindFind');
        }};
    };
    CKEDITOR.dialog.add('find', function(i) {
        return h(i, 'find');
    });
    CKEDITOR.dialog.add('replace', function(i) {
        return h(i, 'replace');
    });
})();
