import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ColorPicker({ id, value, onChange }) {
  const [color, setColor] = useState(value || '#000000');
  
  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };
  
  // List of predefined colors for quick selection
  const presetColors = [
    // Hair colors
    '#000000', '#8B4513', '#D2B48C', '#F5DEB3', '#A52A2A',
    '#DC143C', '#FF4500', '#FF8C00', '#FFD700', '#ADFF2F',
    // Eye colors
    '#0000FF', '#4B0082', '#006400', '#4B5320', '#00CED1',
    // Skin tones 
    '#FFDAB9', '#F5DEB3', '#D2B48C', '#CD853F', '#8B4513', 
    '#A0522D', '#6B4226', '#3B2F2F'
  ];
  
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger className="w-8 h-8 rounded-full border-2 border-gray-200" style={{ backgroundColor: color }}>
          <span className="sr-only">Pick a color</span>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setColor(presetColor);
                    onChange(presetColor);
                  }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
            <Input
              id={id}
              type="color"
              value={color}
              onChange={handleChange}
              className="w-full h-10"
            />
          </div>
        </PopoverContent>
      </Popover>
      <Input type="text" value={color} onChange={handleChange} className="w-24 text-xs" />
    </div>
  );
}