const ink = require("@gnd/ink")
const React = require("react");
const { _extends } = require("../utils");
const Scrollbar = require("./scrollbar");
const e = React.createElement;

/**
 * ScrollBox onSizeChange function
 * @callback OnSizeChangeFunction
 * @param {number} height
 * @param {number} scrollMaxX
 * @param {number} scrollMaxY
 */

/**
 * @typedef {Object} ScrollBoxTypes
 * @property {boolean} [arrows] To display arrows on scrollbars.
 * @property {"auto" | "hidden" | "scroll"} [overflow] If scrollbars should appear auto, not at all, or always.
 * @property {"auto" | "hidden" | "scroll"} [overflowX] Set scrolling mode specifically for the x-axis.
 * @property {"auto" | "hidden" | "scroll"} [overflowY] Set scrolling mode specifically for the y-axis.
 * @property {import("../types").Color} [scrollbarColor] Colour of the scrollbars.
 * @property {number} [maxHeight] MaxHeight of the scrollbox as a number.
 * @property {number} [maxWidth] MaxWidth of the scrollbox as a number. Currently not implemented.
 * @property {OnSizeChangeFunction} [onSizeChange] Function called on size changes.
 * @property {*} [containerRef] Ref to access the scroll container, which holds the content but not scrollbars.
 * 
 * @typedef {Omit<ink.BoxProps, "overflow"> & ScrollBoxTypes} ScrollBoxProps
 */

/**
 * Scrollable box component. EXPERIMENTAL.
 * This code is a mess and there are a lot of work arounds. It works for my uses.
 * To reduce flickering, much of the logic is calculated in a single render.
 * I had issues with the suggestion box getting out of sync when I had multiple renders :(
 * Recommend turning off xaxis scrolling if not needed.
 * @extends React.PureComponent<ScrollBoxProps>
 */
class ScrollBox extends React.PureComponent{
    /**
     * @param {ScrollBoxProps} props 
     */
    constructor(props){
        super(props);

        this.scrollbarWidth = 1;

        //references
        this.outerRef = React.createRef();
        this.containerRef = this.props.containerRef || React.createRef();
        this.contentRef = React.createRef();

        //we handle height internally to be able to have a maxheight prop
        var initialHeight = this.props.height;
        var initialWidth = this.props.width;
        //if maxheight, enable grow. we need to set to a min vs shrinking to avoid intermediate renders
        if(this.props.maxHeight) initialHeight = this.props.minHeight;
        if(this.props.maxWidth) initialWidth = this.props.minWidth;

        this.state = {
            displayScrollbarX: "none",
            displayScrollbarY: "none",
            scrollMaxX:0,
            scrollMaxY:0,
            scrollX:0,
            scrollY:0,
            visablePercentX:1,
            visablePercentY:1,
            internalHeight: initialHeight,
            internalWidth: initialWidth,
        }
    }

    get overflowX(){
        return this.props.overflowX ? this.props.overflowX : this.props.overflow;
    }

    get overflowY(){
        return this.props.overflowY ? this.props.overflowY : this.props.overflow;
    }

    /**
     * Do all the dynamic stuff here. Shared by didMount and didUpdate.
     */
    onUpdate(prevProps, prevState, prevSnape){
        const {visablePercentX, visablePercentY, displayScrollbarX, displayScrollbarY, scrollMaxX, scrollMaxY, scrollY, scrollX} = this.state;
        const {maxHeight, minHeight} = this.props;

        //measure container and content
        if(!this.containerRef.current || !this.contentRef.current || !this.outerRef.current) return;
        var container = ink.measureElement(this.containerRef.current);
        var content = ink.measureElement(this.contentRef.current);
        var outer = ink.measureElement(this.outerRef.current);

        var tmpState = {
            scrollX: scrollX,
            scrollY: scrollY,
            container:container,
            content:content,
            outer:outer,
            displayScrollbarX: displayScrollbarX,
            displayScrollbarY: displayScrollbarY,
            scrollbarWidth: this.scrollbarWidth,
            maxHeight:maxHeight,
            minHeight:minHeight,
            scrollMaxX: scrollMaxX,
            scrollMaxY: scrollMaxY,
            visablePercentX:visablePercentX,
            visablePercentY:visablePercentY
        }

        tmpState = this.setScrollbarX(tmpState, "none");
        tmpState = this.setScrollbarY(tmpState, "none");

        tmpState = this.calculateScrollMax(tmpState);
        tmpState = this.calculateSize(tmpState);
        tmpState = this.calculateScrollMax(tmpState);
        tmpState = this.calculateScrollbars(tmpState);
        tmpState = this.calculateSize(tmpState);
        tmpState = this.calculateScrollMax(tmpState);
        tmpState = this.calculateScrollbars(tmpState);

        
        tmpState.scrollMaxX = Math.max(0, tmpState.scrollMaxX);
        tmpState.scrollMaxY = Math.max(0, tmpState.scrollMaxY);

        if(tmpState.scrollX > tmpState.scrollMaxX) tmpState.scrollX = tmpState.scrollMaxX;
        if(tmpState.scrollY > tmpState.scrollMaxY) tmpState.scrollY = tmpState.scrollMaxY;

        tmpState.visablePercentX = Math.min(Math.max(0, container.width / content.width), 1);
        tmpState.visablePercentY = Math.min(Math.max(0, container.height / content.height), 1);

        this.setState({
            scrollY: tmpState.scrollY,
            scrollX: tmpState.scrollX,
            scrollMaxX: tmpState.scrollMaxX,
            scrollMaxY: tmpState.scrollMaxY,
            displayScrollbarX: tmpState.displayScrollbarX,
            displayScrollbarY: tmpState.displayScrollbarY,
            internalHeight: tmpState.outer.height,
            visablePercentX:tmpState.visablePercentX,
            visablePercentY:tmpState.visablePercentY
        })
    }

