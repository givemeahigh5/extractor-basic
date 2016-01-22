
var React = require('react');
var ReactDOM = require('react-dom');


var INPUT = {
    drip: {
        water: { id: "water", text: "Water (g)", min: "200", max: "490", step: "1", init: "345" },
        coffee: { id: "coffee", text: "Coffee (g)", min: "10", max: "35", step: "0.1", init: "22.5" },
        tds: { id: "tds", text: "TDS (%)", min: "1", max: "2", step: "0.01", init: "1.4" },
        absorption: { id: "absorption", text: "Absorption (g/g)", min: "1", max: "3", step: "0.01", init: "2.1" },
        yield: { init: null}
    },
    immersion: {
        water: { id: "water", text: "Water (g)", min: "250", max: "550", step: "1", init: "350" },
        coffee: { id: "coffee", text: "Coffee (g)", min: "10", max: "35", step: "0.1", init: "25" },
        tds: { id: "tds", text: "TDS (%)", min: "1", max: "2", step: "0.01", init: "1.4" },
        absorption: { id: "absorption", text: "Absorption (g/g)", min: "1.5", max: "3.5", step: "0.01", init: "2.5" },
        yield: { init: null}
    },
    espresso: {
        water: { init: null},
        coffee: { id: "coffee", text:"Coffee (g)", min: "10", max: "25", step: "0.1", init: "18" },
        tds: { id: "tds", text: "TDS (%)", min: "7", max: "15", step: "0.01", init: "10" },
        absorption: { id: "absorption", text: "Absorption (g/g)", min: "1", max: "3", step: "0.01", init: "1.2" },
        yield: { id: "yield", text: "Yield (g)", min: "20", max: "50", step: "0.1", init: "36" }
    }
};

var OUTPUT = {
    ratio: { id: "ratio", text: "Brew Ratio" },
    yield: { id: "yield", text: "Yield" },
    extraction: { id: "extraction", text: "Extraction" }
};


var BREWTYPEVALUES = [
    { id: "drip", name: "Drip" },
    { id: "immersion", name: "Immersion" },
    { id: "espresso", name: "Espresso" }
];




var ExtractionWidget = React.createClass({
    getInitialState: function() {
        var brewType_ = "drip";
        var water_ = INPUT[brewType_].water.init;
        var coffee_ = INPUT[brewType_].coffee.init;
        var tds_ = INPUT[brewType_].tds.init;
        var absorption_ = INPUT[brewType_].absorption.init;
        var yieldIn_ = INPUT[brewType_].yield.init;

        return {
            brewType: brewType_,
            water: water_,
            coffee: coffee_,
            tds: tds_,
            absorption: absorption_,
            yieldIn: yieldIn_,
            ratio: this.calculateRatio(water_, coffee_),
            yieldOut: this.calculateYield(water_, coffee_, tds_, absorption_),
            extraction: this.calculateExtraction(water_, coffee_, tds_, absorption_),
            showBrewTypeMenu: false
        }
    },

    onUpdate: function(field, val) {
        field = field == "yield" ? "yieldIn" : field;

        obj = {};
        obj[field] = val;

        this.setState(obj, function() {
            this.setOutput(this.state.brewType, this.state.water, this.state.coffee, this.state.tds, this.state.absorption, this.state.yieldIn);
        });
    },

    onUpdateArrow: function(field, step, direction) {
        field = field == "yield" ? "yieldIn" : field;
        var val = parseFloat(this.state[field]);

        obj = {};
        obj[field] = Math.round((val + step * (direction == "up" ? 1 : -1)) * parseFloat(1/step)) / parseFloat(1/step);

        this.setState(obj, function() {
            this.setOutput(this.state.brewType, this.state.water, this.state.coffee, this.state.tds, this.state.absorption, this.state.yieldIn);
        });
    },

    renderInputs: function(brewType) {
        var params = [];

        switch(brewType) {
            case "drip":
            case "immersion":       params = ["water", "coffee", "tds", "absorption"];
            break;
            case "espresso":        params = ["coffee", "yield", "tds"];
            break;
            default:                params = [];
        }

        var inputs = [];

        for(var i = 0; i < params.length; i++) {
            var stateName = params[i] === "yield" ? "yieldIn" : params[i];
            inputs.push(
                <InputBox
                    key={params[i]}
                    boxValue={this.state[stateName]}
                    structure={INPUT[brewType][params[i]]}
                    onUpdate={this.onUpdate}
                    onUpdateArrow={this.onUpdateArrow} />
            );
        }

        return (<div key="inputs" className="inputs">{inputs}</div>);
    },

    renderOutputs: function(brewType) {
        var params = [];

        switch(brewType) {
            case "drip":
            case "immersion":       params = ["yield", "extraction", "ratio"];
            break;
            case "espresso":        params = ["extraction", "ratio"];
            break;
            default:                params = [];
        }

        var outputs = [];

        for(var i=0; i < params.length; i++) {
            var stateName = params[i] === "yield" ? "yieldOut" : params[i];
            outputs.push(<OutputBox key={params[i]} boxValue={this.state[stateName]} structure={OUTPUT[params[i]]} />);
        }

        return (<div key="outputs" className="outputs">{outputs}</div>);
    },

    render: function() {

        var outputs = this.renderOutputs(this.state.brewType);
        var inputs = this.renderInputs(this.state.brewType);

        return (
            <div>
                <div id="title">
                    <div className="holder">
                        <div className="section">Extractor</div>
                        <div className="section">
                            <BrewTypeSelectorButton brewType={this.state.brewType} showBrewTypeMenu={this.state.showBrewTypeMenu} toggleBrewTypeMenu={this.toggleBrewTypeMenu} />
                        </div>
                    </div>
                </div>
                <BrewTypeMenu data={BREWTYPEVALUES} brewType={this.state.brewType} selectBrewType={this.selectBrewType} showBrewTypeMenu={this.state.showBrewTypeMenu} />
                <div id="content">
                    {outputs}
                    {inputs}
                </div>
            </div>
        )
    },

    setInputDefaults: function(brewType_) {
        this.setState({
            water: INPUT[brewType_].water.init,
            coffee: INPUT[brewType_].coffee.init,
            tds: INPUT[brewType_].tds.init,
            absorption: INPUT[brewType_].absorption.init,
            yieldIn: INPUT[brewType_].yield.init
        }, function() {
            this.setOutput(brewType_, this.state.water, this.state.coffee, this.state.tds, this.state.absorption, this.state.yieldIn);
        });
    },

    setOutput: function(brewType_, water_, coffee_, tds_, absorption_, yield_) {
        if(brewType_ == "espresso") {
            this.setState({
                ratio: this.calculateRatio2(coffee_, yield_),
                yieldOut: yield_,
                extraction: this.calculateExtraction2(coffee_, yield_, tds_)
            });
        }
        else {
            this.setState({
                ratio: this.calculateRatio(water_, coffee_),
                yieldOut: this.calculateYield(water_, coffee_, tds_, absorption_),
                extraction: this.calculateExtraction(water_, coffee_, tds_, absorption_)
            });
        }
    },

    toggleBrewTypeMenu: function() {
        this.setState({ showBrewTypeMenu: !this.state.showBrewTypeMenu});
    },

    selectBrewType: function(brewType_) {
        this.setState({
            brewType: brewType_,
            showBrewTypeMenu: false
        });
        this.setInputDefaults(brewType_);
    },

    calculateRatio: function(water, coffee) {
        var ratio = Math.round(10 * water / coffee) / 10;
        return ratio.toFixed(1);
    },

    calculateRatio2: function(coffee, yieldIn) {
        var ratio = Math.round(1000 * coffee / yieldIn) / 10;
        return ratio.toFixed(1)+"%";
    },

    calculateYield: function(water, coffee, tds, absorption) {
        var newTDS = tds * (1.0535 + (tds - 1) / 100);
        var output = Math.round((water - (absorption * coffee * .952)) * (1 + (newTDS / 100)));
        return output+"g";
    },

    calculateExtraction: function(water, coffee, tds, absorption) {
        var newTDS = tds * (1.0535 + (tds - 1) / 100);
        var extraction = Math.round(100 * newTDS * (water - (absorption * coffee * .952)) / coffee) / 100;
        return extraction.toFixed(2)+"%";
    },

    calculateExtraction2: function(coffee, yieldIn, tds) {
        //var adjustedTDS = tds * (1.0535 + (tds - 1) / 100);
        var extraction = Math.round(100 * tds * yieldIn / coffee) / 100;
        return extraction.toFixed(2)+"%";
    }
});


