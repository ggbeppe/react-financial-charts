import * as PropTypes from "prop-types";
import * as React from "react";
import {
    colorToRGBA,
    getStrokeDasharrayCanvas,
    isNotDefined,
    strokeDashTypes,
    GenericComponent,
    getMouseCanvas,
} from "@react-financial-charts/core";

const defaultCustomX = (props: CrossHairCursorProps, moreProps) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX ? Math.round(xScale(xAccessor(currentItem))) : mouseXY[0];
    return x;
};

interface CrossHairCursorProps {
    readonly className?: string;
    readonly customX?: (props: CrossHairCursorProps, moreProps: unknown) => number;
    readonly opacity?: number;
    readonly snapX?: boolean;
    readonly stroke?: string;
    readonly strokeDasharray?: strokeDashTypes;
}

export class CrossHairCursor extends React.Component<CrossHairCursorProps> {
    public static defaultProps = {
        className: "react-financial-charts-crosshair",
        customX: defaultCustomX,
        opacity: 0.8,
        snapX: true,
        stroke: "#37474F",
        strokeDasharray: "Dash",
    };

    public static contextTypes = {
        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
    };

    public render() {
        return (
            <GenericComponent
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const lines = this.getLines(this.props, moreProps);
        if (lines === undefined) {
            return;
        }

        const { margin, ratio } = this.context;
        const originX = 0.5 * ratio + margin.left;
        const originY = 0.5 * ratio + margin.top;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
        ctx.translate(originX, originY);

        lines.forEach((line) => {
            const dashArray = getStrokeDasharrayCanvas(line.strokeDasharray);

            ctx.strokeStyle = colorToRGBA(line.stroke, line.opacity);
            ctx.lineWidth = 1;
            ctx.setLineDash(dashArray);
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        });

        ctx.restore();
    };

    private readonly getLines = (props: CrossHairCursorProps, moreProps) => {
        const { mouseXY, currentItem, show, height, width } = moreProps;

        const {
            customX = CrossHairCursor.defaultProps.customX,
            stroke = CrossHairCursor.defaultProps.stroke,
            opacity,
            strokeDasharray,
        } = props;

        if (!show || isNotDefined(currentItem)) {
            return undefined;
        }

        const line1 = {
            x1: 0,
            x2: width,
            y1: mouseXY[1] + 0.5,
            y2: mouseXY[1] + 0.5,
            stroke,
            strokeDasharray,
            opacity,
        };

        const x = customX(props, moreProps);

        const line2 = {
            x1: x,
            x2: x,
            y1: 0,
            y2: height,
            stroke,
            strokeDasharray,
            opacity,
        };
        return [line1, line2];
    };
}
