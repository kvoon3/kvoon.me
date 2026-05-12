import AppKit
import ApplicationServices
import Foundation

let notificationCenter = NSWorkspace.shared.notificationCenter

var workspaceObserver: NSObjectProtocol?
var accessibilityObserver: AXObserver?
var observedAppElement: AXUIElement?
var observedWindowElement: AXUIElement?

let appNotifications = [
  kAXFocusedWindowChangedNotification,
  kAXMainWindowChangedNotification,
  kAXFocusedUIElementChangedNotification,
]

let windowNotifications = [
  kAXTitleChangedNotification,
  kAXValueChangedNotification,
  kAXSelectedChildrenChangedNotification,
  kAXFocusedUIElementChangedNotification,
]

func emitActivityEvent() {
  print("activity")
  fflush(stdout)
}

func removeWindowObservation() {
  guard
    let accessibilityObserver,
    let currentObservedWindowElement = observedWindowElement
  else {
    return
  }

  for notification in windowNotifications {
    AXObserverRemoveNotification(
      accessibilityObserver,
      currentObservedWindowElement,
      notification as CFString
    )
  }

  observedWindowElement = nil
}

func addNotification(
  _ notification: String,
  to element: AXUIElement,
  using observer: AXObserver
) -> Bool {
  let result = AXObserverAddNotification(
    observer,
    element,
    notification as CFString,
    nil
  )

  return result == .success || result == .notificationAlreadyRegistered
}

func observeFocusedWindowTitle() {
  guard
    let accessibilityObserver,
    let observedAppElement
  else {
    return
  }

  removeWindowObservation()

  var focusedWindow: CFTypeRef?
  let focusedWindowResult = AXUIElementCopyAttributeValue(
    observedAppElement,
    kAXFocusedWindowAttribute as CFString,
    &focusedWindow
  )

  guard
    focusedWindowResult == .success,
    let focusedWindow
  else {
    return
  }

  let windowElement = focusedWindow as! AXUIElement
  var registeredAnyNotification = false
  for notification in windowNotifications {
    if addNotification(notification, to: windowElement, using: accessibilityObserver) {
      registeredAnyNotification = true
    }
  }

  if registeredAnyNotification {
    observedWindowElement = windowElement
  }
}

let accessibilityCallback: AXObserverCallback = { _, _, notification, _ in
  let notificationName = notification as String

  if notificationName == kAXFocusedWindowChangedNotification as String
    || notificationName == kAXMainWindowChangedNotification as String
  {
    observeFocusedWindowTitle()
  }

  emitActivityEvent()
}

func observeFrontmostApplication() {
  if let accessibilityObserver {
    let source = AXObserverGetRunLoopSource(accessibilityObserver)
    CFRunLoopRemoveSource(CFRunLoopGetMain(), source, .defaultMode)
  }

  accessibilityObserver = nil
  observedAppElement = nil
  observedWindowElement = nil

  guard let app = NSWorkspace.shared.frontmostApplication else {
    return
  }

  var nextObserver: AXObserver?
  let observerResult = AXObserverCreate(app.processIdentifier, accessibilityCallback, &nextObserver)
  guard observerResult == .success, let nextObserver else {
    return
  }

  let appElement = AXUIElementCreateApplication(app.processIdentifier)
  var registeredAnyNotification = false
  for notification in appNotifications {
    if addNotification(notification, to: appElement, using: nextObserver) {
      registeredAnyNotification = true
    }
  }

  guard registeredAnyNotification else {
    return
  }

  accessibilityObserver = nextObserver
  observedAppElement = appElement

  CFRunLoopAddSource(
    CFRunLoopGetMain(),
    AXObserverGetRunLoopSource(nextObserver),
    .defaultMode
  )

  observeFocusedWindowTitle()
}

workspaceObserver = notificationCenter.addObserver(
  forName: NSWorkspace.didActivateApplicationNotification,
  object: nil,
  queue: nil
) { _ in
  observeFrontmostApplication()
  emitActivityEvent()
}

observeFrontmostApplication()
print("ready")
fflush(stdout)
RunLoop.main.run()

if let workspaceObserver {
  notificationCenter.removeObserver(workspaceObserver)
}
