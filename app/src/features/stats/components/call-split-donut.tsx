import { cssInterop } from 'nativewind';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import type { TalkTotalsStats } from '../api/stats.api';

const StyleableCircle = cssInterop(Circle, {
  className: {
    target: true,
    nativeStyleToProp: { stroke: true },
  },
});

const donutGeometry = {
  viewBoxSize: 120,
  centerPosition: 60,
  ringRadius: 48,
  ringStrokeWidth: 14,
};

type DonutSegment = {
  direction: 'outgoing' | 'incoming';
  strokeClassName: string;
  strokeDasharray: [number, number];
  rotationDegrees: number;
};

function getDonutSegments(talkTotals: TalkTotalsStats): DonutSegment[] {
  const fullCircleDegrees = 360;
  const ringStartDegrees = -90;
  const percentDenominator = 100;
  const donutCircumference: number = 2 * Math.PI * donutGeometry.ringRadius;
  const outgoingArcLength: number =
    (donutCircumference * talkTotals.outgoing_percent) / percentDenominator;
  const incomingArcLength: number =
    (donutCircumference * talkTotals.incoming_percent) / percentDenominator;
  const incomingStartDegrees: number =
    ringStartDegrees + (fullCircleDegrees * talkTotals.outgoing_percent) / percentDenominator;
  const donutSegments: DonutSegment[] = [
    {
      direction: 'outgoing',
      strokeClassName: 'stroke-primary',
      strokeDasharray: [outgoingArcLength, donutCircumference],
      rotationDegrees: ringStartDegrees,
    },
    {
      direction: 'incoming',
      strokeClassName: 'stroke-accent',
      strokeDasharray: [incomingArcLength, donutCircumference],
      rotationDegrees: incomingStartDegrees,
    },
  ];
  return donutSegments;
}

type CallSplitDonutProps = {
  talkTotals: TalkTotalsStats;
  totalMinutesLabel: string;
};

function CallSplitDonut({ talkTotals, totalMinutesLabel }: CallSplitDonutProps) {
  const donutSegments: DonutSegment[] = getDonutSegments(talkTotals);
  return (
    <View className="mt-4 items-center">
      <View className="relative h-36 w-36">
        <Svg
          viewBox={`0 0 ${donutGeometry.viewBoxSize} ${donutGeometry.viewBoxSize}`}
          width="100%"
          height="100%"
          accessibilityRole="image"
          accessibilityLabel="Donut chart of outgoing versus incoming talk minutes"
        >
          {donutSegments.map(donutSegment => (
            <StyleableCircle
              key={donutSegment.direction}
              cx={donutGeometry.centerPosition}
              cy={donutGeometry.centerPosition}
              r={donutGeometry.ringRadius}
              fill="none"
              strokeWidth={donutGeometry.ringStrokeWidth}
              className={donutSegment.strokeClassName}
              strokeDasharray={donutSegment.strokeDasharray}
              transform={`rotate(${donutSegment.rotationDegrees} ${donutGeometry.centerPosition} ${donutGeometry.centerPosition})`}
            />
          ))}
        </Svg>
        <View className="absolute inset-0 flex-col items-center justify-center">
          <Text className="text-xl font-bold tabular-nums tracking-tight">{totalMinutesLabel}</Text>
          <Text className="text-[11px] text-muted-foreground">total min</Text>
        </View>
      </View>
    </View>
  );
}

export { CallSplitDonut };
