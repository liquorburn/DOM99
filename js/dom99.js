//dom99.js
/*uses es6
globals: window, document, console*/
/*todo  improve system
more examples, readme */

const dom99Config = (function () {
    "use strict";
    /*this configuration will be split in another file when it is open to extension and closed to changes*/
    const 
        miss = Symbol(),
        
        getValueElseDefaultDecorator = function (object1) {
            /*Decorator function around an Object to provide a default value
            Decorated object must have a miss key with the default value associated
            
            traditional use: 
                let a = objectName[c];
            getValueElseDefaultDecorator use
                let objectNameElseDefault = getValueElseDefaultDecorator(objectName);
                ...
                let a = objectNameElseDefault(c); 
                
            */
            return (function (key) {
                if (object1.hasOwnProperty(key)) {
                    return object1[key];
                } // else
                return object1.miss; // correct syntax ?
                // return object[miss]; always undefined
            });
        },
        
        EventForTagAndType = getValueElseDefaultDecorator({
            //tag.type: eventType
            "input.text": "input",
            "input.checkbox": "click",
            "input.radio": "click",
            miss: "input"
        }),
    
        PropertyForTag = getValueElseDefaultDecorator({
            //Input Type : appropriate property name to retrieve and set the value
            "input": "value",
            "textarea": "value",
            miss: "textContent"
        }),
    
        PropertyForInputType = getValueElseDefaultDecorator({
            //Input Type : appropriate property name to retrieve and set the value
            "checkbox": "checked",
            "radio": "checked",
            miss: "value"
        }),
    
        PropertyBooleanList = [
            /* add here all relevant boolean properties*/
            "checked"
        ],
        
        getVisibleProperty = function (tagName, type) {
        /*if the element is an <input> its VisibleProperty is "value"
        for other elements like <p> it is "textContent*/
            if (tagName === "input" && type) {
                return PropertyForInputType(type); 
            } // else
            return PropertyForTag(tagName);
        };
    
    return Object.freeze({
        EventForTagAndType,
        getVisibleProperty,
        PropertyBooleanList
    });
}());

