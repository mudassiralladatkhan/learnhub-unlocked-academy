// Add missing type definitions for recharts
declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';

  // Define common component props for charts
  interface CommonProps {
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  // Specific component interfaces
  export interface BarChartProps extends CommonProps {
    data?: any[];
    layout?: 'horizontal' | 'vertical';
    barCategoryGap?: number | string;
    barGap?: number | string;
    barSize?: number;
    maxBarSize?: number;
  }

  export interface PieChartProps extends CommonProps {
    data?: any[];
    startAngle?: number;
    endAngle?: number;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
  }

  export interface PieProps extends CommonProps {
    data?: any[];
    dataKey?: string;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    minAngle?: number;
    paddingAngle?: number;
    nameKey?: string;
    valueKey?: string;
    labelLine?: boolean | object | React.ReactElement | React.ComponentType<any>;
    label?: boolean | object | React.ReactElement | React.ComponentType<any> | ((props: any) => React.ReactNode);
    activeIndex?: number | number[];
    activeShape?: object | React.ReactElement | React.ComponentType<any>;
    fill?: string;
    children?: React.ReactNode;
  }

  export interface CellProps {
    fill?: string;
    stroke?: string;
  }

  export interface LegendProps {
    content?: React.ReactElement | React.ComponentType<any>;
    formatter?: (value: any, entry: any, index: number) => React.ReactNode;
    iconSize?: number;
    iconType?: 'plainline' | 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    payload?: Array<{
      value: any;
      id?: string;
      type?: string;
      color?: string;
      payload?: any;
      name?: string;
    }>;
    wrapperStyle?: object;
    chartWidth?: number;
    chartHeight?: number;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  export interface XAxisProps {
    dataKey?: string;
    xAxisId?: string | number;
    width?: number;
    height?: number;
    orientation?: 'top' | 'bottom';
    tick?: boolean | object | React.ReactElement | React.ComponentType<any>;
    tickLine?: boolean | object | React.ReactElement | React.ComponentType<any>;
    axisLine?: boolean | object;
    label?: string | number | React.ReactElement | React.ComponentType<any>;
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    angle?: number;
    textAnchor?: string;
  }

  export interface YAxisProps {
    dataKey?: string;
    yAxisId?: string | number;
    width?: number;
    height?: number;
    orientation?: 'left' | 'right';
    tick?: boolean | object | React.ReactElement | React.ComponentType<any>;
    tickLine?: boolean | object | React.ReactElement | React.ComponentType<any>;
    axisLine?: boolean | object;
    label?: string | number | React.ReactElement | React.ComponentType<any>;
    domain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
    tickFormatter?: (value: any) => string;
  }

  export interface TooltipProps {
    content?: React.ReactElement | React.ComponentType<any>;
    formatter?: (value: any, name: string, props: any) => React.ReactNode;
    labelFormatter?: (label: any) => React.ReactNode;
    itemStyle?: object;
    contentStyle?: object;
    labelStyle?: object;
    wrapperStyle?: object;
    cursor?: boolean | object | React.ReactElement;
    active?: boolean;
    coordinate?: { x: number; y: number };
    payload?: Array<{ name: string; value: any; payload: any }>;
    label?: string | number;
  }

  export interface BarProps {
    dataKey: string;
    fill?: string;
    radius?: number | [number, number, number, number];
    animationDuration?: number;
  }

  // Declare component types
  export const BarChart: ComponentType<BarChartProps>;
  export const PieChart: ComponentType<PieChartProps>;
  export const Bar: ComponentType<BarProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const ResponsiveContainer: ComponentType<{
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    aspect?: number;
    children?: ReactNode;
  }>;
}
