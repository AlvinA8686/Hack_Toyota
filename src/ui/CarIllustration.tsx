import React from 'react';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Original vector vehicle artwork. Generic SUV silhouette, not a model photograph. */
export function CarIllustration({ width = 300, height = 160, color = '#A9B6AB' }: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 540 260" accessibilityLabel="Illustration of a Toyota-style SUV">
      <Defs>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#D5DED3" /><Stop offset="0.4" stopColor={color} /><Stop offset="1" stopColor="#718378" /></LinearGradient>
        <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#4A605D" /><Stop offset="1" stopColor="#172D2C" /></LinearGradient>
        <LinearGradient id="bonnet" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#D7E1D4" /><Stop offset="1" stopColor={color} /></LinearGradient>
        <LinearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F5F7F4" /><Stop offset="0.45" stopColor="#9AA8A4" /><Stop offset="1" stopColor="#667572" /></LinearGradient>
      </Defs>
      <Ellipse cx="278" cy="225" rx="219" ry="13" fill="#172522" opacity="0.09" />
      <Ellipse cx="290" cy="223" rx="185" ry="7" fill="#172522" opacity="0.07" />
      <Path d="M73 122 103 83Q112 69 145 66L284 60Q305 60 323 73L377 111 461 124Q479 128 482 147L486 178 474 201 414 213 101 203 58 184 60 148Q62 128 73 122Z" fill="url(#body)" stroke="#596F65" strokeWidth="2" />
      <Path d="M99 87Q111 74 144 72L284 67Q302 67 317 78L351 108 96 117Z" fill="url(#glass)" />
      <Path d="M111 85Q120 79 144 78L181 77 177 112 97 114Z" fill="#5F7670" />
      <Path d="M190 76 245 74 257 109 187 112Z" fill="#38514B" />
      <Path d="M255 73 285 72Q300 72 312 82L346 108 267 109Z" fill="#314D46" />
      <Path d="M108 86 315 81" stroke="#A4B8AB" strokeWidth="2" opacity="0.45" />
      <Path d="M120 64 275 58 305 63" stroke="#40574E" strokeWidth="5" strokeLinecap="round" />
      <Path d="M120 65 120 71M268 60 269 66" stroke="#53695E" strokeWidth="4" />
      <Path d="M354 110 378 114 461 128 435 143 296 132Z" fill="url(#bonnet)" />
      <Path d="M63 140 280 137 436 149" stroke="#E0E7DA" strokeWidth="2" opacity="0.7" />
      <Path d="M60 179 102 191 413 197 484 173 474 202 415 216 103 207 61 188Z" fill="#354B42" />
      <Path d="M67 185 100 195 413 202 473 187" fill="none" stroke="#9EAEA2" strokeWidth="3" />
      <Path d="M184 119 178 186M267 116 279 188" stroke="#6F8477" strokeWidth="1.5" />
      <Path d="M113 123 102 174M309 132 327 174" stroke="#6F8477" strokeWidth="1.2" />
      <Path d="M198 128 218 128M278 130 296 132" stroke="#344B40" strokeWidth="4" strokeLinecap="round" />
      <Path d="M308 109 329 108Q339 109 341 118L319 123 308 117Z" fill={color} stroke="#657A70" strokeWidth="1.5" />
      <Path d="M431 151 477 141 480 172 438 183Z" fill="#243A32" stroke="#7D9182" strokeWidth="2" />
      <Path d="M441 158 474 150M441 166 475 158M442 174 475 166" stroke="#5B7064" strokeWidth="3" />
      <Path d="M425 143 474 133 479 143 430 155 415 153Z" fill="#F5F4DE" />
      <Path d="M426 147 470 137" stroke="#FDFDF4" strokeWidth="3" />
      <Path d="M63 133 84 128 81 145 61 148Z" fill="#A73535" />
      <Path d="M67 135 81 133" stroke="#F78775" strokeWidth="2" />
      <Path d="M73 199Q70 158 107 151Q144 149 155 197" fill="#24392F" />
      <Path d="M318 206Q318 163 356 158Q393 158 403 205" fill="#24392F" />
      <G transform="translate(114 192) rotate(-8)">
        <Ellipse rx="34" ry="37" fill="#1E2926" /><Ellipse rx="25" ry="28" fill="#44524D" /><Ellipse rx="20" ry="24" fill="url(#metal)" />
        <Path d="M-3-21 3-21 5-5 18-12 21-7 8 2 20 11 17 16 3 8 0 22-5 21-6 7-18 13-21 7-9 0-18-13-13-17-3-7Z" fill="#485951" />
        <Ellipse rx="6" ry="7" fill="#B9C5BD" /><Ellipse rx="2" ry="3" fill="#62746B" />
      </G>
      <G transform="translate(361 200) rotate(-8)">
        <Ellipse rx="35" ry="39" fill="#1E2926" /><Ellipse rx="26" ry="30" fill="#44524D" /><Ellipse rx="21" ry="25" fill="url(#metal)" />
        <Path d="M-3-23 3-23 5-6 19-13 22-7 9 2 21 12 17 17 3 9 0 23-5 22-6 8-19 14-22 7-10 0-19-14-13-18-3-8Z" fill="#485951" />
        <Ellipse rx="6" ry="7" fill="#B9C5BD" /><Ellipse rx="2" ry="3" fill="#62746B" />
      </G>
      <Path d="M424 191 469 180 468 190 427 202Z" fill="#C5CFC3" />
      <Rect x="445" y="176" width="23" height="9" rx="2" fill="#DCE2D5" transform="rotate(-14 445 176)" />
    </Svg>
  );
}
