#!/bin/bash

# Create icons directory if it doesn't exist
mkdir -p /home/th1kh/reddit_jp/frontend/public/icons

# Generate PNG icons from SVG
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    echo "Creating ${size}x${size} icon..."
    # Create a simple colored square as placeholder
    convert -size ${size}x${size} xc:'#DC2626' \
            -fill white \
            -font DejaVu-Sans-Bold \
            -pointsize $((size * 60 / 100)) \
            -gravity center \
            -annotate +0+0 'い' \
            "/home/th1kh/reddit_jp/frontend/public/icons/icon-${size}x${size}.png"
done

echo "Icons generated successfully!"