    calculateScrollMax(state){
        state.scrollMaxX = state.content.width - state.container.width;
        state.scrollMaxY = state.content.height - state.container.height;
        return state;
    }

    calculateScrollbars(state){
        if(this.overflowX === "scroll"){
            state = this.setScrollbarX(state, "flex");
        }
        else if(this.overflowX === "hidden" || state.scrollMaxX <= 0){
            state = this.setScrollbarX(state, "none");
        }
        else{
            state = this.setScrollbarX(state, "flex");
        }
        state = this.calculateScrollMax(state);
        if(this.overflowY === "scroll") state = this.setScrollbarY(state, "flex");
        else if(this.overflowY === "hidden" || state.scrollMaxY <= 0){
            state = this.setScrollbarY(state, "none");
        }
        else{
            state = this.setScrollbarY(state, "flex");
        }
        state = this.calculateScrollMax(state);
        if(this.overflowX === "scroll") state = this.setScrollbarX(state, "flex");
        else if(this.overflowX === "hidden" || state.scrollMaxX <= 0){
            state = this.setScrollbarX(state, "none");
        }
        else{
            state = this.setScrollbarX(state, "flex");
        }
        state = this.calculateScrollMax(state);

        if(state.scrollMaxX === state.scrollbarWidth && state.scrollMaxY === state.scrollbarWidth && state.displayScrollbarX === "flex" && state.displayScrollbarY === "flex"){
            state = this.setScrollbarY(state, "none");
            state = this.setScrollbarX(state, "none");
            state = this.calculateScrollMax(state);
        }

        return state;
    }

    calculateSize(state){
        if(state.maxHeight){
            var newHeight = state.outer.height + state.scrollMaxY;
            newHeight = Math.max(Math.min(newHeight, state.maxHeight), state.minHeight);
            var difference = newHeight - state.outer.height;
            state.outer.height = newHeight;
            state.container.height += difference;
        }
        return state;
    }

    setScrollbarY(state, value){
        if(state.displayScrollbarY === "none" && value === "flex"){
            state.container.width -= state.scrollbarWidth;
        }
        else if(state.displayScrollbarY === "flex" && value === "none"){
            state.container.width += state.scrollbarWidth;
        }
        state.displayScrollbarY = value;
        return state;
    }

    setScrollbarX(state, value){
        if(state.displayScrollbarX === "none" && value === "flex"){
            state.container.height -= state.scrollbarWidth;
        }
        else if(state.displayScrollbarX === "flex" && value === "none"){
            state.container.height += state.scrollbarWidth;
        }
        state.displayScrollbarX = value;
        return state;
    }

    componentDidMount(){
        this.onUpdate();
    }

    componentDidUpdate(prevProps, prevState, prevSnap){
        const {scrollMaxX, scrollMaxY, internalHeight} = this.state;
        //if height changes, update internal height
        if(prevProps.height !== this.props.height){
            if(!this.props.maxHeight){
                this.setState({
                    internalHeight: this.props.height
                })
            }
        }
        //if width changes, update internal width
        if(prevProps.width !== this.props.width){
            if(!this.props.maxWidth){
                this.setState({
                    internalWidth: this.props.width,
                })
            }
        }

        if(prevState.scrollMaxY !== scrollMaxY || prevState.initialHeight !== internalHeight){
            if(typeof this.props.onSizeChange === "function") this.props.onSizeChange(internalHeight, scrollMaxX, scrollMaxY);
        }

        //timeout to handle measure
        setTimeout(() => {
            this.onUpdate(prevProps, prevState, prevSnap);
        }, 30);
    }