const dom99 = (function () {
    "use strict";
    let variables = {},
        variablesSubscribers = {},/*contains arrays of elements , each array 
        contains all elements that listen to the same variable. */
        elements = {},
        functions = {},
        usingInnerScope = false,
        innerScope;
        
    const 
        directiveNameFx = "data-fx",
        directiveNameVr = "data-vr",
        directiveNameEl = "data-el",
        attributeValueDoneSign = "☀",
        tokenSeparator = "-",
 
        walkTheDomElements = function (element, aFunction) {
            aFunction(element);
            element = element.firstElementChild;
            while (element) {
                walkTheDomElements(element, aFunction);
                element = element.nextSibling;
            }
        },
        
        getTagName = function (element) {
            return element.tagName.toLowerCase();
        },
    
        addEventListener = function (element, eventName, aFunction, useCapture=false) {
            //add here attachEvent for old IE if you want
            element.addEventListener(eventName, aFunction, useCapture);
        },
    
        /*not used, tested yet
        onceAddEventListener = function (element, eventName, aFunction, useCapture=false) {
            let tempFunction = function (event) {
                //called once only
                aFunction(event);
                element.removeEventListener(eventName, tempFunction, useCapture);
            };
            addEventListener(element, eventName, tempFunction, useCapture);
        },*/
    
        applyFx = function (element, directiveTokens) {
            /*directiveTokens example : ["keyup,click", "calculate"] */
            let eventNames = directiveTokens[0],
                functionName = directiveTokens[1],
                /*functionLookUp allows us to store function in dom99.fx after 
                dom99.linkJsAndDom() */
                functionLookUp = function(event) {
                    functions[functionName](event);
                };
            if (!eventNames || !functionName) {
                console.warn('Use data-fx="event1,event2-functionName" format. Empty string found');
            }
            
            eventNames.split(",").forEach(function (eventName) {
                addEventListener(element, eventName, functionLookUp);
            });
            
        },
    
        applyVr = function (element, directiveTokens) {
            /* two-way bind
            example : called for <input data-99-var="a" >
            in this example the variableName = "a"
            we push the <input data-99-var="a" > element in the array
            that holds all elements which share this same "a" variable
            everytime "a" is changed we change all those elements values
            and also 1 private js variable (named x below) 
            The public dom99.vr.a variable returns this private js variable
            
            undefined assignment are ignored, instead use empty string( more DOM friendly)*/
            let variableName = directiveTokens[0],
                temp,
                variablesScope = variables,
                variablesSubscribersScope = variablesSubscribers,
                visibleTextPropertyName,
                tagName = getTagName(element);
            
            
            //for template cloning, we use a grouped scope
            if (usingInnerScope) {
                variablesScope = variables[innerScope];
                variablesSubscribersScope = variablesSubscribers[innerScope];
            }
            
            /*we check if the user already saved data in variablesScope[variableName]
            before using linkJsAndDom , if that is the case we
            initialize variablesScope[variableName] with that same data once we defined
            our custom property*/
            if (variablesScope.hasOwnProperty(variableName)) {
                temp = variablesScope[variableName];
            }
            
            if (variablesSubscribersScope[variableName]) {
                variablesSubscribersScope[variableName].push(element);
            } else {
                let x; // holds the value
                variablesSubscribersScope[variableName] = [element];
                Object.defineProperty(variablesScope, variableName, {
                    get: function () {
                        return x;
                    },
                    set: function (newValue) {
                        if (newValue === undefined) {
                            console.warn("Use strings values with dom99.vr.x= , not undefined!");
                            return;
                        }
                        x = String(newValue);
                        variablesSubscribersScope[variableName].forEach(function (currentElement) {
                            /*here we change the value of the currentElement in the dom
                            */
                            visibleTextPropertyName = dom99Config.getVisibleProperty(
                                getTagName(currentElement), 
                                currentElement.type
                            );
                            //don't overwrite the same
                            if (String(currentElement[visibleTextPropertyName]) !== x) {
                                if (visibleTextPropertyName in dom99Config.PropertyBooleanList) {
                                    //"false" is truthy ...
                                    currentElement[visibleTextPropertyName] = !!newValue; 
                                } else {
                                    currentElement[visibleTextPropertyName] = x;
                                }
                            }
                        });
                    },
                    enumerable: true,
                    configurable: false
                    //doesn't make sense to have a value property: __value__ because the get and set is a logical value in a way
                });
            }
            
            if (temp !== undefined) {
                variablesScope[variableName] = temp; //calls the set once
            }
            visibleTextPropertyName = dom99Config.getVisibleProperty(tagName, element.type);
            
            //suggestion: could check if the tagName is in a list with all element that can be changed by the user
            addEventListener(element, 
                dom99Config.EventForTagAndType(`${getTagName(element)}.${element.type}`),
                function (event) {
                    variablesScope[variableName] = event.target[visibleTextPropertyName];
            });
        },
    
        applyEl = function (element, directiveTokens) {
            /* stores element for direct access !*/
            let elementName = directiveTokens[0],
                elementsScope = elements;
                
            //for template cloning, we use a grouped scope
            if (usingInnerScope) {
                elementsScope = elements[innerScope];
            }
            if (elementsScope[elementName]) {
                console.warn(`cannot have 2 elements with the same name, overwriting dom99.el.${elementName}`);
            }
            elementsScope[elementName] = element;
        },
        
        templateRender = function (templateName, scope) {
        /*takes a template element name as argument, usually linking to a <template>
        clones the content and returns that clone
        the content elements with "data-vr" will share a variable at
        dom99.vr[scope][variableName]
        the content elements with "data-el" will have a reference at
        dom99.el[scope][elementName]
        that way you can render a template multiple times, populate clone data
        and have it not shared between all clones.
        
        returns clone
        
        suggestion: maybe generate automatice scope names internally
        */
            //create the scope
            if (!variables.hasOwnProperty(scope)){
                elements[scope] = {};
                variables[scope] = {};
                variablesSubscribers[scope] = {};
            } else {
                console.warn(`templateRender with scope=${scope} is already taken, you must change the scope if you want to have data not shared between all clones`);
            }
            usingInnerScope = true;
            //innerScope is used for the grouped scope
            innerScope = scope;
            
            //make a clone ,clone is a DocumentFragment object
            let clone = document.importNode(elements[templateName].content, true);
           
            // apply dom99 directives with the scope
            linkJsAndDom(clone);
            usingInnerScope = false;
            
            
            return clone;
        },
    
        forgetScope = function (scope) {
            /*Removing a DOM element with .remove() or .innerHTML = "" will NOT delete
            all the element references if you used the underlying nodes in dom99
            A removed element will continue receive invisible automatic updates 
            it also takes space in the memory.
            
            And all of this doesn't matter for 1-100 elements
            
            It can matter in single page application where you CONSISTENTLY use 
            
                1. dom99.templateRender 
                2. populate the result with data
                3. somewhat later delete the result
                
            In that case I recommend using an additional step
            
                4. Use dom99.forgetScope to let the garbage collector free space in memory
                (can also improve performance but it doesn't matter here, read optimize optimization)
            
            Note: If you have yet another reference to the element in a variable in your program, the element will still exist and we cannot clean it up from here.
            
            Internally we just deleted the scope group for every relevant function
            (for instance binds are not scope grouped)
            */
            delete elements[scope];
            delete variables[scope];
            delete variablesSubscribers[scope];
        },
        
        tryApplyDirective = function (element, customAttribueName, ApplyADirective) {
            let customAttributeValue;
            if (element.hasAttribute(customAttribueName)) {
                customAttributeValue = element.getAttribute(customAttribueName);
                if (!customAttributeValue.startsWith(attributeValueDoneSign)) {
                    ApplyADirective(element, customAttributeValue.split(tokenSeparator));
                    // ensure the directive is only applied once
                    element.setAttribute(customAttribueName, attributeValueDoneSign + customAttributeValue);
                }
            }
        },
    
        tryApplyDirectives = function (element) {
        /* looks if the element has dom99 specific attributes and tries to handle it*/
                if (element.hasAttribute) {
                /*the order matters here, applyVr being first,
                we can use the just changed live variable in the bind function*/

                tryApplyDirective(element, directiveNameVr, applyVr);
                tryApplyDirective(element, directiveNameFx, applyFx);
                tryApplyDirective(element, directiveNameEl, applyEl);
            }
        },
    
        linkJsAndDom = function (startElement=document.body) {
            walkTheDomElements(startElement, tryApplyDirectives);
        };
    
    // we return a public interface that can be used in the program
    return Object.freeze({
        vr: variables,  /* variables shared between UI and program. var is a reserved keyword*/
        el: elements, // preselected elements, basically a short cut for getElementBy...()
        fx: functions,  //object to be filled by user defined functions 
        // fx is where dom99 will look for , for data-fx,
        templateRender, // render a clone of template alive
        forgetScope,  // forget scope
        linkJsAndDom // initialization function
    });
}());
// make it available for browserify style imports
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = dom99;
}
/*Additional Explanations to understand dom99.js file :

custom attribute names must start with "data-" see
https://docs.webplatform.org/wiki/html/attributes/data-* */