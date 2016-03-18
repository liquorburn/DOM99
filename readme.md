#DOM99

##What is DOM99 ?

DOM99 is a JavaScript framework to ease the interaction between the HTML and your program. You can preselect DOM nodes, add event listeners and synchronize UI elements and JavaScript variables, populate HTML templates with data and insert it in the document.

##Why use DOM99 ?

DOM99 encourages you to build the link between the UI and your business logic in a declarative way. You can learn how to use DOM99 in less than 15 minutes. DOM99 doesn't force you to structure your code in a certain manner. DOM99 is ultra fast, the source file is small, has no external dependency and is written respecting modern ES2015 and HTML5 standards.
 
Also if you want to teach people JavaScript, without having to spend too much time explaining the gimmicks of the native DOM interface, DOM99 is for you. It is very beginner friendly yet powerful.


##How to use DOM99 ?

###The Basics

###In your HTML :

DOM99 will browse the DOM and react if an element has one of the following attributes

* data-99-vr : **vr for variable**: data binding between DOM element and js variable
* data-99-el : **el for element**: pre-selecting an element for later usage
* data-99-fx : **fx for function** adds an event listener to that element

Examples:

    <input data-99-vr="b" type="text">
    <nav data-99-el="myNav">Navigation Links</nav>
    <button data-99-fx="click-deleteFoto">Delete Foto</button>
            
The general syntax is 

`<tag data-99-Keyword="details" > bla bla </tag>`

If you are not using browserify you need to include this script tag in your html **before** other scripts that access dom99.

    <script src="js/dom99.js"></script>
    <script src="js/yourJavascriptFile.js"></script>
    


###In your JavaScript code :

    //Store your functions in the dom99.fx object

    dom99.fx.functionName = aFunction;

aFunction is called when you click this button

    <button data-99-fx="click-functionName">Action</button>
    //Note we wrote functionName not aFunction

to start using dom99 use this statement as late as possible

    dom99.linkJsAndDom(); 

To changes the text of `<p data-99-vr="talkings"></p>` and all other element that share the variable talkings


    dom99.vr.talkings = "Hi";

Use the same data-99-vr="talkings" on `<input>` elements for two way data bindings


To use a preselected element

    dom99.el.bigTitle //An element reference, we can do what we want with it
    dom99.el.bigTitle.remove(); //for instance remove the bigTitle node

will remove `<h1 data-99-el="bigTitle">You can remove me to make space</h1>`


To inject template clones in your Document

    <body>
    <template data-99-el="templateName">
        <div data-99-el="SemanticName">
        
            <p data-99-vr="text" ></p>
            Any HTML ...
        </div>
    </template>
    ...
    <div data-99-el="target"></div>
    </body>
    
    // JS
    // 1 create clone and execute directives
    let clone = dom99.templateRender( "templateName", "scopeName" );
    
    // 2 populate the clone with any data and more
    dom99.vr["scopeName"]["text"] = "Anything I want";
    
    // 3 insert the clone in the DOM
    dom99.el["target"].appendChild(clone);
    
    
    
   
   
Detailed explanations soon, see example in the Demo for now


You are ready to use DOM99 ! 

###Complete overview

coming soon !

 
##Demo file:

(Tested with Firefox 47+)
[Open demo](http://rawgit.com/GrosSacASac/DOM99/master/index.html)

##Known issues:

All previously known issues are fixed now. Clear.

##Details

You can handle new HTML with `DOM99.linkJsAndDom(startNode);`. Already processed nodes won't be affected at all because the ☀ is added to the attribute value after that.

###Transpile to ES5

If you target older browsers, I recommend you to transpile dom99 to es5 compatible code. Here are the steps

  1. Download node.js at https://nodejs.org/en/
  2. Open the node.js command prompt and go in the directory with the dom99.js file
  3. Download Babel, find out how at http://babeljs.io/docs/usage/cli/.
  4. Use this command `babel dom99.js -o dom99.es5.js`
  5. Now use dom99.es5.js in your production.

##Alternatives comparisons with Contra, Pro , some similarities

###Angular.js

Pro:

  * More features
  * Easily Testable
  * More browser compatibility
  
Contra:

  * Learning curve: wall
  * Forced to organize code base in the Angular MVC way
  * Logic in Markup
  * Heavy components for simple UIs
  * Heavier
    
Some similarities:

  * Declarative Markup
  * Shared variables are normal js objects


###React

Pro:

  * Easier to understand what is happening in large code bases
  * React native (still a thing ?)
  * More browser compatibility
  
Contra:

  * Encouraged to use JSX, a JavaScript extension syntax
  * Can be hard to understand how and why to use react
  * Forced V-V model
    
Some similarities:

  * Elegantly populate templates with data 
  * Focus on the view
  * Simple by design
 

###jQuery

Pro:

  * Imperative instructions are easy to understand
  * Beginner friendly
  * Best old browser compatibility
  * Also a non-UI library
  * One of the best things that happened in the Web Platform
  
Contra:

  * Not obvious how organize large code in a clean way
  * Can do almost everything as easily with browser APIs nowadays
    
Some similarities:

  * Freedom
  * Can be used alongside other JavaScript view frameworks
  * Simple


###Others

There are many other projects that will help you write client side applications. All have their advantages/problems. It will take you weeks/month maybe even years to browse them all and compare them. You have to make a choice at some point.

##History

The first version of DOM99 was created by Cyril Walle (GrosSacASac) in late 2015 for JavaScript teaching purposes to people with a designer background. It was easy to let them play with their first functions and see result on the web page just by assigning the result in a JS variable. It took away all the headaches about DOM manipulation. It was written in ES2015 code and transpiled to ES5.

In march 2016 I decided to share DOM99 after heavy code changes on Github and NPM in its own repository instead of some sub-folder in some other project.

##Future

###Abstract directions for the future:

 * Freedom
 * Simplicity in system and usage
 * Encourage declarative UI programming models
 
###DOM99 is not and will never be

 * Large library with all utility functions
 * Simplified API for client-server communication
 * A replacement for what CSS does

This leaves more freedom to combine DOM99 with the other needs. I encourage you to use simplified APIs for client-server communication alongside DOM99 and anything else that is complementary to accelerate the development process.

###Discussion

####Chat

https://dystroy.org/miaou/3

####Issues reports

https://github.com/GrosSacASac/DOM99/issues

##License

MIT