    setScrollY(newScrollY){
        var {scrollMaxY} = this.state;
        scrollMaxY = Math.max(0, scrollMaxY);
        if(newScrollY < 0) newScrollY = 0;
        else if(newScrollY > scrollMaxY) newScrollY = scrollMaxY;
        
        this.setState({
            scrollY:newScrollY
        });

        return newScrollY;
    }

    setScrollX(newScrollX){
        var {scrollMaxX} = this.state;
        scrollMaxX = Math.max(0, scrollMaxX);
        if(newScrollX < 0) newScrollX = 0;
        else if(newScrollX > scrollMaxX) newScrollX = scrollMaxX;
        
        this.setState({
            scrollX:newScrollX
        });

        return newScrollX;
    }


    render(){
        const {
            internalHeight, internalWidth, 
            scrollY, scrollX, scrollMaxY, scrollMaxX, 
            displayScrollbarX, displayScrollbarY, 
            visablePercentX, visablePercentY
        } = this.state;

        const {
            flexDirection,
            overflow,
            arrows,
            scrollbarColor,
            children,
            ...props
        } = this.props;

        const scrollPercentX = scrollX/scrollMaxX;
        const scrollPercentY = scrollY/scrollMaxY;

        

        const outerProps = {
            ref: this.outerRef,
            width: internalWidth,
            height: internalHeight,
        }

        /**
         * @type {ink.BoxProps & any}
         */
        const containerProps = {
            ref: this.containerRef,
            overflow: "hidden",
            flexGrow: 1,
            alignItems:"flex-start"
        }


        const contentProps = {
            ref: this.contentRef,
            flexDirection:flexDirection,
            flexShrink:0,
            flexGrow:1,
            marginTop: -scrollY,
            marginLeft: -scrollX,
        }

        return e(ink.Box, _extends(outerProps, props),
            //row 
            e(ink.Box, {flexDirection:"row", flexGrow:1},
                //column
                e(ink.Box, {flexGrow:1, flexDirection:"column"},
                    //container
                    e(ink.Box, containerProps, 
                        //content
                        e(ink.Box, contentProps, children)
                    ),
                    e(Scrollbar, {display: displayScrollbarX, arrows:arrows, color:scrollbarColor, visablePercent:visablePercentX, scrollPercent:scrollPercentX})
                ),
                e(Scrollbar, {direction:"vertical", display: displayScrollbarY, arrows:arrows, color:scrollbarColor, visablePercent:visablePercentY, scrollPercent:scrollPercentY})
            )
        );
    }
}
/**
 * @type {ScrollBoxProps}
 */
ScrollBox.defaultProps = {
    overflow:"auto",
    overflowX:undefined,
    overflowY:undefined,
    arrows: true,
    scrollbarColor: "white",
    minHeight: 1,
    minWidth:1,
}

/**
 * Handled ScrollBox Props
 * @typedef {Object} HandledScrollBoxTypes
 * @property {boolean} [isFocused] If ScrollBox is accepting input.
 * 
 * @typedef {ScrollBoxProps & HandledScrollBoxTypes} HandledScrollBoxProps
 */

/**
 * A ScrollBox with input handled (arrow keys to scroll).
 * @type {HandledScrollBoxProps>}
 */
const HandledScrollBox = ({
    isFocused = true,
    children,
    ...props
}) => {

    const scrollBoxRef = React.useRef();
    const [scrollY, setScrollY] = React.useState(0);
    const [scrollX, setScrollX] = React.useState(0);

    ink.useInput((input, key)=>{
        if(key.upArrow){
            let newScrollY = scrollY - 1;
            newScrollY = scrollBoxRef.current.setScrollY(newScrollY);
            setScrollY(newScrollY);
            return;
        }
        if(key.downArrow){
            let newScrollY = scrollY + 1;
            newScrollY = scrollBoxRef.current.setScrollY(newScrollY);
            setScrollY(newScrollY);
            return;
        }
        if(key.leftArrow){
            let newScrollX = scrollX - 1;
            newScrollX = scrollBoxRef.current.setScrollX(newScrollX);
            setScrollX(newScrollX);
            return;
        }
        if(key.rightArrow){
            let newScrollX = scrollX + 1;
            newScrollX = scrollBoxRef.current.setScrollX(newScrollX);
            setScrollX(newScrollX);
            return;
        }
    }, {isActive:isFocused})

    return e(ScrollBox, _extends({ref:scrollBoxRef}, props),
        children,
    )
}

module.exports.ScrollBox = ScrollBox;
module.exports.HandledScrollBox = HandledScrollBox;