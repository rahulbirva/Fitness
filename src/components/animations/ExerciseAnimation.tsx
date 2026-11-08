import React from 'react';
import { PushupAnimation } from './PushupAnimation';
import { SquatAnimation } from './SquatAnimation';
import { PlankAnimation } from './PlankAnimation';
import { LungeAnimation } from './LungeAnimation';
import { CrunchAnimation } from './CrunchAnimation';
import { BicepCurlAnimation } from './BicepCurlAnimation';
import { ShoulderPressAnimation } from './ShoulderPressAnimation';
import { RowAnimation } from './RowAnimation';
import { GluteBridgeAnimation } from './GluteBridgeAnimation';
import { LegRaiseAnimation } from './LegRaiseAnimation';

interface ExerciseAnimationProps {
  exerciseId: string;
  width?: number;
  height?: number;
}

export function ExerciseAnimation({ exerciseId, width, height }: ExerciseAnimationProps) {
  switch (exerciseId) {
    case 'pushup':
    case 'bench_press':
      return <PushupAnimation width={width} height={height} />;
    case 'squat':
      return <SquatAnimation width={width} height={height} />;
    case 'plank':
      return <PlankAnimation width={width} height={height} />;
    case 'lunge':
      return <LungeAnimation width={width} height={height} />;
    case 'crunch':
      return <CrunchAnimation width={width} height={height} />;
    case 'bicep_curl':
      return <BicepCurlAnimation width={width} height={height} />;
    case 'shoulder_press':
      return <ShoulderPressAnimation width={width} height={height} />;
    case 'db_row':
      return <RowAnimation width={width} height={height} />;
    case 'glute_bridge':
      return <GluteBridgeAnimation width={width} height={height} />;
    case 'leg_raise':
      return <LegRaiseAnimation width={width} height={height} />;
    case 'pullup':
    case 'lat_pulldown':
    case 'tricep_dip':
    case 'rdl':
      // Return matching animation or fallback
      return <PushupAnimation width={width} height={height} />;
    default:
      return null;
  }
}
