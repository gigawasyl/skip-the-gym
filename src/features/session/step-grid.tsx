import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Fitness } from '@/constants/fitness';

export const GRID_COLS = 16;
export const BASE_ROWS = 12;
export const EXTRA_ROWS = 4;
const MIN_DOT = 2;
const MAX_DOT = 10;

export function layoutForCalories(kcal: number): { cols: number; rows: number; filled: number; total: number } {
  const filled = Math.max(0, Math.floor(kcal));
  let rows = BASE_ROWS;
  while (filled >= GRID_COLS * rows) {
    rows += EXTRA_ROWS;
  }

  return { cols: GRID_COLS, rows, filled, total: GRID_COLS * rows };
}

export function StepGrid({ kcal }: { kcal: number }) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const { cols, rows, filled, total } = layoutForCalories(kcal);
  const gap = box.width === 0 ? 8 : Math.max(1, Math.min(8, Math.floor(Math.min(box.width / cols, box.height / rows) * 0.28)));
  const rawDot =
    box.width === 0
      ? MAX_DOT
      : Math.floor(Math.min((box.width - gap * (cols - 1)) / cols, (box.height - gap * (rows - 1)) / rows));
  const dot = Math.max(MIN_DOT, Math.min(MAX_DOT, rawDot));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={
        filled > 0
          ? `${filled} estimated ${filled === 1 ? 'kilocalorie' : 'kilocalories'}`
          : 'No estimated kilocalories yet'
      }
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width !== box.width || height !== box.height) {
          setBox({ width, height });
        }
      }}
      style={styles.grid}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              marginRight: (index + 1) % cols === 0 ? 0 : gap,
              marginBottom: index >= cols * (rows - 1) ? 0 : gap,
              backgroundColor: index < filled ? Fitness.play : Fitness.dim,
            },
          ]}
        />
      ))}
    </View>
  );
}

export const CalorieGrid = memo(StepGrid);

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
  },
  dot: {
    backgroundColor: Fitness.dim,
  },
});
