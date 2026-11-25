import AppKit
import Foundation
import PDFKit

guard CommandLine.arguments.count == 3 else {
  fputs("Usage: render-pdf.swift input.pdf output-directory\n", stderr)
  exit(1)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let fileManager = FileManager.default

try fileManager.createDirectory(at: outputURL, withIntermediateDirectories: true)

guard let document = PDFDocument(url: inputURL) else {
  fputs("Could not open PDF\n", stderr)
  exit(1)
}

for index in 0..<document.pageCount {
  guard let page = document.page(at: index) else { continue }
  let bounds = page.bounds(for: .mediaBox)
  let scale = min(2400 / bounds.width, 2400 / bounds.height)
  let size = NSSize(width: bounds.width * scale, height: bounds.height * scale)
  let image = page.thumbnail(of: size, for: .mediaBox)

  guard
    let tiff = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiff),
    let data = bitmap.representation(
      using: .jpeg,
      properties: [.compressionFactor: 0.86]
    )
  else { continue }

  let filename = String(format: "fire-vi-page-%02d.jpg", index + 1)
  try data.write(to: outputURL.appendingPathComponent(filename))
}
