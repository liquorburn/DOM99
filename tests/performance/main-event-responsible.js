import {d, plugin} from "../../source/dom99-perf.js";
import {parentIdFromEvent} from "../../source/parentIdFromEvent.js";

var startTime;
var lastMeasure;
var startMeasure = function(name) {
    startTime = performance.now();
    lastMeasure = name;
}

var stopMeasure = function() {
    var last = lastMeasure;
    if (lastMeasure) {
        setTimeout(function () {
            lastMeasure = null;
            var stop = performance.now();
            var duration = 0;
            console.log(last+" took "+(stop-startTime));
        }, 0);
    }
}

function _random(max) {
    return Math.round(Math.random()*1000)%max;
}

class Store {
    constructor() {
        this.data = [];
        this.backup = null;
        this.selected = null;
        this.id = 1;
    }
    buildData(count = 1000) {
        // returns an array of data
        var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
        var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
        var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        var data = [];
        for (var i = 0; i < count; i++)
            data.push({id: this.id++, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
        return data;
    }
	
    updateData(mod = 10) {
        // updates all 10th data
        for (let i=0;i<this.data.length;i+=10) {
            this.data[i].label += ' !!!';
            // this.data[i] = Object.assign({}, this.data[i], {label: this.data[i].label +' !!!'});
        }
    }
	
    delete(id) {
        // deletes a data by id
        const idx = this.data.findIndex(d => d.id==id);
        this.data = this.data.filter((e,i) => i!=idx);
        return this;
    }
	
    run() {
        this.data = this.buildData();
        this.selected = null;
    }
	
    add() {
        this.data = this.data.concat(this.buildData(1000));
        this.selected = null;
    }
	
    update() {
        this.updateData();
        this.selected = null;
    }
	
    select(id) {
        this.selected = id;
    }
	
    // hideAll() {
        // this.backup = this.data;
        // this.data = [];
        // this.selected = null;
    // }
    // showAll() {
        // this.data = this.backup;
        // this.backup = null;
        // this.selected = null;
    // }
	
    runLots() {
        this.data = this.buildData(10000);
        this.selected = null;
    }
	
    clear() {
        this.data = [];
        this.selected = null;
    }
	
    swapRows() {
        if(this.data.length > 998) {
            var a = this.data[1];
            this.data[1] = this.data[998];
            this.data[998] = a;
        }
    }
}



var store = new Store();
var start = 0;
var rows = [];
var data = [];
var selectedRowElement = undefined;



var updateRows = function () {
    d.feed("rows", store.data);
};

var run = function () {
    startMeasure("run");
    unselect();
    store.run();
    updateRows();
    stopMeasure();
};

var add = function () {
    startMeasure("add");
    unselect();
    store.add();
    updateRows();
    stopMeasure();
};

var runLots = function () {
    startMeasure("runLots");
    unselect();
    store.runLots();
    updateRows();
    stopMeasure();
};

var update = function () {
    startMeasure("update");
    store.update();
    updateRows();
    stopMeasure();
}

var clear = function () {
    startMeasure("clear");
    unselect();
    store.clear();
    updateRows();
    stopMeasure();
};

var swapRows = function () {
    startMeasure("swapRows");
    let old_selection = store.selected;
    unselect();
    store.swapRows();
    updateRows();
    if (old_selection >= 0) {
        let index = store.data.findIndex(d => d.id === old_selection);
        const rowPath = d.contextFromArray(["rows", String(index), "row"]);
        const rowToSelected = d.elements[rowPath];
        store.select(old_selection);
        select(rowToSelected);
    }
    stopMeasure();
};

var deleteRow = function (e) {
    e.preventDefault();
    e.stopPropagation();
    let context = d.contextFromEvent(e);
    let idContext = d.contextFromArray([context, "id"]);
    let id = d.variables[idContext];

    startMeasure("delete");
    store.delete(id);
    d.feed("rows", store.data);
    stopMeasure();
};

var unselect = function () {
    if (selectedRowElement !== undefined) {
        selectedRowElement.className = "";
        selectedRowElement = undefined;
    }
};

var select = function (elementToSelect) {
    if (elementToSelect !== undefined) {
        elementToSelect.className = "danger";
        selectedRowElement = elementToSelect;
    }
};

var selectRow = function (e) {
    e.preventDefault();
    e.stopPropagation();
    startMeasure("select");
    unselect();
    let context = d.contextFromEvent(e);
    let rowContext = d.contextFromArray([context, "row"]);
    let rowElement = d.elements[rowContext];
    let rowIndexContext = d.contextFromArray([context, "id"]);
    let rowIndex = d.variables[rowIndexContext];
    let index = Number(rowIndex);

    store.select(index);
    select(rowElement);
    stopMeasure();
};

const handleClickTable  = function (event) {
			
		event.preventDefault();
		event.stopPropagation();
	const id = parentIdFromEvent(event);
	const elementAttribute = event.target.getAttribute("data-element");
	console.log(elementAttribute);
	console.log(id);
	if (elementAttribute.includes("delete")) {
		startMeasure("delete");
		store.delete(id);
		console.log(store.data.length);
		d.feed("rows", store.data);
		stopMeasure();
	} else if (elementAttribute.includes("select")) {
		startMeasure("select");
		unselect();
		let rowContext = d.contextFromArray(["rows", id, "row"]);
		let rowElement = d.elements[rowContext];
		store.select(id);
		select(rowElement);
		stopMeasure();
	} else {
		console.log("clicked outside");
	}
};

var functions = {
	handleClickTable,
    delegate: function (e) {
        // console.log("delegate");
        if (e.target.matches('#add')) {
            e.preventDefault();
            //console.log("add");
            add();
        }
        else if (e.target.matches('#run')) {
            e.preventDefault();
            //console.log("run");
            run();
        }
        else if (e.target.matches('#update')) {
            e.preventDefault();
            //console.log("update");
            update();
        }
        // else if (e.target.matches('#hideall')) {
            // e.preventDefault();
            // console.log("hideAll");
            // hideAll();
        // }
        // else if (e.target.matches('#showall')) {
            // e.preventDefault();
            // console.log("showAll");
            // showAll();
        // }
        else if (e.target.matches('#runlots')) {
            e.preventDefault();
            //console.log("runLots");
            runLots();
        }
        else if (e.target.matches('#clear')) {
            e.preventDefault();
            //console.log("clear");
            clear();
        }
        else if (e.target.matches('#swaprows')) {
            e.preventDefault();
            //console.log("swapRows");
            swapRows();
        }

    }
};
const childContext = function (context) {
	return context.split(">").pop();
};
// plugin({type: "cloned",
	// plugin: function (context) {
		// problem goes out of sync , because feed reuses the elements
		// const id = childContext(context);// would be the current index of the array
		// const realId = d.variables[d.contextFromArray([context, "id"])];
		// d.elements[d.contextFromArray([context, 'row'])].setAttribute('data-id', realId);
	// }
// });
plugin({type: "variable",
	plugin: function (startPath, data) {
		console.log(startPath);
		console.log(data);
		if (startPath.startsWith("rows")) {
				d.elements[d.contextFromArray([startPath, 'row'])].setAttribute('data-id', data.id);
		}
	}
});

var initialFeed = {};
var startElement = document.body;
d.start(functions, initialFeed, startElement, function () {
    // console.log("ready");
    // run();
});
window.d = d;