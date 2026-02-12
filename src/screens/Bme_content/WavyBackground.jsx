import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const SVG_WIDTH = 400;
const SVG_HEIGHT = 200;
const PRIMARY = "#075cab";


export const TopWavyBackground = ({ height = 120 }) => (
  <View style={{ height, width: '100%' }}>
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.06" />
          <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
        </LinearGradient>
        <LinearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.06" />
        </LinearGradient>
        <LinearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.22" />
          <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.12" />
        </LinearGradient>
      </Defs>

      {/* Only show top half of wave */}
    
<Path
  d="M0 160 Q140 230 280 160 T560 160 V0 H0 Z"
  fill="url(#g1)"
/>


<Path
  d="M0 145 Q120 220 240 145 T480 145 V0 H0 Z"
  fill="url(#g2)"
/>


<Path
  d="M0 130 Q100 205 200 130 T400 130 T600 130 V0 H0 Z"
  fill="url(#g3)"
/>

    </Svg>
  </View>
);

export const BottomWavyBackground = ({ height = 120 }) => (
  <View style={{ height, width: '100%', borderRadius:20,overflow: "hidden",  }}>
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="b1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.06" />
          <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
        </LinearGradient>
        <LinearGradient id="b2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.06" />
        </LinearGradient>
        <LinearGradient id="b3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.22" />
          <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.12" />
        </LinearGradient>
      </Defs>

      {/* Only show bottom half of same wave */}
      <Path
        d="M0 110 Q140 180 280 110 T560 110 V200 H0 Z"
        fill="url(#b1)"
      />
      <Path
        d="M0 95 Q120 170 240 95 T480 95 V200 H0 Z"
        fill="url(#b2)"
      />
      <Path
        d="M0 80 Q100 155 200 80 T400 80 T600 80 V200 H0 Z"
        fill="url(#b3)"
      />
    </Svg>
  </View>
);
