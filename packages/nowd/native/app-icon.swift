import AppKit
import Foundation

guard CommandLine.arguments.count == 2 else {
  exit(1)
}

let appPath = CommandLine.arguments[1]
let icon = NSWorkspace.shared.icon(forFile: appPath)
icon.size = NSSize(width: 128, height: 128)

guard
  let tiffData = icon.tiffRepresentation,
  let bitmap = NSBitmapImageRep(data: tiffData),
  let pngData = bitmap.representation(using: .png, properties: [:])
else {
  exit(1)
}

print(pngData.base64EncodedString())