var BrewTypeSelectorButton = React.createClass({

    render: function() {
        return (
            <div className="brew-type-toggle" onClick={this.props.toggleBrewTypeMenu}>
                {this.props.brewType.toUpperCase()}<img className="menu-button-arrow" src="./public/down-arrow.png" />
            </div>
        );
    }
});


var BrewTypeMenu = React.createClass({

    selectBrewType(e) {
        var brewType = e.target.innerHTML.toLowerCase();
        this.props.selectBrewType(brewType);
    },

    render: function() {
        var typeArray = this.props.data;
        var brewTypes = [];

        for(var i = 0; i < typeArray.length; i++) {
            brewTypes.push(<div className="menu-item" key={typeArray[i].id} onClick={this.selectBrewType}>{typeArray[i].name}</div>);
        }

        var displayClass = "brew-type-menu " + (this.props.showBrewTypeMenu ? "show-menu" : "");

        return (
            <div className={displayClass} >
                {brewTypes}
            </div>
        )
    }
});


var InputBox = React.createClass({
    update: function(e) {
        var field = this.props.structure.id;
        var val = e.target.value;
        this.props.onUpdate(field, val);
    },

    clickIncrement() {
        this.props.onUpdateArrow(this.props.structure.id, this.props.structure.step, "up");
    },

    clickDecrement() {
        this.props.onUpdateArrow(this.props.structure.id, this.props.structure.step, "down");
    },

    render: function() {
        return (
            <div>
                <div className="arrow"><img src="./public/big-down-arrow.png" onClick={this.clickDecrement} /></div>
                <div id={this.props.structure.id} className='inputBox'>
                    <input type="text" value={this.props.boxValue} onChange={this.update} onFocus={this.onTextFocus} onBlur={this.onTextBlur} />
                    <div className='sliderbox-title'>{this.props.structure.text}</div>
                </div>
                <div className="arrow"><img src="./public/big-up-arrow.png" onClick={this.clickIncrement} /></div>
            </div>
        );
    },

    onTextFocus: function(event) {
        $(event.target).parent().css("background-color", "#36d1d3");
    },

    onTextBlur: function(event) {
        $(event.target).parent().css("background-color", "#c6c6c6");
    }
});


var OutputBox = React.createClass({
    render: function() {
        return (
            <div id={this.props.structure.id} className='outputBox'>
                <input type="text" value={this.props.boxValue} readOnly />
                <div className='sliderbox-title'>{this.props.structure.text}</div>
            </div>
        )
    }
});


ReactDOM.render(
    <ExtractionWidget />,
    document.getElementById('wrapper')
);
